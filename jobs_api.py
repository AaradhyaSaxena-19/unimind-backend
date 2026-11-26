"""
UniMind AI  |  Job Finds API  (/api/jobs)

FLOW
  1. A student uploads a resume  ->  POST /api/jobs/resume/upload
     The file is parsed (PDF / DOCX / TXT / MD) into skills, links and a profile.
  2. The app asks for matches    ->  POST /api/jobs/search
     job_scraper.py scrapes Internshala + Remotive + Arbeitnow + Jobicy +
     Himalayas + RemoteOK + the campus placement board, ranks every opening
     against the resume skills and returns the real application URLs.
  3. "Apply" records the click   ->  POST /api/jobs/apply
     then the browser opens the employer page in a new tab.
  4. Faculty and admin can see the same resume/applications from
     GET /api/jobs/placement/overview, and can post campus drives through
     POST /api/jobs/openings, which every student then sees.

Every endpoint (except openings/overview reads) needs
    Authorization: Bearer <the token returned by /api/academic/auth/login>
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel, Field

import job_scraper
import jobs_store
import resume_parser
from academic_api import ADMIN_STUDENTS, resolve_actor

router = APIRouter(prefix="/jobs", tags=["jobs"])

MAX_RESUME_BYTES = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = (".pdf", ".docx", ".txt", ".md")


# ---------------------------------------------------------------- helpers
def _actor(authorization: Optional[str], roles: Optional[List[str]] = None, what: str = "This action"):
    actor = resolve_actor(authorization)
    if not actor:
        raise HTTPException(401, "Please sign in to use Job Finds.")
    if roles and actor["role"] not in roles:
        raise HTTPException(403, f"{what} is only for: {', '.join(roles)} accounts.")
    return actor


def _student(actor: Dict[str, Any]) -> Dict[str, Any]:
    record = actor.get("record") or {}
    return {
        "student_id": actor["id"],
        "student_name": record.get("name") or actor.get("name") or "Student",
        "roll_no": record.get("roll_no", ""),
        "email": record.get("email", ""),
        "semester": record.get("semester"),
        "section": record.get("section", ""),
    }


def _safe_url(url: str) -> str:
    url = (url or "").strip()
    if not url.lower().startswith(("http://", "https://")):
        raise HTTPException(400, "The job link is not a valid http(s) URL.")
    return url


def _links_for(student_id: str) -> Dict[str, int]:
    apps = jobs_store.list_applications(student_id)
    return {"applications": len(apps)}


def _student_summary(student: Dict[str, Any]) -> Dict[str, Any]:
    resume = jobs_store.get_resume(student["id"])
    apps = jobs_store.list_applications(student["id"])
    try:
        attendance = float(str(student.get("attendance", "0")).replace("%", "") or 0)
    except ValueError:
        attendance = 0.0
    fee_total = float(student.get("fee_total") or 0)
    fee_paid = float(student.get("fee_paid") or 0)
    return {
        "id": student["id"],
        "name": student.get("name"),
        "roll_no": student.get("roll_no"),
        "email": student.get("email"),
        "semester": student.get("semester"),
        "section": student.get("section"),
        "attendance": attendance,
        "cgpa": student.get("cgpa"),
        "pending_fee": max(0.0, fee_total - fee_paid),
        "resume": (
            {
                "file_name": resume.get("file_name"),
                "updated_at": resume.get("updated_at"),
                "skills": resume.get("skills", []),
                "strength": (resume.get("profile") or {}).get("strength", 0),
                "suggested_roles": (resume.get("profile") or {}).get("suggested_roles", []),
            }
            if resume
            else None
        ),
        "applications": len(apps),
        "application_list": apps[:6],
    }


# ------------------------------------------------------------------ models
class JobSearchRequest(BaseModel):
    query: str = Field(default="", max_length=80)
    location: str = Field(default="", max_length=60)
    remote: bool = False
    limit: int = Field(default=30, ge=1, le=60)
    skills: Optional[List[str]] = None


class ApplyRequest(BaseModel):
    job_id: str = Field(default="", max_length=200)
    title: str = Field(min_length=1, max_length=200)
    company: str = Field(default="", max_length=160)
    url: str = Field(min_length=1, max_length=800)
    source: str = Field(default="", max_length=80)
    location: str = Field(default="", max_length=160)
    job_type: str = Field(default="", max_length=80)
    match: int = Field(default=0, ge=0, le=100)


class OpeningRequest(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    company: str = Field(default="", max_length=120)
    location: str = Field(default="", max_length=120)
    job_type: str = Field(default="Full-time", max_length=60)
    salary: str = Field(default="", max_length=80)
    skills: List[str] = Field(default_factory=list)
    description: str = Field(default="", max_length=1200)
    url: str = Field(min_length=1, max_length=800)
    deadline: str = Field(default="", max_length=40)


# ------------------------------------------------------------- resume APIs
@router.get("/overview")
def jobs_overview(authorization: Optional[str] = Header(default=None)):
    """Everything the Job Finds page needs on first paint (no scraping yet)."""
    actor = _actor(authorization)
    openings = jobs_store.list_openings(active_only=True)
    if actor["role"] == "student":
        resume = jobs_store.get_resume(actor["id"])
        apps = jobs_store.list_applications(actor["id"])
        stats = jobs_store.stats()
        return {
            "role": "student",
            "student": _student(actor),
            "resume": resume,
            "applications": apps,
            "openings": openings,
            "activity": jobs_store.activity(12, student_id=actor["id"]),
            "stats": {"applications": len(apps), "openings": len(openings), **stats},
            "can_upload": True,
        }

    students = [_student_summary(student) for student in ADMIN_STUDENTS]
    with_resume = [row for row in students if row["resume"]]
    return {
        "role": actor["role"],
        "viewer": {"name": actor.get("name"), "role": actor["role"]},
        "students": students,
        "resume_backlog": [row for row in students if not row["resume"]],
        "applications": jobs_store.list_applications(),
        "openings": openings,
        "activity": jobs_store.activity(20),
        "stats": {
            "students": len(students),
            "with_resume": len(with_resume),
            "applications": jobs_store.application_count(),
            "openings": len(openings),
            **jobs_store.stats(),
        },
    }


@router.get("/resume")
def get_resume(authorization: Optional[str] = Header(default=None)):
    actor = _actor(authorization, ["student"], "Reading a resume")
    resume = jobs_store.get_resume(actor["id"])
    return {"success": True, "resume": resume}


@router.post("/resume/upload")
def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form(default=""),
    preferred_location: str = Form(default=""),
    authorization: Optional[str] = Header(default=None),
):
    """Parse an uploaded resume, store it and make it visible to faculty + admin."""
    actor = _actor(authorization, ["student"], "Uploading a resume")

    name = (file.filename or "").lower()
    if not name.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(400, "Please upload your resume as a PDF, DOCX, TXT or MD file.")
    data = file.file.read(MAX_RESUME_BYTES + 1)
    if len(data) > MAX_RESUME_BYTES:
        raise HTTPException(413, "The resume is larger than 5 MB. Please compress it and try again.")
    if not data:
        raise HTTPException(400, "The uploaded file is empty.")

    record = actor.get("record") or {}
    try:
        text = resume_parser.extract_text(file.filename, data)
        parsed = resume_parser.parse_resume(text, fallback_name=record.get("name", ""))
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    except Exception:
        raise HTTPException(422, "This resume could not be read. Please try exporting it again.")

    if not parsed["skills"]:
        raise HTTPException(
            422,
            "No known technical skills were found in this resume. Add a Skills section "
            "(for example Python, React, SQL) and upload it again.",
        )

    payload = {
        "file_name": file.filename,
        "size": len(data),
        "target_role": target_role.strip()[:80],
        "preferred_location": preferred_location.strip()[:60],
        "profile": parsed,
        "skills": parsed["skills"],
        **_student(actor),
    }
    resume = jobs_store.upsert_resume(actor["id"], payload)

    # Keep the roster record in sync so admin/faculty tables can show it without a join.
    record["resume_uploaded"] = True
    record["resume_skills"] = parsed["skills"][:12]
    record["resume_file"] = file.filename

    jobs_store.log(
        "student",
        record.get("name") or actor.get("name") or "Student",
        "Uploaded a resume",
        f"{len(parsed['skills'])} skills detected for {record.get('roll_no', '')}",
        student_id=actor["id"],
    )

    return {
        "success": True,
        "resume": resume,
        "profile": parsed,
        "suggested_queries": parsed["suggested_roles"] or ["Software Developer"],
        "message": f"Resume parsed. {len(parsed['skills'])} skills detected.",
    }


@router.delete("/resume")
def delete_resume(authorization: Optional[str] = Header(default=None)):
    actor = _actor(authorization, ["student"], "Deleting a resume")
    removed = jobs_store.delete_resume(actor["id"])
    record = actor.get("record") or {}
    record.pop("resume_uploaded", None)
    record.pop("resume_skills", None)
    record.pop("resume_file", None)
    if removed:
        jobs_store.log(record.get("name", "Student"), "Removed a resume", record.get("roll_no", ""), student_id=actor["id"])
    return {"success": True, "removed": removed}


# --------------------------------------------------------------- job search
@router.post("/search")
def search_jobs(request: JobSearchRequest, authorization: Optional[str] = Header(default=None)):
    """Scrape live job boards and rank them against the student's resume skills."""
    actor = _actor(authorization)
    resume = jobs_store.get_resume(actor["id"]) if actor["role"] == "student" else None
    profile = (resume or {}).get("profile") or {}

    skills = request.skills or (resume or {}).get("skills") or []
    query = request.query.strip()
    if not query:
        target = (resume or {}).get("target_role") or ""
        suggested = profile.get("suggested_roles") or []
        query = target or (suggested[0] if suggested else "Python developer")
    location = request.location.strip() or (resume or {}).get("preferred_location", "")

    result = job_scraper.search_jobs(
        query=query,
        location=location,
        remote_only=request.remote,
        skills=skills,
        limit=request.limit,
    )
    result["role"] = actor["role"]
    result["resume_name"] = profile.get("name", "")
    result["suggestion"] = (
        "Upload a resume first to get skill-based matching."
        if actor["role"] == "student" and not resume
        else ""
    )
    return result


# -------------------------------------------------------------- applications
@router.post("/apply")
def apply_to_job(request: ApplyRequest, authorization: Optional[str] = Header(default=None)):
    """Record the application and hand back the employer URL to open."""
    actor = _actor(authorization, ["student"], "Applying to jobs")
    url = _safe_url(request.url)

    application = jobs_store.add_application(
        {
            "job_id": request.job_id,
            "title": request.title.strip(),
            "company": request.company.strip(),
            "url": url,
            "source": request.source,
            "location": request.location,
            "job_type": request.job_type,
            "match": request.match,
            **_student(actor),
        }
    )
    jobs_store.log(
        "student",
        application.get("student_name", "Student"),
        "Applied to a job",
        f"{application['title']} @ {application['company'] or request.source}",
        student_id=actor["id"],
    )
    return {
        "success": True,
        "application": application,
        "redirect_url": url,
        "message": f"Tracked your application for {request.title}. Opening the employer page...",
    }


@router.get("/applications")
def my_applications(authorization: Optional[str] = Header(default=None)):
    actor = _actor(authorization, ["student"], "Reading your applications")
    apps = jobs_store.list_applications(actor["id"])
    return {"success": True, "applications": apps, "count": len(apps)}


@router.get("/student/{student_id}")
def student_placement(student_id: str, authorization: Optional[str] = Header(default=None)):
    """Faculty/admin view of one student's resume and applications."""
    _actor(authorization, ["teacher", "admin"], "Viewing a student's placement record")
    student = next((row for row in ADMIN_STUDENTS if row["id"] == student_id), None)
    if not student:
        raise HTTPException(404, "Student record not found.")
    return {
        "success": True,
        "student": _student_summary(student),
        "resume": jobs_store.get_resume(student_id),
        "applications": jobs_store.list_applications(student_id),
    }


# ------------------------------------------------------------ campus openings
@router.get("/openings")
def list_openings():
    openings = jobs_store.list_openings(active_only=True)
    return {"success": True, "openings": openings, "count": len(openings)}


@router.post("/openings")
def create_opening(request: OpeningRequest, authorization: Optional[str] = Header(default=None)):
    """Admin / faculty post a campus drive. Every student sees it in Job Finds."""
    actor = _actor(authorization, ["teacher", "admin"], "Posting a campus opening")
    url = _safe_url(request.url)
    opening = jobs_store.add_opening(
        {
            "title": request.title.strip(),
            "company": request.company.strip(),
            "location": request.location.strip(),
            "job_type": request.job_type,
            "salary": request.salary,
            "skills": request.skills,
            "description": request.description,
            "url": url,
            "deadline": request.deadline,
            "posted_by": actor.get("name", ""),
            "posted_role": actor["role"],
        }
    )
    jobs_store.log(
        actor["role"],
        actor.get("name", ""),
        "Posted a campus opening",
        f"{opening['title']} @ {opening['company'] or 'Campus drive'}",
    )
    return {"success": True, "opening": opening}


@router.delete("/openings/{opening_id}")
def delete_opening(opening_id: str, authorization: Optional[str] = Header(default=None)):
    actor = _actor(authorization, ["teacher", "admin"], "Removing a campus opening")
    removed = jobs_store.remove_opening(opening_id)
    if not removed:
        raise HTTPException(404, "Opening not found.")
    jobs_store.log(actor["role"], actor.get("name", ""), "Closed a campus opening", opening_id)
    return {"success": True}


# ------------------------------------------------------- placement overview
@router.get("/placement/overview")
def placement_overview(authorization: Optional[str] = Header(default=None)):
    actor = _actor(authorization, ["teacher", "admin"], "Reading placement analytics")
    students = [_student_summary(student) for student in ADMIN_STUDENTS]
    app_rows = jobs_store.list_applications()
    resume_rows = jobs_store.all_resumes()

    by_company: Dict[str, int] = {}
    for app in app_rows:
        key = app.get("company") or app.get("source") or "Other"
        by_company[key] = by_company.get(key, 0) + 1
    top_companies = sorted(
        [{"company": key, "applications": value} for key, value in by_company.items()],
        key=lambda row: row["applications"],
        reverse=True,
    )[:6]

    skill_counts: Dict[str, int] = {}
    for resume in resume_rows.values():
        for skill in resume.get("skills", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    top_skills = sorted(
        [{"skill": key, "students": value} for key, value in skill_counts.items()],
        key=lambda row: row["students"],
        reverse=True,
    )[:10]

    return {
        "success": True,
        "viewer": {"name": actor.get("name"), "role": actor["role"]},
        "students": students,
        "applications": app_rows,
        "openings": jobs_store.list_openings(),
        "activity": jobs_store.activity(30),
        "stats": {
            "students": len(students),
            "with_resume": len(resume_rows),
            "without_resume": max(0, len(students) - len(resume_rows)),
            "applications": len(app_rows),
            "openings": len(jobs_store.list_openings(active_only=True)),
            "placed": len({app.get("student_id") for app in app_rows}),
        },
        "top_companies": top_companies,
        "top_skills": top_skills,
    }
