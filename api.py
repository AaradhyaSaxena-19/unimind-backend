"""
UniMind AI  |  Step 10a: Web service (API) for the team's app

WHY THIS EXISTS
  The Groq key is a secret, so the team's app must never hold it. The app logs the person in
  with Supabase (college email + password), then sends that login token to THIS service.
  This service acts as that person (so every database lock still applies), asks Groq when
  needed, and sends back the answer.

WHAT THE TEAM'S APP CAN CALL
  GET  /health                    is the service alive?
  POST /api/chat                  a student asks the personal chatbot
  POST /api/papers/preview        a teacher sends a question paper PDF, gets the questions back
  POST /api/papers/save           the teacher confirms (or corrects) them, and they are saved
Everything else (attendance, fees, marks, assignments, profile, change password ...) the app
reads straight from Supabase, because the database locks already protect it.

Every call (except /health) needs the header:   Authorization: Bearer <login token>

RUN IT:   uvicorn api:app --reload        then open   http://127.0.0.1:8000/docs
"""

import json
import os
import re
import tempfile
import time
from collections import defaultdict, deque
from datetime import date

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel, Field
from supabase import ClientOptions, create_client

import chatbot
import upload_paper
import academic_api
import jobs_api

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")
TEXT_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
VISION_MODEL = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")

# Which websites may call this service. For production, set FRONTEND_ORIGINS in .env,
# for example: FRONTEND_ORIGINS=https://unimind.example.com
ORIGINS = [o.strip() for o in os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://localhost:8080,http://127.0.0.1:8080"
).split(",") if o.strip()]

MAX_PDF_BYTES = 10 * 1024 * 1024  # same limit as the storage folder

app = FastAPI(title="UniMind AI API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(academic_api.router, prefix="/api")
app.include_router(jobs_api.router, prefix="/api")


# ---------------------------------------------------------------------
# Helpers: who is calling, and how often
# ---------------------------------------------------------------------
_calls = defaultdict(deque)


def check_rate(user_id, bucket, limit, window=60):
    """Allow only `limit` calls per `window` seconds per person (protects the Groq budget)."""
    now = time.time()
    recent = _calls[(user_id, bucket)]
    while recent and now - recent[0] > window:
        recent.popleft()
    if len(recent) >= limit:
        raise HTTPException(429, "Too many requests. Please wait a minute and try again.")
    recent.append(now)


def get_user_client(authorization):
    """Return (supabase client acting as the caller, caller's id, caller's role)."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(500, "The service is not configured (SUPABASE_URL / SUPABASE_KEY).")
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing login token.")
    token = authorization.split(" ", 1)[1].strip()
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY, options=ClientOptions(
            headers={"Authorization": f"Bearer {token}"}))
        user_id = client.auth.get_user(jwt=token).user.id
        profile = client.table("profiles").select("role").eq("id", user_id).execute().data
        role = profile[0]["role"]
    except Exception:
        raise HTTPException(401, "Invalid or expired login token.")
    return client, user_id, role


def require_role(role, allowed, what):
    if role not in allowed:
        raise HTTPException(403, f"{what} is only for: {', '.join(allowed)}.")


def get_groq():
    if not GROQ_KEY:
        raise HTTPException(500, "The service is not configured (GROQ_API_KEY).")
    return Groq(api_key=GROQ_KEY)


# ---------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------
# POST /api/chat   (students)
# ---------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)


@app.post("/api/chat")
def chat(request: ChatRequest, authorization: str | None = Header(default=None)):
    client, user_id, role = get_user_client(authorization)
    require_role(role, ["student"], "The personal assistant")
    check_rate(user_id, "chat", limit=20)

    question = request.message.strip()
    if not question:
        raise HTTPException(422, "The message is empty.")

    try:
        facts = chatbot.build_facts(client, user_id)
    except Exception:
        raise HTTPException(500, "Could not read the student's data. Check that all SQL steps ran.")

    # The last few messages of THIS student, read from the database (not from the caller)
    rows = client.table("chat_messages").select("sender,content").eq(
        "student_id", user_id).order("created_at", desc=True).limit(6).execute().data
    history = [{"role": "user" if r["sender"] == "student" else "assistant", "content": r["content"]}
               for r in reversed(rows)]

    chatbot.save_message(client, user_id, "student", question)
    ai_available = True
    try:
        answer = chatbot.ask_groq(get_groq(), TEXT_MODEL, facts, history, question)
    except HTTPException:
        raise
    except Exception:
        # If the AI is down, the student still gets the real numbers
        ai_available = False
        answer = "The AI explanation is not available right now. Here are your numbers:\n\n" + facts
    chatbot.save_message(client, user_id, "bot", answer)
    return {"answer": answer, "ai_available": ai_available}


# ---------------------------------------------------------------------
# POST /api/papers/preview and /api/papers/save   (teachers)
# ---------------------------------------------------------------------
def read_pdf_upload(file):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(400, "Please upload a PDF file.")
    data = file.file.read(MAX_PDF_BYTES + 1)
    if len(data) > MAX_PDF_BYTES:
        raise HTTPException(413, "The PDF is larger than 10 MB.")
    if not data.startswith(b"%PDF"):
        raise HTTPException(400, "This file is not a valid PDF.")
    return data


def find_own_subject(client, user_id, subject_code):
    """The subject must exist AND be taught by the caller."""
    code = subject_code.strip().upper()
    if not re.fullmatch(r"[A-Z]{2,5}\d{3,4}", code):
        raise HTTPException(400, "The subject code must look like BNC501 (no spaces).")
    rows = client.table("subjects").select("id,code,name,semester,teacher_id").eq(
        "code", code).execute().data
    if not rows:
        raise HTTPException(404, f"There is no subject with code {code}.")
    if rows[0]["teacher_id"] != user_id:
        raise HTTPException(403, f"You do not teach {code}.")
    return rows[0]


def check_year(exam_year):
    if not (2000 <= exam_year <= date.today().year + 1):
        raise HTTPException(400, "The exam year looks wrong.")


@app.post("/api/papers/preview")
def papers_preview(file: UploadFile = File(...), subject_code: str = Form(...),
                   exam_year: int = Form(...), authorization: str | None = Header(default=None)):
    client, user_id, role = get_user_client(authorization)
    require_role(role, ["teacher", "admin"], "Uploading question papers")
    check_rate(user_id, "preview", limit=6)
    check_year(exam_year)
    subject = find_own_subject(client, user_id, subject_code)
    data = read_pdf_upload(file)

    with tempfile.TemporaryDirectory() as folder:
        path = os.path.join(folder, f"{subject['code']}_{exam_year}.pdf")
        with open(path, "wb") as handle:
            handle.write(data)
        text = upload_paper.read_pdf_text(path)
        scanned = len(text) < upload_paper.MIN_TEXT_CHARS
        topics = sorted({r["topic"] for r in client.table("exam_questions").select("topic").eq(
            "subject_id", subject["id"]).execute().data if r.get("topic")})
        try:
            if scanned:
                images = upload_paper.render_pages(path)
                questions = upload_paper.extract_questions_from_images(
                    get_groq(), VISION_MODEL, subject["name"], exam_year, images, topics,
                    progress=lambda *_: None)
            else:
                questions = upload_paper.extract_questions(
                    get_groq(), TEXT_MODEL, subject["name"], exam_year, text, topics)
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(502, "The AI could not read this paper. Please try again.")

    if not questions:
        raise HTTPException(422, "No questions were found in this paper.")
    return {"subject": {"code": subject["code"], "name": subject["name"],
                        "semester": subject["semester"]},
            "exam_year": exam_year, "scanned": scanned, "questions": questions}


@app.post("/api/papers/save")
def papers_save(file: UploadFile = File(...), subject_code: str = Form(...),
                exam_year: int = Form(...), questions: str = Form(...),
                replace: bool = Form(False), authorization: str | None = Header(default=None)):
    client, user_id, role = get_user_client(authorization)
    require_role(role, ["teacher", "admin"], "Uploading question papers")
    check_rate(user_id, "save", limit=10)
    check_year(exam_year)
    subject = find_own_subject(client, user_id, subject_code)
    data = read_pdf_upload(file)

    try:  # the teacher may have corrected topics in the app, so clean the list again
        cleaned = upload_paper.clean_questions(questions)
    except (ValueError, json.JSONDecodeError):
        raise HTTPException(400, "The questions are not a valid list.")
    if not cleaned:
        raise HTTPException(400, "There are no questions to save.")

    existing = client.table("knowledge_documents").select("id").eq(
        "subject_id", subject["id"]).eq("exam_year", exam_year).eq(
        "category", "aktu_paper").execute().data
    if existing and not replace:
        raise HTTPException(409, f"A paper for {subject['code']} {exam_year} is already "
                                 "uploaded. Send replace=true to upload it again.")

    with tempfile.TemporaryDirectory() as folder:
        path = os.path.join(folder, f"{subject['code']}_{exam_year}.pdf")
        with open(path, "wb") as handle:
            handle.write(data)
        text = upload_paper.read_pdf_text(path)
        if len(text) < upload_paper.MIN_TEXT_CHARS:  # scanned: keep the question text instead
            text = "\n".join(q["question_text"] for q in cleaned)
        try:
            if existing and replace:
                upload_paper.remove_old_upload(client, subject["id"], exam_year)
            stored = upload_paper.save_paper(client, user_id, subject, exam_year, path, text, cleaned)
        except Exception:
            raise HTTPException(403, "Saving was refused. Check that you teach this subject.")
    return {"saved": True, "questions": len(cleaned), "pdf": stored}