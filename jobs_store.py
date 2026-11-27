"""
UniMind AI  |  Shared placement store (student <-> faculty <-> admin)

WHY THIS EXISTS
  The campus app now has a Job Finds section: a student uploads a resume, the
  backend scrapes job boards, and the student is sent to the real application link.
  Administrators and faculty must be able to see which students uploaded a resume,
  which jobs they applied to, and what the placement cell has posted.

  This module is that single shared source of truth. It is a tiny JSON database
  (so it survives an API restart) with a file lock, plus an activity feed that
  the admin and faculty dashboards read.

STORED DATA  (data/placement_store.json)
  resumes       student_id -> parsed resume (skills, file name, text preview ...)
  applications  every "Apply" click, linked to the student who made it
  openings      campus drives / vacancies posted by admin or faculty
  activity      recent cross-role audit trail (upload, apply, grade, circular ...)
"""

from __future__ import annotations

import copy
import json
import os
import threading
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

_LOCK = threading.RLock()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEED_DATA_DIR = os.path.join(BASE_DIR, "data")
SEED_STORE_FILE = os.path.join(SEED_DATA_DIR, "placement_store.json")


def _resolve_store_paths():
    """Use repo data/ locally, or /tmp on read-only serverless filesystems (e.g. Vercel)."""
    if os.environ.get("VERCEL") or not os.access(BASE_DIR, os.W_OK):
        tmp_dir = os.path.join("/tmp", "unimind_data")
        return tmp_dir, os.path.join(tmp_dir, "placement_store.json")
    return SEED_DATA_DIR, SEED_STORE_FILE


DATA_DIR, STORE_FILE = _resolve_store_paths()
MAX_ACTIVITY = 300

_DEFAULT_STORE: Dict[str, Any] = {
    "resumes": {},
    "applications": [],
    "openings": [],
    "activity": [],
}


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _read() -> Dict[str, Any]:
    """Read the store from disk; a missing or broken file starts a fresh one."""
    target = STORE_FILE
    if not os.path.exists(target):
        if target != SEED_STORE_FILE and os.path.exists(SEED_STORE_FILE):
            target = SEED_STORE_FILE
        else:
            return copy.deepcopy(_DEFAULT_STORE)
    try:
        with open(target, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (OSError, ValueError):
        return copy.deepcopy(_DEFAULT_STORE)

    for key, default in _DEFAULT_STORE.items():
        if key not in data or not isinstance(data[key], type(default)):
            data[key] = copy.deepcopy(default)
    return data


def _write(store: Dict[str, Any]) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp = STORE_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(store, handle, ensure_ascii=False, indent=1)
    os.replace(tmp, STORE_FILE)


def _mutate(change):
    """Run `change(store)` under the lock and persist the result."""
    with _LOCK:
        store = _read()
        result = change(store)
        _write(store)
        return result


# ---------------------------------------------------------------- resumes
def get_resume(student_id: str) -> Optional[Dict[str, Any]]:
    with _LOCK:
        resume = _read()["resumes"].get(student_id)
        return copy.deepcopy(resume) if resume else None


def upsert_resume(student_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    def change(store):
        existing = store["resumes"].get(student_id, {})
        record = {
            **existing,
            **payload,
            "student_id": student_id,
            "updated_at": _now(),
        }
        if not existing:
            record["created_at"] = record["updated_at"]
        store["resumes"][student_id] = record
        return copy.deepcopy(record)

    return _mutate(change)


def delete_resume(student_id: str) -> bool:
    def change(store):
        return store["resumes"].pop(student_id, None) is not None

    return _mutate(change)


def all_resumes() -> Dict[str, Dict[str, Any]]:
    with _LOCK:
        return copy.deepcopy(_read()["resumes"])


def resume_count() -> int:
    with _LOCK:
        return len(_read()["resumes"])


# ----------------------------------------------------------- applications
def add_application(entry: Dict[str, Any]) -> Dict[str, Any]:
    """Record an apply click. The same student + job URL is only recorded once."""

    def change(store):
        for existing in store["applications"]:
            if (
                existing.get("student_id") == entry.get("student_id")
                and existing.get("url") == entry.get("url")
            ):
                existing["applied_at"] = _now()
                existing["status"] = entry.get("status") or existing.get("status", "Applied")
                return copy.deepcopy(existing)
        record = {
            "id": f"app-{uuid.uuid4().hex[:10]}",
            "applied_at": _now(),
            "status": "Applied",
            **entry,
        }
        store["applications"].insert(0, record)
        return copy.deepcopy(record)

    return _mutate(change)


def list_applications(student_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with _LOCK:
        rows = _read()["applications"]
        if student_id:
            rows = [row for row in rows if row.get("student_id") == student_id]
        return copy.deepcopy(rows)


def application_count(student_id: Optional[str] = None) -> int:
    return len(list_applications(student_id))


# --------------------------------------------------------------- openings
def add_opening(entry: Dict[str, Any]) -> Dict[str, Any]:
    def change(store):
        record = {
            "id": f"opn-{uuid.uuid4().hex[:8]}",
            "posted_at": _now(),
            "active": True,
            **entry,
        }
        store["openings"].insert(0, record)
        return copy.deepcopy(record)

    return _mutate(change)


def list_openings(active_only: bool = False) -> List[Dict[str, Any]]:
    with _LOCK:
        rows = _read()["openings"]
        if active_only:
            rows = [row for row in rows if row.get("active", True)]
        return copy.deepcopy(rows)


def remove_opening(opening_id: str) -> bool:
    def change(store):
        before = len(store["openings"])
        store["openings"] = [row for row in store["openings"] if row.get("id") != opening_id]
        return len(store["openings"]) != before

    return _mutate(change)


# --------------------------------------------------------------- activity
def log(actor_role: str, actor_name: str, action: str, detail: str = "",
        student_id: Optional[str] = None) -> Dict[str, Any]:
    """Add one line to the shared cross-role activity feed."""

    def change(store):
        event = {
            "id": f"act-{uuid.uuid4().hex[:8]}",
            "at": _now(),
            "actor_role": actor_role,
            "actor_name": actor_name,
            "action": action,
            "detail": detail,
            "student_id": student_id,
        }
        store["activity"].insert(0, event)
        del store["activity"][MAX_ACTIVITY:]
        return copy.deepcopy(event)

    return _mutate(change)


def activity(limit: int = 25, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with _LOCK:
        rows = _read()["activity"]
        if student_id:
            rows = [row for row in rows if row.get("student_id") == student_id]
        return copy.deepcopy(rows[:limit])


def stats() -> Dict[str, int]:
    with _LOCK:
        store = _read()
        return {
            "resumes": len(store["resumes"]),
            "applications": len(store["applications"]),
            "openings": len([row for row in store["openings"] if row.get("active", True)]),
        }
