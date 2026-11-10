"""
UniMind AI  |  Step 10a check: use the web service exactly like the team's app will

1) Start the service in one terminal:      uvicorn api:app --reload
2) In a SECOND terminal run this file:     python test_api.py
"""

import os
import sys

import httpx
from dotenv import load_dotenv
from supabase import create_client

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

load_dotenv()
API = os.getenv("API_URL", "http://127.0.0.1:8000")
passed = failed = 0


def check(name, condition):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name}")


def login(email, password):
    """Log in with Supabase and return the login token, like the team's app does."""
    client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    return client.auth.sign_in_with_password(
        {"email": email, "password": password}).session.access_token


print(f"Talking to the service at {API}\n")

try:
    print("1) Is the service alive?")
    check("GET /health says ok", httpx.get(f"{API}/health", timeout=10).json() == {"status": "ok"})
except httpx.ConnectError:
    print("I cannot reach the service. Start it first in another terminal with:")
    print("    uvicorn api:app --reload")
    sys.exit(1)

print("\n2) A caller with no login token must be refused")
check("POST /api/chat without a token -> 401",
      httpx.post(f"{API}/api/chat", json={"message": "hi"}, timeout=10).status_code == 401)

print("\n3) Student One asks the personal chatbot")
student_token = login("student1@example.com", os.getenv("STUDENT_PASSWORD"))
reply = httpx.post(f"{API}/api/chat", json={"message": "meri percentage batao"},
                   headers={"Authorization": f"Bearer {student_token}"}, timeout=90)
check("POST /api/chat -> 200", reply.status_code == 200)
if reply.status_code == 200:
    print("\n  Chatbot says:", reply.json()["answer"], "\n")
    check("the AI answered (not the fallback)", reply.json()["ai_available"] is True)

print("4) A teacher must NOT be able to use the student chatbot")
teacher_token = login("teacher1@example.com", os.getenv("TEACHER_PASSWORD"))
check("teacher on /api/chat -> 403",
      httpx.post(f"{API}/api/chat", json={"message": "hi"},
                 headers={"Authorization": f"Bearer {teacher_token}"}, timeout=10).status_code == 403)

print(f"\nRESULT: {passed} passed, {failed} failed")