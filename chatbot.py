"""
UniMind AI  |  Step 9e: Personal chatbot for ONE student (attendance, marks, exam trends)

How it works (the "calculator + speaker" idea):
  1. The student logs in, so the database locks (Row Level Security) apply.
  2. Python reads ONLY that student's data and does ALL the maths itself.
  3. Groq (the AI) is only asked to explain those ready-made facts in friendly words.
  4. Every question and answer is saved in the chat_messages table.

Official attendance can be counted two ways (the setting 'attendance_method' in the
college_rules table):
  'day'     = days present / total days (a day is present only if ALL its lectures were attended)
  'lecture' = lectures attended / lectures held

Exam trends: Python counts which topics repeat across the past papers teachers uploaded
for the student's current subjects, and Groq explains what to study first.

Run it with:   python chatbot.py
Type  facts  to see the raw numbers,  quit  to leave.
"""

import math
import os
import re
import sys
from collections import Counter
from datetime import date
from fractions import Fraction

from dotenv import load_dotenv
from groq import Groq
from supabase import create_client

try:  # make sure Hindi/English characters print correctly on Windows
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


# ---------------------------------------------------------------------
# PART 1: Python does the maths (never the AI)
# ---------------------------------------------------------------------
def units_can_miss(present, total, min_pct):
    """How many MORE days (or lectures) can be missed and still stay at or above min_pct."""
    return max(math.floor(Fraction(present * 100) / min_pct) - total, 0)


def units_needed(present, total, min_pct):
    """How many days (or lectures) in a row must be attended to reach min_pct."""
    if present * 100 >= min_pct * total:
        return 0
    return math.ceil((min_pct * total - 100 * present) / (100 - min_pct))


def exam_trend_lines(subject, rows, top_n=6):
    """Count the topics of one subject's past-paper questions (Python does the counting)."""
    title = f"{subject['name']} ({subject['code']})"
    if not rows:
        return [f"- {title}: no past papers uploaded yet"]

    years = sorted({r["exam_year"] for r in rows if r.get("exam_year")})
    n_papers = len(years) or 1
    lines = [f"- {title}: based on {n_papers} past paper(s) "
             f"({', '.join(str(y) for y in years) or 'year unknown'}), {len(rows)} questions."]

    by_marks = Counter(r["marks"] for r in rows if r.get("marks") is not None)
    if by_marks:
        pattern = ", ".join(f"{round(count / n_papers, 1):g} question(s) of {marks} marks"
                            for marks, count in sorted(by_marks.items()))
        lines.append(f"    Typical paper: about {pattern}.")

    topics = {}
    for r in rows:
        name = (r.get("topic") or "Unclassified").strip()
        if name.casefold() == "unclassified":
            continue
        entry = topics.setdefault(name.casefold(), {"name": name, "years": set(),
                                                    "count": 0, "marks": 0})
        if r.get("exam_year"):
            entry["years"].add(r["exam_year"])
        entry["count"] += 1
        entry["marks"] += r.get("marks") or 0
    ranked = sorted(topics.values(),
                    key=lambda t: (-len(t["years"]), -t["marks"], -t["count"], t["name"]))
    if ranked:
        lines.append("    Most repeated topics (years asked, questions, total marks):")
        for place, t in enumerate(ranked[:top_n], start=1):
            lines.append(f"      {place}. {t['name']}: asked in {len(t['years'])} of "
                         f"{n_papers} year(s), {t['count']} question(s), {t['marks']} marks in total")
    return lines


def build_facts(client, user_id):
    """Read this student's data (the locks allow only their own) and return facts as text."""
    profile = client.table("profiles").select("*").eq("id", user_id).execute().data[0]
    semester = profile["semester"]

    rules = {r["rule_key"]: r["rule_value"] for r in
             client.table("college_rules").select("rule_key,rule_value").execute().data}
    min_pct = Fraction(rules.get("min_attendance_percent", "75"))
    if not (0 < min_pct < 100):
        min_pct = Fraction(75)
    rule_text = f"{float(min_pct):g}%"
    method = rules.get("attendance_method", "day")
    if method not in ("day", "lecture"):
        method = "day"

    lines = []
    lines.append(f"Today's date: {date.today().isoformat()}")
    lines.append(f"Student: {profile['full_name']}, {profile['course']}, "
                 f"year {profile['year']}, semester {semester}")
    department = None
    if profile.get("department_id"):
        try:
            department = client.table("departments").select("name").eq(
                "id", profile["department_id"]).execute().data[0]["name"]
        except Exception:
            department = None
    details = [("CAMU ID", profile.get("camu_id")), ("status", profile.get("status")),
               ("degree", profile.get("degree")), ("department", department),
               ("section", profile.get("section")), ("roll no", profile.get("roll_no")),
               ("admission year", profile.get("admission_year")),
               ("college", profile.get("college"))]
    shown = ", ".join(f"{label} {value}" for label, value in details if value)
    if shown:
        lines.append(f"Profile details: {shown}")
    lines.append(f"College rule: minimum overall attendance is {rule_text}.")

    # ---- Official attendance (current semester) ----
    overall = client.table("attendance_overall").select("*").eq(
        "semester", semester).execute().data
    lines.append(f"\nOFFICIAL ATTENDANCE (current semester, counted {method}-wise):")
    if method == "day":
        lines.append("(A day counts as present only if the student attended ALL lectures of that day.)")
    else:
        lines.append("(Counted as lectures attended out of lectures held.)")

    if overall and overall[0]["total_days"]:
        row = overall[0]
        days_p, days_t = row["days_present"], row["total_days"]
        lec_p, lec_t = row["lectures_attended"], row["lectures_held"]
        if method == "day":
            present, total, unit = days_p, days_t, "day"
            other = f"lecture-wise: {lec_p} of {lec_t} lectures = {round(100 * lec_p / lec_t, 1)}%"
        else:
            present, total, unit = lec_p, lec_t, "lecture"
            other = f"day-wise: {days_p} of {days_t} days = {round(100 * days_p / days_t, 1)}%"
        lpd, lpd_note = Fraction(lec_t, days_t), "average of the recorded days"
        if "lectures_per_day" in rules:
            try:
                setting = Fraction(rules["lectures_per_day"])
                if setting > 0:
                    lpd, lpd_note = setting, "college setting"
            except (ValueError, ZeroDivisionError):
                pass

        pct = round(100 * present / total, 1)
        lines.append(f"- Official: {present} of {total} {unit}s = {pct}%")
        lines.append(f"- For information only, {other}")

        if present * 100 >= min_pct * total:
            can_miss = units_can_miss(present, total, min_pct)
            lines.append(f"- Status: OK, at or above {rule_text}.")
            if method == "day":
                lines.append(f"LEAVE ADVICE: up to {can_miss} day(s) of leave are safe "
                             "(each leave day counts as an absent day).")
            else:
                full_days = math.floor(can_miss / lpd)
                lines.append(f"LEAVE ADVICE: up to {can_miss} more lecture(s) can be missed, "
                             f"about {full_days} full day(s) of leave "
                             f"(typical {round(float(lpd), 1):g} lectures per day, {lpd_note}).")
        else:
            needed = units_needed(present, total, min_pct)
            lines.append(f"- Status: BELOW the rule of {rule_text}.")
            if method == "day":
                lines.append(f"LEAVE ADVICE: NO leave is safe right now. Must be present on the "
                             f"next {needed} college day(s) in a row to reach {rule_text}.")
            else:
                lines.append(f"LEAVE ADVICE: NO leave is safe right now. Must attend the next "
                             f"{needed} lecture(s) in a row (about "
                             f"{math.ceil(needed / lpd)} day(s)) to reach {rule_text}.")
        lines.append("LEAVE TABLE (attendance if the student takes leave from today; "
                     "every leave day is fully absent):")
        for d in (1, 2, 3, 5):
            if method == "day":
                after = 100 * present / (total + d)
                detail = f"{d} day(s) of leave"
            else:
                after = float(Fraction(100 * present) / (total + d * lpd))
                detail = (f"{d} day(s) of leave = about {round(float(d * lpd), 1):g} lectures "
                          f"({round(float(lpd), 1):g} per day, {lpd_note})")
            verdict = "OK" if after >= float(min_pct) else f"BELOW the rule of {rule_text}"
            lines.append(f"- {detail}: attendance would be {after:.1f}% - {verdict}")
    else:
        lines.append("- no attendance recorded yet")
        lec_p = lec_t = 0

    # ---- Monthly attendance (latest 3 months) ----
    monthly = client.table("attendance_monthly").select("*").eq(
        "semester", semester).order("month_start", desc=True).limit(3).execute().data
    today = date.today()
    this_month = today.strftime("%Y-%m")
    lines.append(f"\nMONTHLY ATTENDANCE (today is {today.isoformat()}; "
                 f"the current month is {this_month}):")
    if this_month not in {str(m["month_start"])[:7] for m in monthly}:
        lines.append(f"- {this_month} (current month): no attendance recorded yet this month")
    for m in monthly:
        label = "current month" if str(m["month_start"])[:7] == this_month else "earlier month"
        lines.append(f"- {str(m['month_start'])[:7]} ({label}): day-wise {m['days_present']} of "
                     f"{m['total_days']} days = {m['day_percentage']}%; lecture-wise "
                     f"{m['lectures_attended']} of {m['lectures_held']} lectures = "
                     f"{m['lecture_percentage']}%")

    # ---- Missed lectures (latest 10) ----
    missed = client.table("missed_lectures").select(
        "subject_code,subject_name,attendance_date,lecture_time,lecture_end_time,lecture_number"
    ).eq("semester", semester).order("attendance_date", desc=True).order(
        "lecture_time", desc=True).limit(10).execute().data
    total_missed = (lec_t - lec_p) if overall else 0
    lines.append(f"\nMISSED LECTURES (latest 10 of {total_missed} missed in this semester):")
    if not missed:
        lines.append("- none")
    for m in missed:
        if m.get("lecture_time") and m.get("lecture_end_time"):
            when = f"{str(m['lecture_time'])[:5]}-{str(m['lecture_end_time'])[:5]}"
        elif m.get("lecture_time"):
            when = str(m["lecture_time"])[:5]
        else:
            when = "time not recorded"
        lines.append(f"- {m['attendance_date']}, {when}: {m['subject_name']} ({m['subject_code']})")

    # ---- Subject-wise lecture attendance (for information only) ----
    subjects = client.table("subjects").select("id,code,name,semester").execute().data
    enrolled = {e["subject_id"] for e in
                client.table("enrollments").select("subject_id").execute().data}
    current_subjects = [s for s in subjects if s["id"] in enrolled and s["semester"] == semester]
    summary = {r["subject_id"]: r for r in
               client.table("attendance_summary").select("*").execute().data}

    lines.append("\nSUBJECT-WISE LECTURE ATTENDANCE (for information):")
    for s in sorted(current_subjects, key=lambda x: x["code"]):
        row = summary.get(s["id"])
        if not row or not row["total_days"]:
            lines.append(f"- {s['name']} ({s['code']}): no lectures recorded yet")
            continue
        p, t = row["present_days"], row["total_days"]
        lines.append(f"- {s['name']} ({s['code']}): attended {p} of {t} lectures "
                     f"= {round(100 * p / t, 1)}%")

    # ---- Exam trends from the past papers teachers uploaded ----
    subject_ids = [s["id"] for s in current_subjects]
    trend_rows = []
    if subject_ids:
        trend_rows = client.table("exam_questions").select(
            "subject_id,exam_year,topic,marks,section"
        ).in_("subject_id", subject_ids).execute().data
    lines.append("\nEXAM TRENDS (from past question papers uploaded by teachers):")
    for s in sorted(current_subjects, key=lambda x: x["code"]):
        lines += exam_trend_lines(s, [r for r in trend_rows if r["subject_id"] == s["id"]])

    # ---- Marks entered by teachers (UT, assignment, practical ...) ----
    marks_rows = []
    if subject_ids:
        marks_rows = client.table("marks").select(
            "subject_id,exam_type,marks_obtained,max_marks"
        ).in_("subject_id", subject_ids).execute().data
    lines.append("\nMARKS (current semester, entered by teachers; every exam has its own "
                 "maximum marks, for example 30, 50 or 70):")
    any_marks = False
    grand_obtained = grand_maximum = 0.0
    for s in sorted(current_subjects, key=lambda x: x["code"]):
        mine = sorted((r for r in marks_rows if r["subject_id"] == s["id"]),
                      key=lambda r: r["exam_type"])
        if not mine:
            continue
        any_marks = True
        obtained = sum(float(r["marks_obtained"]) for r in mine)
        maximum = sum(float(r["max_marks"]) for r in mine)
        grand_obtained += obtained
        grand_maximum += maximum
        parts = ", ".join(f"{r['exam_type']} {float(r['marks_obtained']):g}/"
                          f"{float(r['max_marks']):g}" for r in mine)
        lines.append(f"- {s['name']} ({s['code']}): {parts}; total {obtained:g} of "
                     f"{maximum:g} = {100 * obtained / maximum:.1f}%")
    if any_marks:
        lines.append(f"- Overall across all these subjects: {grand_obtained:g} of "
                     f"{grand_maximum:g} = {100 * grand_obtained / grand_maximum:.1f}%")
    else:
        lines.append("- no marks entered yet")

    # ---- Fees ----
    fees = client.table("fees").select(
        "description,total_amount,paid_amount,pending_amount,due_date"
    ).order("due_date").execute().data
    lines.append("\nFEES:")
    if not fees:
        lines.append("- no fee records")
    for f in fees:
        lines.append(f"- {f['description']}: total {float(f['total_amount']):g}, "
                     f"paid {float(f['paid_amount']):g}, pending {float(f['pending_amount']):g}, "
                     f"due {f['due_date']}")
    lines.append(f"Total pending fees: {sum(float(f['pending_amount']) for f in fees):g}")

    # ---- Assignments ----
    assignments = client.table("assignments").select(
        "id,subject_id,title,due_date").order("due_date").execute().data
    submitted = {r["assignment_id"] for r in
                 client.table("submissions").select("assignment_id").execute().data}
    code_of = {s["id"]: s["code"] for s in subjects}
    lines.append("\nASSIGNMENTS:")
    if not assignments:
        lines.append("- no assignments")
    for a in assignments:
        state = "submitted" if a["id"] in submitted else "NOT submitted yet"
        lines.append(f"- {a['title']} ({code_of.get(a['subject_id'], '?')}), "
                     f"due {a['due_date'][:10]}: {state}")

    return "\n".join(lines)


# ---------------------------------------------------------------------
# PART 2: Groq explains the facts
# ---------------------------------------------------------------------
SYSTEM_PROMPT = """You are UniMind, a friendly personal assistant for ONE college student.
Rules:
- Use ONLY the facts in STUDENT FACTS below. Never invent numbers, dates, times or rules.
- All numbers were already calculated by the system. Do not recalculate them; explain them.
- The OFFICIAL attendance is the one in the OFFICIAL ATTENDANCE section. For leave questions,
  use its LEAVE ADVICE line and the minimum attendance rule. Each leave day counts as absent.
  For a leave of a given number of days, use the matching line of the LEAVE TABLE (or the closest
  one). The lectures per day come from the college setting; if the student says their real number
  is different, do not argue: say the admin can update that setting, and explain with the table.
  Never tell a student who is below the rule that leave is safe.
- For questions about a month, use the MONTHLY ATTENDANCE lines. Only call a month "current"
  when it is marked (current month); if the current month has no data, say so and never present
  an earlier month as the current one. For questions about which
  lectures were missed, list them from the MISSED LECTURES lines with date, time and subject.
- Lines marked 'for information' are extra context, never the official percentage.
- For questions about marks or percentage, use the MARKS lines and the maximum marks shown
  there; never assume a fixed maximum. For questions about the student's own details
  (CAMU ID, department, section, status ...), use the Profile details line.
- For questions like 'what should I study' or 'what is important', use the EXAM TRENDS lines.
  Recommend the topics asked in the most years and carrying the most marks first, and name the
  years of the papers used. If only one or two papers exist, say the trend is still weak. Never
  claim anything about the syllabus or guarantee that a topic will come in the exam.
- If the student asks for general advice (for example about interviews or how to improve),
  you may give brief, careful general guidance, but say clearly that it is general advice and
  not from the college records. Remember that MARKS lines are internal test marks, not final
  university results, and company eligibility rules differ from company to company.
- If a college fact is not in the facts, say you do not have that information yet.
- Keep answers short, clear and kind. Reply in the same language AND the same script the
  student writes in. If the student writes Hindi in English letters (Hinglish), reply in
  Hinglish using English letters only and NEVER Devanagari. Use Devanagari only when the
  student writes in Devanagari.

STUDENT FACTS:
"""


DEVANAGARI = re.compile(r"[\u0900-\u097F]")

# Common Hindi words written in English letters. If the student uses any of them, we
# treat the message as Hinglish and make sure the answer also uses English letters.
HINGLISH_WORDS = {
    "mera", "meri", "mere", "mujhe", "mujhko", "humara", "hamara", "hamari", "kya", "kyu",
    "kyun", "kaise", "kab", "kitna", "kitne", "kitni", "kaun", "kaunsa", "kaunse", "kahan",
    "hai", "hain", "hu", "hun", "hoga", "hogi", "tha", "thi", "sakta", "sakti", "sakte",
    "chahiye", "batao", "bata", "bataiye", "dikhao", "dikha", "chutti", "padhai", "padhna",
    "nahi", "nahin", "haan", "abhi", "aaj", "kal", "aur", "lekin", "isme", "usme", "iska",
    "uska", "wala", "wali", "wale", "mein", "liye", "bahut", "thoda", "zyada", "acha",
    "achha", "theek", "kuch", "koi", "karna", "karo", "kijiye", "bolo", "samjhao", "samjha",
}


def reply_language_rule(question):
    """Tell the AI which language AND script to use, based on how the student wrote."""
    if DEVANAGARI.search(question):
        return "The student wrote in Hindi (Devanagari). Reply in simple Hindi in Devanagari."
    if set(re.findall(r"[a-z]+", question.lower())) & HINGLISH_WORDS:
        return ("The student wrote Hinglish (Hindi in English letters). Reply in simple Hinglish "
                "using ONLY English letters, for example 'Aapki attendance 76.2% hai'. "
                "Do NOT use any Devanagari characters.")
    return "The student wrote in English. Reply in simple English."


def ask_groq(groq_client, model, facts_text, history, question):
    rule = reply_language_rule(question)
    messages = [{"role": "system", "content": SYSTEM_PROMPT + facts_text}]
    messages += history[-6:]
    messages.append({"role": "user", "content": f"{question}\n\n(LANGUAGE RULE: {rule})"})
    reply = groq_client.chat.completions.create(
        model=model, messages=messages, temperature=0.2, max_tokens=1500)
    answer = reply.choices[0].message.content or "(empty reply)"

    # Safety net: the student did not write Devanagari but the answer has it -> ask once more
    if not DEVANAGARI.search(question) and DEVANAGARI.search(answer):
        messages += [
            {"role": "assistant", "content": answer},
            {"role": "user", "content": "Rewrite that answer using ONLY English letters "
                                        "(Hinglish or English). Do not use any Devanagari."},
        ]
        retry = groq_client.chat.completions.create(
            model=model, messages=messages, temperature=0.2, max_tokens=1500)
        answer = retry.choices[0].message.content or answer
    return answer


def save_message(client, user_id, sender, content):
    """Store the message in chat_messages (the lock lets a student write only their own)."""
    try:
        client.table("chat_messages").insert(
            {"student_id": user_id, "sender": sender, "content": content}).execute()
    except Exception as error:
        print(f"(could not save chat message: {error})")


# ---------------------------------------------------------------------
# PART 3: The chat loop
# ---------------------------------------------------------------------
def main():
    load_dotenv()
    url, key = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    password = os.getenv("STUDENT_PASSWORD")

    missing = [n for n, v in [("SUPABASE_URL", url), ("SUPABASE_KEY", key),
                              ("GROQ_API_KEY", groq_key), ("STUDENT_PASSWORD", password)] if not v]
    if missing:
        print("Missing in your .env file:", ", ".join(missing))
        sys.exit(1)

    supabase = create_client(url, key)
    try:
        session = supabase.auth.sign_in_with_password(
            {"email": "student1@example.com", "password": password})
    except Exception as error:
        print("Login failed:", error)
        sys.exit(1)
    user_id = session.user.id
    groq_client = Groq(api_key=groq_key)

    print("UniMind assistant is ready. Logged in as student1.")
    print("Ask about attendance, leave, marks, fees, assignments or what to study.")
    print("Type 'facts' to see the raw numbers, 'quit' to leave.")

    history = []
    while True:
        question = input("\nYou: ").strip()
        if not question:
            continue
        if question.lower() in ("quit", "exit"):
            print("Goodbye!")
            break

        # Read fresh facts for EVERY question, so a lecture the teacher just marked shows up
        try:
            facts = build_facts(supabase, user_id)
        except Exception as error:
            print("Could not read your data:", error)
            print("(If it mentions attendance_monthly, missed_lectures or lecture_end_time, "
                  "run the newest step8b, step8c, step9d and step9e SQL files first.)")
            continue

        if question.lower() == "facts":
            print("\n" + facts)
            continue

        save_message(supabase, user_id, "student", question)
        try:
            answer = ask_groq(groq_client, model, facts, history, question)
        except Exception as error:
            # If the AI is down, the student still gets the real numbers
            answer = ("The AI explanation is not available right now "
                      f"({type(error).__name__}). Here are your numbers:\n\n" + facts)

        print("\nUniMind:", answer)
        save_message(supabase, user_id, "bot", answer)
        history += [{"role": "user", "content": question},
                    {"role": "assistant", "content": answer}]


if __name__ == "__main__":
    main()