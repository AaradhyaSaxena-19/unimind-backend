"""
UniMind AI  |  Step 9b: A teacher uploads a question paper (typed OR scanned PDF)

What it does:
  1. Logs in as the teacher (so the Step 9a locks apply: only YOUR subjects work)
  2. Reads the paper:
        - typed PDF   -> reads the text inside it
        - scanned PDF -> turns each page into a picture and lets a Groq vision model read it
  3. Splits it into separate questions (section, unit, topic, marks)
  4. Shows you every question so you can CHECK it
  5. Only if you type y: saves the PDF (private storage) and the questions (database)

File name rule:  <SUBJECTCODE>_<YEAR>.pdf   for example   BNC501_2026.pdf

Run it with:
    python upload_paper.py Papers\\BNC501_2026.pdf
    python upload_paper.py Papers\\BNC501_2026.pdf --replace    (upload it again)
    python upload_paper.py Papers\\BNC501_2026.pdf --vision     (force picture reading)
"""

import argparse
import base64
import io
import json
import os
import re
import sys

from dotenv import load_dotenv
from groq import Groq
from pypdf import PdfReader
from supabase import create_client

try:  # make sure all characters print correctly on Windows
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

MIN_TEXT_CHARS = 300        # fewer characters than this means the PDF is a scan
MAX_TEXT_FOR_AI = 24000     # how much typed text we send to Groq
MAX_PAGES = 8               # safety limit for picture reading
BUCKET = "question-papers"
TEACHER_EMAIL = "teacher1@example.com"


# ---------------------------------------------------------------------
# PART 1: Read the file name and the PDF
# ---------------------------------------------------------------------
def parse_filename(path):
    """BNC501_2026.pdf  ->  ('BNC501', 2026)"""
    name = os.path.basename(path)
    match = re.match(r"^([A-Za-z]{2,5}\d{3,4})_(\d{4})\.pdf$", name)
    if not match:
        return None
    return match.group(1).upper(), int(match.group(2))


def read_pdf_text(path):
    """Return all the typed text found inside the PDF (empty for a scanned picture PDF)."""
    reader = PdfReader(path)
    pages = [(page.extract_text() or "") for page in reader.pages]
    return "\n".join(pages).strip()


def render_pages(path):
    """Turn every PDF page into a small JPEG picture (base64 text) for the vision model."""
    try:
        import pypdfium2 as pdfium
    except ImportError:
        print("The picture-reading step needs one more library. Run:  pip install pypdfium2")
        sys.exit(1)
    pdf = pdfium.PdfDocument(path)
    total = len(pdf)
    if total > MAX_PAGES:
        print(f"This PDF has {total} pages; only the first {MAX_PAGES} will be read.")
    images = []
    for index in range(min(total, MAX_PAGES)):
        picture = pdf[index].render(scale=2.0).to_pil().convert("RGB")
        buffer = io.BytesIO()
        picture.save(buffer, "JPEG", quality=85)
        images.append(base64.b64encode(buffer.getvalue()).decode("ascii"))
    return images


# ---------------------------------------------------------------------
# PART 2: Groq splits the paper into questions
# ---------------------------------------------------------------------
RULES = """Return ONLY a JSON array (no explanation, no markdown). Each item must have exactly
these keys:
  "section":       the paper section letter such as "A", "B" or "C", or null if not clear
  "unit":          the syllabus unit number as an integer ONLY if the paper clearly states a
                   unit, otherwise null (do NOT use the CO column as the unit)
  "topic":         a short standard topic name (2 to 5 words, Title Case)
  "marks":         the marks of that ONE question as an integer, or null if not clear
  "question_text": the full question text, cleaned and spelled correctly

Rules:
- Every lettered part (a., b., c. ...) is a SEPARATE question, including the alternatives of
  "attempt any one" choices.
- Marks: a section header such as "02 x 7 = 14" or "07 x 3 = 21" means each question in that
  section carries the FIRST number (2 marks, or 7 marks).
- Ignore headers, footers, barcodes, roll number boxes, page numbers, websites, the CO and
  Level columns, and exam instructions.
- Do NOT invent questions or marks. If something is unclear use null.
- The topic must describe what THIS question is actually about (for example "Constituent
  Assembly" for a question about the Constituent Assembly). Never copy a topic from a different
  subject just because the section looks similar. Avoid vague topics like "Indian Constitution".
- Existing topic names already used for this subject: {topics}
  Reuse one of them EXACTLY when the question fits it; otherwise create a new short topic name.
"""

TEXT_PROMPT = """You are helping a university teacher organise a past exam paper.
Subject: {subject}
Exam year: {year}

Split the question paper text below into separate questions.
""" + RULES + """
QUESTION PAPER TEXT:
{text}
"""

VISION_PROMPT = """You are helping a university teacher organise a past exam paper.
Subject: {subject}
Exam year: {year}

The attached picture is page {page} of {pages} of the scanned question paper. Read ALL the
questions on this page and split them into separate questions.
{carry}""" + RULES


def strip_thinking(text):
    """Remove <think>...</think> notes some models write before their answer."""
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE).strip()


def clean_questions(raw_reply):
    """Turn Groq's reply into a clean list of question dicts (or raise ValueError)."""
    raw_reply = strip_thinking(raw_reply)
    start, end = raw_reply.find("["), raw_reply.rfind("]")
    if start == -1 or end == -1 or end < start:
        raise ValueError("no JSON list found")
    items = json.loads(raw_reply[start:end + 1])
    if not isinstance(items, list):
        raise ValueError("JSON is not a list")

    def to_int(value):
        try:
            return int(float(str(value).strip()))
        except (TypeError, ValueError):
            return None

    cleaned = []
    for item in items:
        if not isinstance(item, dict):
            continue
        text = str(item.get("question_text") or "").strip()
        if not text:
            continue
        section = str(item.get("section") or "").strip().upper()[:1] or None
        if section is not None and not section.isalpha():
            section = None
        topic = str(item.get("topic") or "").strip()[:80] or "Unclassified"
        cleaned.append({
            "section": section,
            "unit": to_int(item.get("unit")),
            "topic": topic,
            "marks": to_int(item.get("marks")),
            "question_text": text[:1500],
        })
    return cleaned


def fill_missing_sections(questions):
    """A page with no section header continues the previous section, so copy it forward."""
    last = None
    for q in questions:
        if q["section"]:
            last = q["section"]
        elif last:
            q["section"] = last
    return questions


def ask_for_questions(groq_client, model, messages, extra=None):
    """Ask Groq once; if the answer is not a valid JSON list, ask one more time."""
    for attempt in (1, 2):
        reply = groq_client.chat.completions.create(
            model=model, messages=messages, temperature=0.1, max_tokens=8000,
            **({"extra_body": extra} if extra else {}))
        content = reply.choices[0].message.content or ""
        try:
            return clean_questions(content)
        except (ValueError, json.JSONDecodeError):
            if attempt == 2:
                raise
            messages = messages + [
                {"role": "assistant", "content": content or "(empty)"},
                {"role": "user", "content": "That was not a valid JSON array. "
                                            "Return ONLY the JSON array, nothing else."},
            ]


def extract_questions(groq_client, model, subject_name, year, text, existing_topics):
    """Typed PDF: read the text."""
    prompt = TEXT_PROMPT.format(
        subject=subject_name, year=year,
        topics=", ".join(existing_topics) if existing_topics else "(none yet)",
        text=text[:MAX_TEXT_FOR_AI])
    return fill_missing_sections(
        ask_for_questions(groq_client, model, [{"role": "user", "content": prompt}]))


def extract_questions_from_images(groq_client, model, subject_name, year, images,
                                  existing_topics, progress=print):
    """Scanned PDF: one page picture at a time, then join the results."""
    topics = ", ".join(existing_topics) if existing_topics else "(none yet)"
    all_questions = []
    for number, image in enumerate(images, start=1):
        progress(f"  reading page {number} of {len(images)} ...")
        last_section = next((q["section"] for q in reversed(all_questions) if q["section"]), None)
        carry = (f"The previous page ended in Section {last_section}. Questions on this page "
                 f"that have no section header continue that section.\n") if last_section else ""
        prompt = VISION_PROMPT.format(subject=subject_name, year=year, page=number,
                                      pages=len(images), topics=topics, carry=carry)
        messages = [{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image}"}},
        ]}]
        # reasoning_effort "none" = plain reading, faster and cheaper for this job
        page_questions = ask_for_questions(groq_client, model, messages,
                                           extra={"reasoning_effort": "none"})
        all_questions += fill_missing_sections(page_questions)
        topics = ", ".join(sorted({q["topic"] for q in all_questions}
                                  | set(existing_topics or []))) or "(none yet)"
    return fill_missing_sections(all_questions)


# ---------------------------------------------------------------------
# PART 3: Save the PDF and the questions (the locks decide if it is allowed)
# ---------------------------------------------------------------------
def remove_old_upload(client, subject_id, year):
    """For --replace: delete the earlier upload of the same paper (its questions go with it)."""
    old = client.table("knowledge_documents").select("id,file_url").eq(
        "subject_id", subject_id).eq("exam_year", year).eq(
        "category", "aktu_paper").execute().data
    for doc in old:
        if doc.get("file_url"):
            try:
                client.storage.from_(BUCKET).remove([doc["file_url"]])
            except Exception:
                pass
        client.table("knowledge_documents").delete().eq("id", doc["id"]).execute()
    return len(old)


def save_paper(client, teacher_id, subject, year, pdf_path, text, questions):
    storage_path = f"{subject['code']}/{os.path.basename(pdf_path)}"
    with open(pdf_path, "rb") as file:
        client.storage.from_(BUCKET).upload(
            path=storage_path, file=file.read(),
            file_options={"content-type": "application/pdf"})

    doc_id = None
    try:
        doc = client.table("knowledge_documents").insert({
            "title": f"{subject['name']} {year} question paper",
            "category": "aktu_paper",
            "subject_id": subject["id"],
            "exam_year": year,
            "semester": subject["semester"],
            "file_url": storage_path,
            "extracted_text": text,
            "status": "approved",
            "uploaded_by": teacher_id,
        }).execute().data[0]
        doc_id = doc["id"]

        rows = [{
            "document_id": doc_id,
            "subject_id": subject["id"],
            "exam_year": year,
            "section": q["section"],
            "unit": q["unit"],
            "topic": q["topic"],
            "marks": q["marks"],
            "question_text": q["question_text"],
        } for q in questions]
        client.table("exam_questions").insert(rows).execute()
    except Exception:
        # Do not leave half-saved data behind
        if doc_id:
            client.table("knowledge_documents").delete().eq("id", doc_id).execute()
        try:
            client.storage.from_(BUCKET).remove([storage_path])
        except Exception:
            pass
        raise
    return storage_path


def show_review(questions):
    print(f"\nGroq found {len(questions)} questions. Please CHECK them:\n")
    for number, q in enumerate(questions, start=1):
        marks = f"{q['marks']} marks" if q["marks"] is not None else "marks ?"
        unit = f"Unit {q['unit']}" if q["unit"] is not None else "Unit ?"
        section = f"Sec {q['section']}" if q["section"] else "Sec ?"
        preview = q["question_text"].replace("\n", " ")
        preview = preview[:90] + ("..." if len(preview) > 90 else "")
        print(f"{number:>2}. [{section} | {unit} | {marks}] {q['topic']}")
        print(f"      {preview}")


def edit_topics(questions, ask=input, say=print):
    """Let the teacher fix a wrong topic by typing the question number."""
    while True:
        choice = ask("\nWrong topic? Type the question number to fix it "
                     "(or just press Enter if all topics are fine): ").strip()
        if not choice:
            return
        if not choice.isdigit() or not (1 <= int(choice) <= len(questions)):
            say(f"Please type a number from 1 to {len(questions)}, or press Enter.")
            continue
        number = int(choice)
        new_topic = ask(f"New topic for question {number} (2 to 5 words): ").strip()
        if new_topic:
            questions[number - 1]["topic"] = new_topic[:80]
            say(f"  {number}. now has the topic: {questions[number - 1]['topic']}")


# ---------------------------------------------------------------------
# PART 4: Put it all together
# ---------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Upload a question paper PDF")
    parser.add_argument("pdf", help="path to the PDF, named like BNC501_2026.pdf")
    parser.add_argument("--replace", action="store_true",
                        help="delete the earlier upload of this paper first")
    parser.add_argument("--vision", action="store_true",
                        help="read the pages as pictures even if the PDF has text")
    args = parser.parse_args()

    load_dotenv()
    url, key = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    vision_model = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")
    password = os.getenv("TEACHER_PASSWORD")
    missing = [n for n, v in [("SUPABASE_URL", url), ("SUPABASE_KEY", key),
                              ("GROQ_API_KEY", groq_key), ("TEACHER_PASSWORD", password)] if not v]
    if missing:
        print("Missing in your .env file:", ", ".join(missing))
        sys.exit(1)

    if not os.path.isfile(args.pdf):
        print("I cannot find that file:", args.pdf)
        sys.exit(1)
    parsed = parse_filename(args.pdf)
    if not parsed:
        print("The file name must look like BNC501_2026.pdf "
              "(subject code, underscore, year, no spaces).")
        sys.exit(1)
    code, year = parsed

    print(f"Reading {os.path.basename(args.pdf)} ...")
    text = read_pdf_text(args.pdf)
    scanned = args.vision or len(text) < MIN_TEXT_CHARS
    if scanned:
        print("No typed text found, so this is a scanned paper. "
              f"I will read the pages as pictures with {vision_model}.")
        images = render_pages(args.pdf)
    else:
        print(f"Found {len(text)} characters of typed text.")

    supabase = create_client(url, key)
    try:
        session = supabase.auth.sign_in_with_password(
            {"email": TEACHER_EMAIL, "password": password})
    except Exception as error:
        print("Login failed:", error)
        sys.exit(1)
    teacher_id = session.user.id

    subjects = supabase.table("subjects").select("id,code,name,semester").eq(
        "code", code).execute().data
    if not subjects:
        print(f"There is no subject with code {code} in the database yet.")
        print("Add it first (see the SQL from the previous step), then run this again.")
        sys.exit(1)
    subject = subjects[0]
    print(f"Subject: {subject['name']} ({subject['code']}), semester {subject['semester']}, year {year}")

    existing = supabase.table("knowledge_documents").select("id").eq(
        "subject_id", subject["id"]).eq("exam_year", year).eq(
        "category", "aktu_paper").execute().data
    if existing and not args.replace:
        print(f"A paper for {code} {year} is already uploaded.")
        print("Run again with --replace if you want to upload it again.")
        sys.exit(1)

    topics = sorted({r["topic"] for r in supabase.table("exam_questions").select(
        "topic").eq("subject_id", subject["id"]).execute().data if r.get("topic")})

    print("Asking Groq to split the paper into questions (this can take a minute) ...")
    groq_client = Groq(api_key=groq_key)
    try:
        if scanned:
            questions = extract_questions_from_images(
                groq_client, vision_model, subject["name"], year, images, topics)
        else:
            questions = extract_questions(
                groq_client, model, subject["name"], year, text, topics)
    except Exception as error:
        print("Groq could not produce a usable list of questions:", error)
        sys.exit(1)
    if not questions:
        print("No questions were found in this paper. Nothing was saved.")
        sys.exit(1)

    show_review(questions)
    edit_topics(questions)
    answer = input("\nAre these questions correct? Save them? (y/n): ").strip().lower()
    if answer != "y":
        print("Nothing was saved.")
        return

    if scanned:  # a scanned PDF has no text, so keep the cleaned questions as its text
        text = "\n".join(q["question_text"] for q in questions)

    try:
        if existing and args.replace:
            removed = remove_old_upload(supabase, subject["id"], year)
            print(f"Removed {removed} earlier upload(s).")
        path = save_paper(supabase, teacher_id, subject, year, args.pdf, text, questions)
    except Exception as error:
        print("\nSaving was refused or failed:", error)
        print("Nothing was left half-saved. If it says 'row-level security', check that "
              f"{TEACHER_EMAIL} teaches {code}.")
        sys.exit(1)

    print(f"\nSaved! PDF: {path}  |  {len(questions)} questions stored for {code} {year}.")


if __name__ == "__main__":
    main()