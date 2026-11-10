"""
UniMind AI  |  Step 7: Test the locks (Row Level Security)

This script pretends to be, one after another:
  - a visitor who is NOT logged in
  - student1, teacher1 and admin1
and it tries both the doors each person SHOULD open and the doors they
should NOT open. Every line printed is either PASS or FAIL.

Run it with:   python test_locks.py
"""

import os
import sys
from datetime import date

from dotenv import load_dotenv
from supabase import create_client

# ---------------------------------------------------------------------
# 1) Read the settings from the .env file
# ---------------------------------------------------------------------
load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

USERS = {
    "student": ("student1@example.com", os.getenv("STUDENT_PASSWORD")),
    "teacher": ("teacher1@example.com", os.getenv("TEACHER_PASSWORD")),
    "admin": ("admin1@example.com", os.getenv("ADMIN_PASSWORD")),
}

missing = [name for name, value in [("SUPABASE_URL", URL), ("SUPABASE_KEY", KEY)] if not value]
missing += [f"{role.upper()}_PASSWORD" for role, (_, pw) in USERS.items() if not pw]
if missing:
    print("Some settings are missing in your .env file:", ", ".join(missing))
    print("Open env_template.txt, copy it into a file named .env and fill it in.")
    sys.exit(1)

TEST_DATE = date.today().isoformat()
TEST_LECTURE = 99  # a special lecture number so we can find and delete our test row

passed = 0
failed = 0


# ---------------------------------------------------------------------
# 2) Small helper functions
# ---------------------------------------------------------------------
def check(name, condition):
    """Print PASS or FAIL for one test."""
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name}")


def login(role):
    """Log in as one of the test users and return (client, user_id)."""
    email, password = USERS[role]
    client = create_client(URL, KEY)
    result = client.auth.sign_in_with_password({"email": email, "password": password})
    return client, result.user.id


def rows(client, table, columns="*"):
    """Read a table. Returns a list of rows, or None if the database refused."""
    try:
        return client.table(table).select(columns).execute().data
    except Exception:
        return None


def try_insert(client, table, row):
    """Try to add a row. Returns True if allowed, False if the database refused."""
    try:
        client.table(table).insert(row).execute()
        return True
    except Exception:
        return False


def try_update(client, table, values, column, value):
    """Try to change rows. A refused change is silent, so we check the data later."""
    try:
        client.table(table).update(values).eq(column, value).execute()
    except Exception:
        pass


# ---------------------------------------------------------------------
# 3) Log in as all three people
# ---------------------------------------------------------------------
print("Logging in as student1, teacher1 and admin1 ...")
try:
    student, student_id = login("student")
    teacher, teacher_id = login("teacher")
    admin, admin_id = login("admin")
except Exception as error:
    print("Login failed:", error)
    print("Check SUPABASE_URL, SUPABASE_KEY and the three passwords in your .env file.")
    sys.exit(1)
print("Login worked for all three.")

subject_ids = {s["code"]: s["id"] for s in rows(student, "subjects")}
dbms = subject_ids["KCS501"]
operating_system = subject_ids["KCS502"]


# ---------------------------------------------------------------------
# 4) NOT LOGGED IN
# ---------------------------------------------------------------------
print("\n=== VISITOR (not logged in) ===")
visitor = create_client(URL, KEY)
check("cannot read profiles", not rows(visitor, "profiles"))
check("cannot read attendance", not rows(visitor, "attendance"))
check("cannot read fees", not rows(visitor, "fees"))


# ---------------------------------------------------------------------
# 5) STUDENT
# ---------------------------------------------------------------------
print("\n=== STUDENT (student1) ===")
profiles = rows(student, "profiles")
check("sees only own profile (1 of the 3 profiles)",
      len(profiles) == 1 and profiles[0]["id"] == student_id)

attendance = rows(student, "attendance")
check("sees own 42 attendance rows",
      len(attendance) == 42 and all(a["student_id"] == student_id for a in attendance))

summary = rows(student, "attendance_summary")
check("attendance percentages are 81.8 and 70.0",
      sorted(float(r["percentage"]) for r in summary) == [70.0, 81.8])

fees = rows(student, "fees")
check("sees own 2 fee records, 26500 pending in total",
      len(fees) == 2 and sum(float(f["pending_amount"]) for f in fees) == 26500.0)

check("sees the 3 assignments of enrolled subjects", len(rows(student, "assignments")) == 3)

rules = rows(student, "college_rules")
check("can read the college rule (minimum attendance 75)",
      any(r["rule_key"] == "min_attendance_percent" and r["rule_value"] == "75" for r in rules))

check("CANNOT mark own attendance",
      not try_insert(student, "attendance", {
          "student_id": student_id, "subject_id": dbms,
          "attendance_date": TEST_DATE, "lecture_number": TEST_LECTURE,
          "status": "present", "marked_by": student_id}))

try_update(student, "profiles", {"role": "admin"}, "id", student_id)
check("CANNOT make himself admin",
      rows(student, "profiles", "role")[0]["role"] == "student")

try_update(student, "fees", {"paid_amount": 85000}, "student_id", student_id)
check("CANNOT reduce his own pending fees",
      sum(float(f["pending_amount"]) for f in rows(student, "fees")) == 26500.0)

check("CAN write his own chat message",
      try_insert(student, "chat_messages", {
          "student_id": student_id, "sender": "student",
          "content": "test message from test_locks.py"}))
check("CAN read his own chat message", len(rows(student, "chat_messages")) == 1)


# ---------------------------------------------------------------------
# 6) TEACHER
# ---------------------------------------------------------------------
print("\n=== TEACHER (teacher1) ===")
emails = sorted(p["email"] for p in rows(teacher, "profiles"))
check("sees only himself and his own student (not the admin)",
      emails == ["student1@example.com", "teacher1@example.com"])
check("CANNOT see fees", not rows(teacher, "fees"))
check("sees attendance of his subjects (42 rows)", len(rows(teacher, "attendance")) == 42)
check("sees the 3 assignments of his subjects", len(rows(teacher, "assignments")) == 3)
check("CANNOT read the student's private chat", not rows(teacher, "chat_messages"))

check("CAN mark attendance for his own subject (DBMS)",
      try_insert(teacher, "attendance", {
          "student_id": student_id, "subject_id": dbms,
          "attendance_date": TEST_DATE, "lecture_number": TEST_LECTURE,
          "status": "present", "marked_by": teacher_id}))

check("CANNOT mark attendance for Operating System (not his subject)",
      not try_insert(teacher, "attendance", {
          "student_id": student_id, "subject_id": operating_system,
          "attendance_date": TEST_DATE, "lecture_number": TEST_LECTURE,
          "status": "present", "marked_by": teacher_id}))

try_update(teacher, "profiles", {"role": "teacher"}, "id", student_id)

# The student should now see the new lecture, with no manual update
dbms_row = [r for r in rows(student, "attendance_summary") if r["subject_id"] == dbms][0]
check("student INSTANTLY sees the new lecture (DBMS is now 19 of 23)",
      dbms_row["present_days"] == 19 and dbms_row["total_days"] == 23)


# ---------------------------------------------------------------------
# 7) ADMIN
# ---------------------------------------------------------------------
print("\n=== ADMIN (admin1) ===")
check("sees all 3 profiles", len(rows(admin, "profiles")) == 3)
check("sees fees of students", len(rows(admin, "fees")) == 2)
check("sees all attendance (42 + the 1 test lecture)", len(rows(admin, "attendance")) == 43)
check("CANNOT read students' private chats", not rows(admin, "chat_messages"))

student_role = [p for p in rows(admin, "profiles") if p["id"] == student_id][0]["role"]
check("student's role is still 'student' (teacher could not change it)",
      student_role == "student")


# ---------------------------------------------------------------------
# 8) CLEAN UP the test rows we created
# ---------------------------------------------------------------------
print("\n=== CLEAN UP ===")
admin.table("attendance").delete().eq("lecture_number", TEST_LECTURE).execute()
student.table("chat_messages").delete().eq("student_id", student_id).execute()
check("test attendance row removed (back to 42 rows)", len(rows(admin, "attendance")) == 42)
check("test chat message removed", not rows(student, "chat_messages"))


# ---------------------------------------------------------------------
# 9) RESULT
# ---------------------------------------------------------------------
print("\n" + "=" * 50)
print(f"RESULT: {passed} passed, {failed} failed")
if failed == 0:
    print("All locks work. Every person sees only what they should.")
else:
    print("Some tests failed. Copy the FAIL lines and send them to Claude.")