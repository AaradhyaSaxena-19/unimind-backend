"""
UniMind AI  |  Academic Management System API Extension
Provides endpoints for Timetable, Assignments, Assessments, Exams, Results,
Fees/Payments, Announcements, Notifications, Events, Study Content, Messages,
Documents, QR Verification, Parent Monitoring, Analytics, and Admin Management.
"""

from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
import os
import uuid

import jobs_store

router = APIRouter(prefix="/academic", tags=["academic"])

# =====================================================================
# SEED DATA STORE (In-Memory persistent store for AKTU B.Tech CSE)
# =====================================================================

STUDENT_DB = {
    "student1": {
        "id": "student-1",
        "full_name": "Kanishka Saxena",
        "roll_no": "210161010001",
        "camu_id": "RBMI2021001",
        "course": "B.Tech Computer Science & Engineering",
        "year": 3,
        "semester": 5,
        "section": "A",
        "email": "student1@example.com",
        "phone": "+91 98765 43210",
        "college": "RBMI Group of Institutions, Bareilly",
        "blood_group": "B+",
        "dob": "2003-08-15",
        "parent_name": "Rajesh Saxena",
        "parent_phone": "+91 98765 12345",
        "parent_email": "parent1@example.com",
        "address": "142 Civil Lines, Bareilly, UP 243001"
    }
}

PARENT_DB = {
    "parent1": {
        "id": "parent-1",
        "full_name": "Rajesh Saxena",
        "relation": "Father",
        "email": "parent1@example.com",
        "phone": "+91 98765 12345",
        "occupation": "Government Officer",
        "child_id": "student-1",
        "child_name": "Kanishka Saxena",
        "child_roll": "210161010001",
        "child_course": "B.Tech CSE - Sem 5"
    }
}

TIMETABLE = {
    "Monday": [
        {"period": 1, "time": "09:00 - 10:00", "subject_code": "KCS501", "subject_name": "Database Management Systems", "faculty": "Dr. Sharma", "room": "LT-302", "is_lab": False},
        {"period": 2, "time": "10:00 - 11:00", "subject_code": "KCS502", "subject_name": "Compiler Design", "faculty": "Prof. Verma", "room": "LT-302", "is_lab": False},
        {"period": 3, "time": "11:15 - 12:15", "subject_code": "KCS503", "subject_name": "Design & Analysis of Algorithms", "faculty": "Dr. Gupta", "room": "LT-302", "is_lab": False},
        {"period": 4, "time": "12:15 - 01:15", "subject_code": "BNC501", "subject_name": "Constitution of India, Law & Engg", "faculty": "Dr. K. Saxena", "room": "LT-302", "is_lab": False},
        {"period": 5, "time": "02:00 - 04:00", "subject_code": "KCS551", "subject_name": "DBMS Practical Lab", "faculty": "Dr. Sharma & Lab Staff", "room": "Computer Lab 4", "is_lab": True},
    ],
    "Tuesday": [
        {"period": 1, "time": "09:00 - 10:00", "subject_code": "KCS503", "subject_name": "Design & Analysis of Algorithms", "faculty": "Dr. Gupta", "room": "LT-302", "is_lab": False},
        {"period": 2, "time": "10:00 - 11:00", "subject_code": "KCS501", "subject_name": "Database Management Systems", "faculty": "Dr. Sharma", "room": "LT-302", "is_lab": False},
        {"period": 3, "time": "11:15 - 12:15", "subject_code": "KCS502", "subject_name": "Compiler Design", "faculty": "Prof. Verma", "room": "LT-302", "is_lab": False},
        {"period": 4, "time": "12:15 - 01:15", "subject_code": "KCS504", "subject_name": "Web Technology", "faculty": "Er. Singh", "room": "LT-302", "is_lab": False},
        {"period": 5, "time": "02:00 - 04:00", "subject_code": "KCS553", "subject_name": "DAA Practical Lab", "faculty": "Dr. Gupta", "room": "Computer Lab 2", "is_lab": True},
    ],
    "Wednesday": [
        {"period": 1, "time": "09:00 - 10:00", "subject_code": "KCS502", "subject_name": "Compiler Design", "faculty": "Prof. Verma", "room": "LT-302", "is_lab": False},
        {"period": 2, "time": "10:00 - 11:00", "subject_code": "BNC501", "subject_name": "Constitution of India, Law & Engg", "faculty": "Dr. K. Saxena", "room": "LT-302", "is_lab": False},
        {"period": 3, "time": "11:15 - 12:15", "subject_code": "KCS501", "subject_name": "Database Management Systems", "faculty": "Dr. Sharma", "room": "LT-302", "is_lab": False},
        {"period": 4, "time": "12:15 - 01:15", "subject_code": "KCS504", "subject_name": "Web Technology", "faculty": "Er. Singh", "room": "LT-302", "is_lab": False},
        {"period": 5, "time": "02:00 - 03:00", "subject_code": "KCS503", "subject_name": "Design & Analysis of Algorithms", "faculty": "Dr. Gupta", "room": "LT-302", "is_lab": False},
    ],
    "Thursday": [
        {"period": 1, "time": "09:00 - 10:00", "subject_code": "KCS501", "subject_name": "Database Management Systems", "faculty": "Dr. Sharma", "room": "LT-302", "is_lab": False},
        {"period": 2, "time": "10:00 - 11:00", "subject_code": "KCS504", "subject_name": "Web Technology", "faculty": "Er. Singh", "room": "LT-302", "is_lab": False},
        {"period": 3, "time": "11:15 - 12:15", "subject_code": "KCS502", "subject_name": "Compiler Design", "faculty": "Prof. Verma", "room": "LT-302", "is_lab": False},
        {"period": 4, "time": "12:15 - 01:15", "subject_code": "BNC501", "subject_name": "Constitution of India, Law & Engg", "faculty": "Dr. K. Saxena", "room": "LT-302", "is_lab": False},
        {"period": 5, "time": "02:00 - 04:00", "subject_code": "KCS554", "subject_name": "Web Technology Lab", "faculty": "Er. Singh", "room": "Computer Lab 3", "is_lab": True},
    ],
    "Friday": [
        {"period": 1, "time": "09:00 - 10:00", "subject_code": "KCS503", "subject_name": "Design & Analysis of Algorithms", "faculty": "Dr. Gupta", "room": "LT-302", "is_lab": False},
        {"period": 2, "time": "10:00 - 11:00", "subject_code": "KCS501", "subject_name": "Database Management Systems", "faculty": "Dr. Sharma", "room": "LT-302", "is_lab": False},
        {"period": 3, "time": "11:15 - 12:15", "subject_code": "KCS502", "subject_name": "Compiler Design", "faculty": "Prof. Verma", "room": "LT-302", "is_lab": False},
        {"period": 4, "time": "12:15 - 01:15", "subject_code": "KCS504", "subject_name": "Web Technology", "faculty": "Er. Singh", "room": "LT-302", "is_lab": False},
        {"period": 5, "time": "02:00 - 03:30", "subject_code": "SEM501", "subject_name": "Technical Seminar & GD", "faculty": "Department Head", "room": "Seminar Hall A", "is_lab": False},
    ],
    "Saturday": [
        {"period": 1, "time": "09:30 - 11:00", "subject_code": "TNP501", "subject_name": "Placement Aptitude & Soft Skills", "faculty": "T&P Cell", "room": "Auditorium", "is_lab": False},
        {"period": 2, "time": "11:15 - 01:00", "subject_code": "PROJ501", "subject_name": "Mini Project Phase-1 Review", "faculty": "Project Committee", "room": "Lab 1", "is_lab": True},
    ]
}

ASSIGNMENTS = [
    {
        "id": "asg-1",
        "subject_code": "KCS501",
        "subject_name": "Database Management Systems",
        "title": "ER Model to Relational Schema Mapping & Normalization",
        "description": "Design an ER Diagram for a Hospital Management System and convert it into 3NF and BCNF relational tables with foreign key constraints.",
        "faculty": "Dr. Sharma",
        "due_date": "2026-11-20",
        "max_marks": 20,
        "attachments": ["Hospital_ER_Guidelines.pdf"],
        "is_submitted": True,
        "submission_date": "2026-11-12",
        "submission_file": "Kanishka_DBMS_Assignment1.pdf",
        "marks_awarded": 18,
        "status": "graded"
    },
    {
        "id": "asg-2",
        "subject_code": "KCS502",
        "subject_name": "Compiler Design",
        "title": "Lexical Analyzer Implementation in C / Flex",
        "description": "Implement a Lexical Analyzer that identifies keywords, identifiers, constants, and operators from a given C source code snippet.",
        "faculty": "Prof. Verma",
        "due_date": "2026-11-28",
        "max_marks": 25,
        "attachments": ["Lexical_Analyzer_Problem_Statement.pdf"],
        "is_submitted": False,
        "submission_date": None,
        "submission_file": None,
        "marks_awarded": None,
        "status": "pending"
    },
    {
        "id": "asg-3",
        "subject_code": "KCS503",
        "subject_name": "Design & Analysis of Algorithms",
        "title": "Dynamic Programming vs Greedy Algorithms Case Studies",
        "description": "Solve Fractional Knapsack, 0/1 Knapsack, and Matrix Chain Multiplication with step-by-step recurrence relations and asymptotic time complexity proofs.",
        "faculty": "Dr. Gupta",
        "due_date": "2026-12-05",
        "max_marks": 20,
        "attachments": ["DAA_Assignment_Sheet_3.pdf"],
        "is_submitted": False,
        "submission_date": None,
        "submission_file": None,
        "marks_awarded": None,
        "status": "pending"
    },
    {
        "id": "asg-4",
        "subject_code": "BNC501",
        "subject_name": "Constitution of India, Law & Engg",
        "title": "Case Study on Intellectual Property Rights & Cyber Laws",
        "description": "Draft a 4-page legal review on patent infringements in AI software development under the Indian Patent Act 1970.",
        "faculty": "Dr. K. Saxena",
        "due_date": "2026-11-10",
        "max_marks": 15,
        "attachments": ["IPR_CaseStudy_Instructions.pdf"],
        "is_submitted": True,
        "submission_date": "2026-11-08",
        "submission_file": "CyberLaw_CaseStudy_Final.pdf",
        "marks_awarded": 14,
        "status": "graded"
    }
]

ASSESSMENTS = [
    {
        "id": "test-1",
        "title": "DBMS Unit 1 & 2 Quiz: Relational Algebra & SQL",
        "subject_code": "KCS501",
        "subject_name": "Database Management Systems",
        "duration_minutes": 20,
        "total_questions": 5,
        "total_marks": 25,
        "status": "available",
        "instructions": "All questions are multiple-choice. 4 marks for correct answer, 0 for wrong answer. Timer starts once you click Start Test.",
        "questions": [
            {
                "id": 1,
                "question": "Which of the following is NOT a fundamental relational algebra operation?",
                "options": ["Select", "Project", "Join", "Cartesian Product"],
                "correct_option": 2,
                "marks": 5
            },
            {
                "id": 2,
                "question": "In SQL, which clause is used to filter records after aggregation with GROUP BY?",
                "options": ["WHERE", "HAVING", "FILTER", "ORDER BY"],
                "correct_option": 1,
                "marks": 5
            },
            {
                "id": 3,
                "question": "A table is in 2NF if it is in 1NF and contains no:",
                "options": ["Transitive dependency", "Partial dependency", "Multivalued dependency", "Join dependency"],
                "correct_option": 1,
                "marks": 5
            },
            {
                "id": 4,
                "question": "What is the primary characteristic of the ACID property 'Atomicity'?",
                "options": ["Transactions execute concurrently", "All operations succeed or all are rolled back", "Data remains valid after restart", "Data is accessible from replicas"],
                "correct_option": 1,
                "marks": 5
            },
            {
                "id": 5,
                "question": "Which index structure is most widely used in modern B-Tree relational database engines?",
                "options": ["Hash Index", "B+ Tree", "Inverted Index", "R-Tree"],
                "correct_option": 1,
                "marks": 5
            }
        ]
    },
    {
        "id": "test-2",
        "title": "Compiler Design Pre-Exam Assessment",
        "subject_code": "KCS502",
        "subject_name": "Compiler Design",
        "duration_minutes": 30,
        "total_questions": 10,
        "total_marks": 50,
        "status": "upcoming",
        "start_time": "2026-11-25 10:00 AM",
        "instructions": "Covers Lexical Analysis, CFGs, Top-Down & Bottom-Up Parsing. Webcam proctoring is enabled."
    },
    {
        "id": "test-3",
        "title": "Constitution & Ethics Mid-Semester MCQ Evaluation",
        "subject_code": "BNC501",
        "subject_name": "Constitution of India",
        "duration_minutes": 15,
        "total_questions": 15,
        "total_marks": 30,
        "status": "completed",
        "score": 28,
        "percentage": 93.3,
        "submitted_at": "2026-11-02 11:45 AM"
    }
]

EXAMS = [
    {
        "id": "exam-1",
        "exam_type": "AKTU End Semester Examination - Odd Sem",
        "subject_code": "KCS501",
        "subject_name": "Database Management Systems",
        "exam_date": "2026-12-18",
        "time": "09:30 AM - 12:30 PM",
        "room": "Hall 3 (Row B, Seat 14)",
        "max_marks": 70,
        "admit_card_available": True
    },
    {
        "id": "exam-2",
        "exam_type": "AKTU End Semester Examination - Odd Sem",
        "subject_code": "KCS502",
        "subject_name": "Compiler Design",
        "exam_date": "2026-12-21",
        "time": "09:30 AM - 12:30 PM",
        "room": "Hall 3 (Row B, Seat 14)",
        "max_marks": 70,
        "admit_card_available": True
    },
    {
        "id": "exam-3",
        "exam_type": "AKTU End Semester Examination - Odd Sem",
        "subject_code": "KCS503",
        "subject_name": "Design & Analysis of Algorithms",
        "exam_date": "2026-12-24",
        "time": "09:30 AM - 12:30 PM",
        "room": "Hall 2 (Row D, Seat 08)",
        "max_marks": 70,
        "admit_card_available": True
    },
    {
        "id": "exam-4",
        "exam_type": "AKTU End Semester Examination - Odd Sem",
        "subject_code": "BNC501",
        "subject_name": "Constitution of India, Law & Engg",
        "exam_date": "2026-12-28",
        "time": "02:00 PM - 05:00 PM",
        "room": "Hall 1 (Row A, Seat 22)",
        "max_marks": 70,
        "admit_card_available": True
    }
]

RESULTS = {
    "current_cgpa": 8.42,
    "current_sgpa": 8.65,
    "total_credits_earned": 96,
    "semesters": [
        {
            "semester": 4,
            "session": "2025-26 Even",
            "sgpa": 8.65,
            "result_status": "PASS",
            "subjects": [
                {"code": "KCS401", "name": "Operating Systems", "credits": 4, "internal": 28, "external": 62, "total": 90, "grade": "A+"},
                {"code": "KCS402", "name": "Theory of Automata & Formal Lang", "credits": 4, "internal": 26, "external": 58, "total": 84, "grade": "A"},
                {"code": "KCS403", "name": "Microprocessor", "credits": 3, "internal": 25, "external": 55, "total": 80, "grade": "A"},
                {"code": "KVE401", "name": "Universal Human Values", "credits": 3, "internal": 29, "external": 65, "total": 94, "grade": "O"},
                {"code": "KCS451", "name": "OS Practical Lab", "credits": 1, "internal": 24, "external": 24, "total": 48, "grade": "O"},
            ]
        },
        {
            "semester": 3,
            "session": "2025-26 Odd",
            "sgpa": 8.20,
            "result_status": "PASS",
            "subjects": [
                {"code": "KCS301", "name": "Data Structures", "credits": 4, "internal": 27, "external": 60, "total": 87, "grade": "A+"},
                {"code": "KCS302", "name": "Computer Organization & Arch", "credits": 4, "internal": 24, "external": 54, "total": 78, "grade": "B+"},
                {"code": "KCS303", "name": "Discrete Mathematics", "credits": 4, "internal": 26, "external": 56, "total": 82, "grade": "A"},
                {"code": "KCS351", "name": "DS Practical Lab", "credits": 1, "internal": 23, "external": 23, "total": 46, "grade": "A+"},
            ]
        }
    ]
}

FEES_DATA = {
    "total_fee": 85000,
    "paid_fee": 65000,
    "pending_fee": 20000,
    "next_due_date": "2026-11-30",
    "breakdown": [
        {"item": "Annual Academic Tuition Fee", "amount": 65000, "status": "paid"},
        {"item": "University Exam & Enrollment Fee", "amount": 6500, "status": "paid"},
        {"item": "Advanced Computing & AI Lab Amenity", "amount": 8500, "status": "pending"},
        {"item": "Library, E-Journals & Book Bank", "amount": 5000, "status": "pending"}
    ],
    "history": [
        {"id": "pay-101", "ref": "RBMI-FEE-2026-8941", "date": "2026-08-14", "amount": 65000, "mode": "Online UPI / NetBanking", "status": "Success", "receipt_no": "REC-94102"},
        {"id": "pay-102", "ref": "RBMI-FEE-2026-4412", "date": "2026-09-02", "amount": 6500, "mode": "Debit Card (Razorpay)", "status": "Success", "receipt_no": "REC-94883"}
    ]
}

ANNOUNCEMENTS = [
    {
        "id": "ann-1",
        "title": "AKTU Odd Semester Examination Schedule Released",
        "category": "Exam Circular",
        "content": "The tentative schedule for AKTU B.Tech Odd Semester Examinations 2026-27 has been announced. All students must clear college fee dues and download their admit card before Dec 10, 2026.",
        "author": "Controller of Examinations",
        "date": "2026-11-09",
        "priority": "high",
        "is_read": False
    },
    {
        "id": "ann-2",
        "title": "National Technical Symposium & Hackathon 'TechSparks 2026'",
        "category": "Campus Event",
        "content": "Registrations are now open for the 48-Hour AI & Web3 Hackathon. Attractive cash prizes worth ₹1,50,000 for top 3 teams. Students can form teams of up to 4 members.",
        "author": "Department of CSE",
        "date": "2026-11-07",
        "priority": "normal",
        "is_read": True
    },
    {
        "id": "ann-3",
        "title": "Campus Placement Drive: TCS Digital & Infosys SP/DSE",
        "category": "Placement",
        "content": "Eligible 3rd and final year students (B.Tech CSE/IT with CGPA >= 7.0 and no active backlogs) must submit their updated resumes to the T&P portal by Friday.",
        "author": "Training & Placement Cell",
        "date": "2026-11-05",
        "priority": "high",
        "is_read": True
    }
]

NOTIFICATIONS = [
    {"id": "notif-1", "title": "Attendance Safe Zone Alert", "message": "Your current attendance is 76.2%. You can safely miss up to 2 lectures under the 75% rule.", "type": "attendance", "time": "2 hours ago", "is_read": False},
    {"id": "notif-2", "title": "Assignment Deadline Approaching", "message": "Compiler Design Assignment #2 is due in 3 days. Submit before 28th Nov.", "type": "assignment", "time": "5 hours ago", "is_read": False},
    {"id": "notif-3", "title": "New Study Material Uploaded", "message": "Dr. Sharma uploaded Unit 4 DBMS Transaction Processing slides in Study Material.", "type": "content", "time": "1 day ago", "is_read": True},
    {"id": "notif-4", "title": "Semester Fee Reminder", "message": "Pending tuition balance of ₹20,000 is due on Nov 30 to avoid examination hold.", "type": "fee", "time": "2 days ago", "is_read": True},
    {"id": "notif-5", "title": "Exam Schedule Notification", "message": "AKTU B.Tech Sem 5 exam timetable is published. Check the Examinations tab.", "type": "exam", "time": "3 days ago", "is_read": True}
]

EVENTS = [
    {"id": "ev-1", "title": "TechSparks 2026 Annual Hackathon", "type": "fest", "date": "2026-11-21 to 2026-11-23", "location": "Main Auditorium & Innovation Labs", "description": "National level hackathon bringing together over 50 engineering colleges."},
    {"id": "ev-2", "title": "Guru Nanak Jayanti Holiday", "type": "holiday", "date": "2026-11-27", "location": "Campus Closed", "description": "Institute holiday on the auspicious occasion of Guru Nanak Jayanti."},
    {"id": "ev-3", "title": "Pre-University Examination (PUE)", "type": "exam", "date": "2026-12-01 to 2026-12-08", "location": "All Academic Blocks", "description": "Mandatory internal pre-university tests for Odd Semester."},
    {"id": "ev-4", "title": "Guest Lecture on Generative AI & LLMs", "type": "academic", "date": "2026-12-11", "location": "Seminar Hall B", "description": "Industry talk by Senior AI Research Engineer from Google DeepMind."}
]

CONTENT = [
    {"id": "cnt-1", "subject_code": "KCS501", "subject_name": "Database Management Systems", "unit": 1, "title": "Relational Data Models, ER Diagrams & Relational Algebra", "type": "pdf", "size": "4.2 MB", "faculty": "Dr. Sharma", "date": "2026-10-15"},
    {"id": "cnt-2", "subject_code": "KCS501", "subject_name": "Database Management Systems", "unit": 2, "title": "SQL Deep Dive, Complex Queries & Trigger Functions", "type": "pdf", "size": "3.8 MB", "faculty": "Dr. Sharma", "date": "2026-10-28"},
    {"id": "cnt-3", "subject_code": "KCS502", "subject_name": "Compiler Design", "unit": 1, "title": "Lexical Analysis, Regular Expressions & Finite Automata", "type": "notes", "size": "2.9 MB", "faculty": "Prof. Verma", "date": "2026-10-20"},
    {"id": "cnt-4", "subject_code": "KCS502", "subject_name": "Compiler Design", "unit": 2, "title": "Top-Down & Bottom-Up LR Parsing Techniques", "type": "pdf", "size": "5.1 MB", "faculty": "Prof. Verma", "date": "2026-11-04"},
    {"id": "cnt-5", "subject_code": "KCS503", "subject_name": "Design & Analysis of Algorithms", "unit": 3, "title": "Dynamic Programming: Knapsack, LCS & Matrix Chain Multiplication", "type": "notes", "size": "3.4 MB", "faculty": "Dr. Gupta", "date": "2026-11-01"},
    {"id": "cnt-6", "subject_code": "BNC501", "subject_name": "Constitution of India, Law & Engg", "unit": 1, "title": "Preamble, Fundamental Rights & Directive Principles of State Policy", "type": "pdf", "size": "2.1 MB", "faculty": "Dr. K. Saxena", "date": "2026-09-25"}
]

MESSAGES = [
    {
        "thread_id": "thr-1",
        "faculty_name": "Dr. Sharma",
        "subject": "KCS501 DBMS Doubt Regarding BCNF Decomposition",
        "unread_count": 0,
        "messages": [
            {"sender": "student", "text": "Good afternoon Sir, in yesterday's lecture regarding 3NF vs BCNF, can a relation with candidate key (A, B) have functional dependency C -> B in 3NF?", "time": "Yesterday 03:15 PM"},
            {"sender": "faculty", "text": "Yes Kanishka! In 3NF, C -> B is permitted if B is a prime attribute (part of candidate key AB), even if C is not a superkey. In BCNF however, this is strictly forbidden.", "time": "Yesterday 04:30 PM"},
            {"sender": "student", "text": "Got it Sir, thank you so much for the clarification!", "time": "Yesterday 04:35 PM"}
        ]
    },
    {
        "thread_id": "thr-2",
        "faculty_name": "Prof. Verma",
        "subject": "Compiler Design Lab Assignment Submission",
        "unread_count": 1,
        "messages": [
            {"sender": "faculty", "text": "Please make sure your Lex/Flex code compiles on GCC Linux without warnings before uploading to the portal.", "time": "Today 10:15 AM"}
        ]
    }
]

DOCUMENTS = [
    {"id": "doc-1", "name": "College Student ID Card (Digital Pass)", "category": "Identity", "upload_date": "2026-08-10", "size": "1.2 MB", "type": "pdf", "verified": True},
    {"id": "doc-2", "name": "Semester 5 Bonafide & Character Certificate", "category": "Academic", "upload_date": "2026-09-01", "size": "850 KB", "type": "pdf", "verified": True},
    {"id": "doc-3", "name": "AKTU Official Marksheet - Semester 4", "category": "Examination", "upload_date": "2026-07-20", "size": "2.4 MB", "type": "pdf", "verified": True},
    {"id": "doc-4", "name": "Hostel & Transport Allotment Slip", "category": "Amenity", "upload_date": "2026-08-12", "size": "650 KB", "type": "pdf", "verified": True}
]

# =====================================================================
# PYDANTIC REQUEST / RESPONSE SCHEMAS
# =====================================================================

class AssignmentSubmitRequest(BaseModel):
    assignment_id: str
    file_name: str
    remarks: Optional[str] = None

class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: Dict[int, int] # { question_id: selected_option_index }

class PaymentRequest(BaseModel):
    amount: float = Field(gt=0)
    payment_mode: str = Field(description="UPI, NetBanking, or Card")
    notes: Optional[str] = None

class SendMessageRequest(BaseModel):
    faculty_name: str
    subject: str
    text: str

class QRVerifyRequest(BaseModel):
    qr_data: str
    verification_type: str = Field(default="attendance", description="attendance, event, or access")

class ProfileUpdateRequest(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    parent_phone: Optional[str] = None

class AdminEntityCreate(BaseModel):
    entity_type: str
    data: Dict[str, Any]

# =====================================================================
# ENDPOINT IMPLEMENTATIONS
# =====================================================================

@router.get("/profile")
def get_user_profile(role: str = "student", student_id: Optional[str] = None,
                     authorization: Optional[str] = Header(default=None)):
    """Return the profile of whoever signed in (the token wins over the role hint)."""
    actor = resolve_actor(authorization)
    if actor:
        if actor["role"] == "student":
            return {"profile": student_public_profile(actor["record"]), "role": "student"}
        if actor["role"] == "teacher":
            return {"profile": faculty_public_profile(actor["record"]), "role": "teacher"}
        if actor["role"] == "parent":
            return {"profile": parent_public_profile(actor["record"]), "role": "parent"}
        if actor["role"] == "admin":
            return {"profile": actor["record"], "role": "admin"}

    if role == "parent":
        return {"profile": PARENT_DB["parent1"], "role": "parent"}
    if student_id and student_id in STUDENT_DB:
        return {"profile": STUDENT_DB[student_id], "role": "student"}
    if student_id:
        for s in ADMIN_STUDENTS:
            if s.get("id") == student_id or s.get("roll_no") == student_id:
                return {
                    "profile": {
                        "id": s["id"],
                        "full_name": s["name"],
                        "roll_no": s["roll_no"],
                        "camu_id": s.get("camu_id"),
                        "course": f"{s.get('course', 'B.Tech')} {s.get('branch', 'CSE')}",
                        "semester": int(s.get("semester", 1)),
                        "section": s.get("section", "A"),
                        "email": s.get("email"),
                        "phone": s.get("phone"),
                        "photo_url": s.get("photo_url"),
                        "college": "RBMI Group of Institutions, Bareilly",
                        "blood_group": s.get("blood_group", "B+"),
                        "dob": s.get("dob", "2004-01-01"),
                        "parent_name": s.get("parent_name", ""),
                        "parent_phone": s.get("parent_phone", ""),
                        "parent_email": s.get("parent_email", ""),
                        "address": s.get("address", "")
                    },
                    "role": "student"
                }
    return {"profile": STUDENT_DB.get("student1", {}), "role": "student"}

@router.post("/profile/update")
def update_profile(req: ProfileUpdateRequest, authorization: Optional[str] = Header(default=None)):
    actor = resolve_actor(authorization)
    if actor and actor["role"] == "student":
        student = actor["record"]
        if req.phone:
            student["phone"] = req.phone
        if req.address:
            student["address"] = req.address
        if req.parent_phone:
            student["parent_phone"] = req.parent_phone
        jobs_store.log("student", student.get("name", "Student"), "Updated contact details", student.get("roll_no", ""))
        return {"success": True, "profile": student_public_profile(student)}
    if actor and actor["role"] == "teacher":
        faculty = actor["record"]
        if req.phone:
            faculty["phone"] = req.phone
        return {"success": True, "profile": faculty_public_profile(faculty)}

    student = STUDENT_DB["student1"]
    if req.phone:
        student["phone"] = req.phone
    if req.address:
        student["address"] = req.address
    if req.parent_phone:
        student["parent_phone"] = req.parent_phone
    return {"success": True, "profile": student}

@router.get("/timetable")
def get_timetable(day: Optional[str] = None):
    """Get weekly or daily timetable with period slots and live class status."""
    today_name = datetime.now().strftime("%A")
    if day and day in TIMETABLE:
        return {"day": day, "schedule": TIMETABLE[day], "today": today_name}
    return {"timetable": TIMETABLE, "today": today_name}

@router.get("/assignments")
def get_assignments(status: Optional[str] = "all", subject: Optional[str] = None,
                   authorization: Optional[str] = Header(default=None)):
    """List assignments with the signed-in student's own submission + marks."""
    actor = resolve_actor(authorization)
    student_id = actor["id"] if actor and actor["role"] == "student" else None
    results = [_assignment_view(item, student_id) for item in ASSIGNMENTS]
    if status == "pending":
        results = [a for a in results if not a["is_submitted"]]
    elif status == "submitted":
        results = [a for a in results if a["is_submitted"]]
    elif status == "overdue":
        today_str = date.today().isoformat()
        results = [a for a in results if not a["is_submitted"] and a["due_date"] < today_str]

    if subject and subject.upper() != "ALL":
        results = [a for a in results if a["subject_code"].upper() == subject.upper()]

    return {"assignments": results, "total": len(results)}

@router.post("/assignments/submit")
def submit_assignment(req: AssignmentSubmitRequest, authorization: Optional[str] = Header(default=None)):
    """Submit an assignment for the signed-in student (faculty sees it immediately)."""
    actor = resolve_actor(authorization)
    student_id = actor["id"] if actor and actor["role"] == "student" else None
    for asg in ASSIGNMENTS:
        if asg["id"] != req.assignment_id:
            continue

        if student_id:
            record = actor["record"]
            submission = _upsert_submission(
                assignment_id=asg["id"],
                student_id=student_id,
                student_name=record.get("name", "Student"),
                file_name=req.file_name,
                remarks=req.remarks,
            )
            jobs_store.log("student", record.get("name", "Student"), "Submitted an assignment", asg["title"], student_id=student_id)
            return {
                "success": True,
                "message": f"Assignment '{asg['title']}' submitted successfully!",
                "assignment": _assignment_view(asg, student_id),
                "submission": submission,
            }

        asg["is_submitted"] = True
        asg["submission_date"] = date.today().isoformat()
        asg["submission_file"] = req.file_name
        asg["status"] = "submitted"
        return {"success": True, "message": f"Assignment '{asg['title']}' submitted successfully!", "assignment": asg}
    raise HTTPException(404, "Assignment not found")

@router.get("/assessments")
def get_assessments():
    """Get active, upcoming, and completed assessments."""
    return {"assessments": ASSESSMENTS}

@router.get("/assessments/{test_id}")
def get_assessment_details(test_id: str):
    """Get test questions for active test."""
    for test in ASSESSMENTS:
        if test["id"] == test_id:
            # Hide correct options from frontend payload for integrity
            safe_questions = []
            for q in test.get("questions", []):
                safe_questions.append({
                    "id": q["id"],
                    "question": q["question"],
                    "options": q["options"],
                    "marks": q["marks"]
                })
            return {
                "id": test["id"],
                "title": test["title"],
                "subject_code": test["subject_code"],
                "duration_minutes": test["duration_minutes"],
                "total_marks": test["total_marks"],
                "questions": safe_questions
            }
    raise HTTPException(404, "Assessment not found")

@router.post("/assessments/submit")
def submit_assessment(req: AssessmentSubmitRequest):
    """Grade assessment and compute score."""
    target_test = None
    for test in ASSESSMENTS:
        if test["id"] == req.assessment_id:
            target_test = test
            break
    if not target_test or "questions" not in target_test:
        raise HTTPException(404, "Assessment not found or already submitted")

    score = 0
    total_marks = target_test["total_marks"]
    breakdown = []

    for q in target_test["questions"]:
        user_ans = req.answers.get(q["id"])
        is_correct = user_ans == q["correct_option"]
        if is_correct:
            score += q["marks"]
        breakdown.append({
            "question_id": q["id"],
            "question": q["question"],
            "user_choice": user_ans,
            "correct_choice": q["correct_option"],
            "is_correct": is_correct,
            "marks_earned": q["marks"] if is_correct else 0
        })

    pct = round((score / total_marks) * 100, 1)
    target_test["status"] = "completed"
    target_test["score"] = score
    target_test["percentage"] = pct
    target_test["submitted_at"] = datetime.now().strftime("%Y-%m-%d %I:%M %p")

    return {
        "success": True,
        "score": score,
        "total_marks": total_marks,
        "percentage": pct,
        "passed": pct >= 40.0,
        "breakdown": breakdown
    }

@router.get("/exams")
def get_exams():
    """List examination schedule and admit card access."""
    return {"exams": EXAMS, "session": "Odd Semester 2026-27"}

@router.get("/results")
def get_results(authorization: Optional[str] = Header(default=None)):
    """Get the signed-in student's own result card (or the class sample)."""
    actor = resolve_actor(authorization)
    if actor and actor["role"] == "student":
        return _student_result_view(actor["record"])
    return RESULTS

@router.get("/fees")
def get_fees(authorization: Optional[str] = Header(default=None)):
    """Get the signed-in student's own fee ledger (admin sees the same numbers)."""
    actor = resolve_actor(authorization)
    if actor and actor["role"] == "student":
        return _student_fee_view(actor["record"])
    return FEES_DATA

@router.post("/fees/pay")
def pay_fee(req: PaymentRequest, authorization: Optional[str] = Header(default=None)):
    """Process online fee payment through secure gateway flow (simulated Razorpay/UPI)."""
    actor = resolve_actor(authorization)
    if actor and actor["role"] == "student":
        return _pay_student_fee(actor["record"], req)
    if req.amount <= 0:
        raise HTTPException(400, "Payment amount must be greater than zero")
    if req.amount > FEES_DATA["pending_fee"]:
        raise HTTPException(400, f"Amount exceeds remaining pending fee of ₹{FEES_DATA['pending_fee']}")

    tx_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
    rec_no = f"REC-{uuid.uuid4().hex[:6].upper()}"
    today_str = date.today().isoformat()

    FEES_DATA["paid_fee"] += req.amount
    FEES_DATA["pending_fee"] -= req.amount

    new_tx = {
        "id": tx_id,
        "ref": f"RBMI-FEE-2026-{uuid.uuid4().hex[:4].upper()}",
        "date": today_str,
        "amount": req.amount,
        "mode": req.payment_mode,
        "status": "Success",
        "receipt_no": rec_no
    }
    FEES_DATA["history"].insert(0, new_tx)

    return {
        "success": True,
        "message": f"Payment of ₹{req.amount:,.2f} completed successfully!",
        "transaction": new_tx,
        "remaining_pending": FEES_DATA["pending_fee"]
    }

@router.get("/announcements")
def get_announcements():
    """Get institute announcements and notices."""
    return {"announcements": ANNOUNCEMENTS}

@router.post("/announcements/{ann_id}/read")
def mark_announcement_read(ann_id: str):
    for a in ANNOUNCEMENTS:
        if a["id"] == ann_id:
            a["is_read"] = True
            return {"success": True}
    raise HTTPException(404, "Announcement not found")

@router.get("/notifications")
def get_notifications():
    """Get categorized notifications center."""
    unread_count = sum(1 for n in NOTIFICATIONS if not n["is_read"])
    return {"notifications": NOTIFICATIONS, "unread_count": unread_count}

@router.post("/notifications/read-all")
def mark_all_notifications_read():
    for n in NOTIFICATIONS:
        n["is_read"] = True
    return {"success": True, "unread_count": 0}

@router.delete("/notifications/{notif_id}")
def clear_notification(notif_id: str):
    global NOTIFICATIONS
    NOTIFICATIONS = [n for n in NOTIFICATIONS if n["id"] != notif_id]
    return {"success": True}

@router.get("/events")
def get_events():
    """Get academic calendar events, holidays, fests."""
    return {"events": EVENTS}

@router.get("/content")
def get_content(subject_code: Optional[str] = None):
    """Get academic study content, lecture notes, syllabus PDFs."""
    items = CONTENT
    if subject_code and subject_code.upper() != "ALL":
        items = [c for c in items if c["subject_code"].upper() == subject_code.upper()]
    return {"content": items}

@router.get("/messages")
def get_messages():
    """Get student-faculty message threads."""
    return {"threads": MESSAGES}

@router.post("/messages/send")
def send_message(req: SendMessageRequest):
    """Send message to faculty."""
    thread = None
    for t in MESSAGES:
        if t["faculty_name"].lower() == req.faculty_name.lower():
            thread = t
            break
    if not thread:
        thread = {
            "thread_id": f"thr-{len(MESSAGES) + 1}",
            "faculty_name": req.faculty_name,
            "subject": req.subject,
            "unread_count": 0,
            "messages": []
        }
        MESSAGES.insert(0, thread)

    thread["messages"].append({
        "sender": "student",
        "text": req.text,
        "time": datetime.now().strftime("Today %I:%M %p")
    })
    return {"success": True, "thread": thread}

@router.get("/documents")
def get_documents():
    """Get student and institutional documents."""
    return {"documents": DOCUMENTS}

@router.post("/documents/upload")
def upload_document(name: str = Form(...), category: str = Form(...), file: UploadFile = File(...)):
    """Upload student document with size and extension validation."""
    if not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
        raise HTTPException(400, "Only PDF, PNG, or JPEG documents are permitted")
    
    new_doc = {
        "id": f"doc-{len(DOCUMENTS) + 1}",
        "name": name,
        "category": category,
        "upload_date": date.today().isoformat(),
        "size": "1.5 MB",
        "type": file.filename.split(".")[-1].lower(),
        "verified": True
    }
    DOCUMENTS.insert(0, new_doc)
    return {"success": True, "document": new_doc}

@router.post("/qr/verify")
def verify_qr(req: QRVerifyRequest):
    """Verify QR code for attendance punch or event entry pass."""
    data = req.qr_data.strip()
    # Accept standard format: e.g. "RBMI-ATTENDANCE:KCS501:LEC-2" or "RBMI-EVENT:TECHSPARKS2026"
    return {
        "verified": True,
        "timestamp": datetime.now().isoformat(),
        "type": req.verification_type,
        "code": data,
        "details": {
            "message": "QR verification successful. Attendance logged in academic register.",
            "subject": "KCS501 - Database Management Systems",
            "student": STUDENT_DB["student1"]["full_name"],
            "roll_no": STUDENT_DB["student1"]["roll_no"]
        }
    }

@router.get("/parent/child")
def get_parent_child_data(authorization: Optional[str] = Header(default=None)):
    """Get the signed-in parent's own child's academic summary."""
    actor = resolve_actor(authorization)
    if actor and actor["role"] == "parent":
        child = _find_student_by_roll((actor["record"] or {}).get("child_roll", ""))
        if child:
            return _parent_child_view(child)
    student = STUDENT_DB["student1"]
    return {
        "student": student,
        "attendance": {
            "percentage": 76.2,
            "days_present": 32,
            "total_days": 42,
            "status": "Safe (Above 75%)",
            "leave_advice": "Up to 2 days leave safe"
        },
        "academic": {
            "cgpa": 8.42,
            "sgpa": 8.65,
            "rank": "Top 10%",
            "active_backlogs": 0
        },
        "fees": {
            "total": FEES_DATA["total_fee"],
            "paid": FEES_DATA["paid_fee"],
            "pending": FEES_DATA["pending_fee"],
            "due_date": FEES_DATA["next_due_date"]
        },
        "recent_marks": [
            {"subject": "DBMS (KCS501)", "exam": "Unit Test 1", "score": "24 / 30"},
            {"subject": "Compiler Design (KCS502)", "exam": "Unit Test 1", "score": "22 / 30"},
            {"subject": "Constitution of India (BNC501)", "exam": "Unit Test 1", "score": "27 / 30"}
        ],
        "mentor_remarks": "Kanishka shows excellent participation in practical labs and theoretical discussions. Consistent attendance record maintained."
    }

@router.get("/analytics")
def get_analytics():
    """Get high-level academic visualizations & analytics data."""
    return {
        "attendance_trend": [
            {"month": "Aug", "percentage": 85.0},
            {"month": "Sep", "percentage": 78.5},
            {"month": "Oct", "percentage": 82.0},
            {"month": "Nov", "percentage": 76.2}
        ],
        "subject_attendance": [
            {"code": "KCS501", "name": "DBMS", "percentage": 82.6},
            {"code": "KCS502", "name": "Compiler", "percentage": 74.0},
            {"code": "KCS503", "name": "DAA", "percentage": 79.5},
            {"code": "BNC501", "name": "Constitution", "percentage": 85.0},
            {"code": "KCS504", "name": "Web Tech", "percentage": 71.4}
        ],
        "assignment_stats": {
            "total": 4,
            "submitted": 2,
            "pending": 2,
            "completion_rate": 50.0
        },
        "fee_stats": {
            "total": FEES_DATA["total_fee"],
            "paid": FEES_DATA["paid_fee"],
            "pending": FEES_DATA["pending_fee"],
            "percentage_paid": round((FEES_DATA["paid_fee"] / FEES_DATA["total_fee"]) * 100, 1)
        }
    }

# =====================================================================
# ADMIN PANEL ENDPOINTS
# =====================================================================

ADMIN_STUDENTS = [
    {
        "id": "std-1",
        "name": "Kanishka Saxena",
        "password": "student123",
        "photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        "roll_no": "210161010001",
        "camu_id": "RBMI2021001",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": 5,
        "section": "A",
        "batch": "2023-2027",
        "email": "kanishka.saxena@rbmi.in",
        "phone": "+91 98765 43210",
        "dob": "2003-08-15",
        "gender": "Female",
        "blood_group": "B+",
        "parent_name": "Rajesh Saxena",
        "parent_relation": "Father",
        "parent_phone": "+91 98765 12345",
        "parent_email": "rajesh.saxena@example.com",
        "address": "142 Civil Lines, Bareilly",
        "city": "Bareilly",
        "state": "Uttar Pradesh",
        "pincode": "243001",
        "attendance": "76.2%",
        "status": "Active",
        "created_at": "2024-07-15"
    },
    {
        "id": "std-2",
        "name": "Rohan Gupta",
        "password": "rohan123",
        "photo_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        "roll_no": "210161010002",
        "camu_id": "RBMI2021002",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": 5,
        "section": "A",
        "batch": "2023-2027",
        "email": "rohan.gupta@rbmi.in",
        "phone": "+91 98765 43211",
        "dob": "2003-05-20",
        "gender": "Male",
        "blood_group": "O+",
        "parent_name": "Sunil Gupta",
        "parent_relation": "Father",
        "parent_phone": "+91 98765 12346",
        "parent_email": "sunil.gupta@example.com",
        "address": "45 Rampur Garden, Bareilly",
        "city": "Bareilly",
        "state": "Uttar Pradesh",
        "pincode": "243001",
        "attendance": "84.5%",
        "status": "Active",
        "created_at": "2024-07-16"
    },
    {
        "id": "std-3",
        "name": "Priya Sharma",
        "password": "priya123",
        "photo_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        "roll_no": "210161010003",
        "camu_id": "RBMI2021003",
        "course": "B.Tech",
        "branch": "Information Technology",
        "semester": 3,
        "section": "B",
        "batch": "2024-2028",
        "email": "priya.sharma@rbmi.in",
        "phone": "+91 98765 43212",
        "dob": "2004-11-10",
        "gender": "Female",
        "blood_group": "A+",
        "parent_name": "Manoj Sharma",
        "parent_relation": "Father",
        "parent_phone": "+91 98765 12347",
        "parent_email": "manoj.sharma@example.com",
        "address": "88 Rajendra Nagar, Bareilly",
        "city": "Bareilly",
        "state": "Uttar Pradesh",
        "pincode": "243122",
        "attendance": "68.0%",
        "status": "Low Attendance",
        "created_at": "2024-07-18"
    },
    {
        "id": "std-4",
        "name": "Vikram Singh",
        "password": "vikram123",
        "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "roll_no": "210161010004",
        "camu_id": "RBMI2021004",
        "course": "B.Tech",
        "branch": "Computer Science & Engineering",
        "semester": 5,
        "section": "A",
        "batch": "2023-2027",
        "email": "vikram.singh@rbmi.in",
        "phone": "+91 98765 43213",
        "dob": "2003-02-14",
        "gender": "Male",
        "blood_group": "AB+",
        "parent_name": "Devendra Singh",
        "parent_relation": "Father",
        "parent_phone": "+91 98765 12348",
        "parent_email": "devendra.singh@example.com",
        "address": "12 Subhash Nagar, Bareilly",
        "city": "Bareilly",
        "state": "Uttar Pradesh",
        "pincode": "243002",
        "attendance": "91.2%",
        "status": "Active",
        "created_at": "2024-07-19"
    }
]

# Every roster record also carries the academic + financial numbers that the other
# roles read. Student, faculty and admin screens therefore show exactly the same
# figures instead of three disconnected mock datasets.
_FEE_SEED = {
    "std-1": (85000, 65000, 8.42, 8.65),
    "std-2": (85000, 85000, 8.10, 8.24),
    "std-3": (78000, 60000, 7.65, 7.80),
    "std-4": (85000, 85000, 9.02, 9.14),
}
for _seed_student in ADMIN_STUDENTS:
    _total, _paid, _cgpa, _sgpa = _FEE_SEED.get(_seed_student["id"], (85000, 0, None, None))
    _seed_student.setdefault("fee_total", _total)
    _seed_student.setdefault("fee_paid", _paid)
    _seed_student.setdefault("cgpa", _cgpa)
    _seed_student.setdefault("sgpa", _sgpa)
    _seed_student.setdefault("mentor", "Dr. Sharma")
    _seed_student.setdefault("semesters", [])

ADMIN_FACULTY = [
    {
        "id": "fac-1",
        "name": "Dr. Sharma",
        "email": "teacher1@example.com",
        "department": "Computer Science & Engineering",
        "subjects": ["KCS501 DBMS", "KCS551 DBMS Lab"],
        "designation": "Associate Professor",
        "password": "teacher123",
        "semesters": [5],
        "phone": "+91 98765 70001",
        "office": "Block B - 204",
    },
    {
        "id": "fac-2",
        "name": "Prof. Verma",
        "email": "verma@example.com",
        "department": "Computer Science & Engineering",
        "subjects": ["KCS502 Compiler Design"],
        "designation": "Assistant Professor",
        "password": "verma123",
        "semesters": [5],
        "phone": "+91 98765 70002",
        "office": "Block B - 210",
    },
    {
        "id": "fac-3",
        "name": "Dr. Gupta",
        "email": "gupta@example.com",
        "department": "Computer Science & Engineering",
        "subjects": ["KCS503 DAA", "KCS553 DAA Lab"],
        "designation": "Professor",
        "password": "gupta123",
        "semesters": [5],
        "phone": "+91 98765 70003",
        "office": "Block B - 108",
    },
]

ADMIN_COURSES = [
    {"id": "crs-1", "code": "BTECH-CSE", "name": "B.Tech in Computer Science & Engineering", "duration": "4 Years", "total_semesters": 8, "intake": 120},
    {"id": "crs-2", "code": "BTECH-IT", "name": "B.Tech in Information Technology", "duration": "4 Years", "total_semesters": 8, "intake": 60},
    {"id": "crs-3", "code": "MCA", "name": "Master of Computer Applications", "duration": "2 Years", "total_semesters": 4, "intake": 60}
]

@router.get("/admin/summary")
def get_admin_summary():
    """Get high level admin metrics."""
    return {
        "total_students": len(ADMIN_STUDENTS) + 348,
        "total_faculty": len(ADMIN_FACULTY) + 24,
        "total_courses": len(ADMIN_COURSES),
        "total_revenue_collected": "₹ 1.84 Cr",
        "pending_dues": "₹ 24.5 Lakhs",
        "avg_attendance": "78.4%",
        "students": ADMIN_STUDENTS,
        "faculty": ADMIN_FACULTY,
        "courses": ADMIN_COURSES
    }

@router.post("/admin/students")
def create_student(data: Dict[str, Any]):
    name = (data.get("name") or "").strip()
    roll_no = (data.get("roll_no") or "").strip()
    phone = (data.get("phone") or "").strip()
    semester = data.get("semester")

    if not name:
        raise HTTPException(status_code=400, detail="Student full name is required.")
    if not roll_no:
        raise HTTPException(status_code=400, detail="University Roll Number is required.")
    if not phone:
        raise HTTPException(status_code=400, detail="Student mobile phone number is required.")
    if not semester:
        raise HTTPException(status_code=400, detail="Semester is required.")

    # Check for duplicate roll number
    if any(s["roll_no"].lower() == roll_no.lower() for s in ADMIN_STUDENTS):
        raise HTTPException(status_code=400, detail=f"A student with Roll Number {roll_no} already exists.")

    password = (data.get("password") or "").strip()
    if not password:
        password = f"std@{roll_no[-4:] if len(roll_no) >= 4 else '1234'}"

    std_idx = len(ADMIN_STUDENTS) + 1
    generated_id = f"std-{std_idx}"
    camu_id = data.get("camu_id") or f"RBMI2024{std_idx:03d}"
    course = data.get("course") or "B.Tech"
    branch = data.get("branch") or "Computer Science & Engineering"
    email = data.get("email") or f"{name.lower().replace(' ', '.')}@rbmi.in"
    photo_url = data.get("photo_url") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={roll_no}"

    new_student = {
        "id": generated_id,
        "name": name,
        "password": password,
        "photo_url": photo_url,
        "roll_no": roll_no,
        "camu_id": camu_id,
        "course": course,
        "branch": branch,
        "semester": int(semester),
        "section": data.get("section") or "A",
        "batch": data.get("batch") or "2024-2028",
        "email": email,
        "phone": phone,
        "dob": data.get("dob") or "2004-01-01",
        "gender": data.get("gender") or "Not Specified",
        "blood_group": data.get("blood_group") or "B+",
        "parent_name": data.get("parent_name") or "Guardian",
        "parent_relation": data.get("parent_relation") or "Father",
        "parent_phone": data.get("parent_phone") or "",
        "parent_email": data.get("parent_email") or "",
        "address": data.get("address") or "Bareilly, Uttar Pradesh",
        "city": data.get("city") or "Bareilly",
        "state": data.get("state") or "Uttar Pradesh",
        "pincode": data.get("pincode") or "243001",
        "attendance": "100.0%",
        "status": data.get("status") or "Active",
        "fee_total": 85000,
        "fee_paid": 0,
        "cgpa": None,
        "sgpa": None,
        "mentor": data.get("mentor") or "Dr. Sharma",
        "created_at": date.today().isoformat()
    }
    ADMIN_STUDENTS.insert(0, new_student)

    # Sync to STUDENT_DB for lookup if needed
    STUDENT_DB[generated_id] = {
        "id": generated_id,
        "full_name": name,
        "photo_url": photo_url,
        "roll_no": roll_no,
        "camu_id": camu_id,
        "course": f"{course} {branch}",
        "year": max(1, (int(semester) + 1) // 2),
        "semester": int(semester),
        "section": new_student["section"],
        "email": email,
        "phone": phone,
        "college": "RBMI Group of Institutions, Bareilly",
        "blood_group": new_student["blood_group"],
        "dob": new_student["dob"],
        "parent_name": new_student["parent_name"],
        "parent_phone": new_student["parent_phone"],
        "parent_email": new_student["parent_email"],
        "address": new_student["address"],
        "password": password
    }

    return {
        "success": True,
        "student": new_student,
        "message": f"Student {name} (Roll: {roll_no}) successfully registered with designated login credentials!"
    }

@router.get("/admin/students/{std_id}")
def get_student_details(std_id: str):
    for s in ADMIN_STUDENTS:
        if s["id"] == std_id:
            return {"success": True, "student": s}
    raise HTTPException(status_code=404, detail="Student record not found.")

@router.put("/admin/students/{std_id}")
def update_student_record(std_id: str, data: Dict[str, Any]):
    for s in ADMIN_STUDENTS:
        if s["id"] == std_id:
            for key, val in data.items():
                if key != "id" and val is not None:
                    s[key] = val
            # Sync to STUDENT_DB as well
            if std_id in STUDENT_DB:
                STUDENT_DB[std_id].update({
                    "full_name": s.get("name"),
                    "photo_url": s.get("photo_url"),
                    "roll_no": s.get("roll_no"),
                    "camu_id": s.get("camu_id"),
                    "course": f"{s.get('course')} {s.get('branch')}",
                    "semester": int(s.get("semester", 1)),
                    "section": s.get("section"),
                    "email": s.get("email"),
                    "phone": s.get("phone"),
                    "blood_group": s.get("blood_group"),
                    "dob": s.get("dob"),
                    "parent_name": s.get("parent_name"),
                    "parent_phone": s.get("parent_phone"),
                    "parent_email": s.get("parent_email"),
                    "address": s.get("address"),
                    "password": s.get("password")
                })
            return {
                "success": True,
                "student": s,
                "message": f"Student record for {s.get('name')} updated successfully."
            }
    raise HTTPException(status_code=404, detail="Student record not found.")

@router.delete("/admin/students/{std_id}")
def delete_student(std_id: str):
    global ADMIN_STUDENTS
    initial_len = len(ADMIN_STUDENTS)
    ADMIN_STUDENTS = [s for s in ADMIN_STUDENTS if s["id"] != std_id]
    if len(ADMIN_STUDENTS) == initial_len:
        raise HTTPException(status_code=404, detail="Student not found.")
    return {"success": True, "message": "Student record deleted successfully."}

@router.post("/auth/login")
def login_student(data: Dict[str, Any]):
    identifier = (data.get("identifier") or data.get("email") or data.get("roll_no") or "").strip()
    password = (data.get("password") or "").strip()

    if not identifier:
        raise HTTPException(status_code=400, detail="Please enter your College Email or University Roll Number.")
    if not password:
        raise HTTPException(status_code=400, detail="Please enter your account password.")

    # Check Admin credentials
    if identifier.lower() in ["admin", "admin1@example.com", "admin@rbmi.in"] and password in ["admin123", "admin"]:
        return {
            "success": True,
            "role": "admin",
            "token": f"admin.admin-1.{uuid.uuid4().hex[:12]}",
            "user": {"id": "admin-1", "email": "admin1@example.com", "name": "System Admin"},
            "profile": {
                "id": "admin-1",
                "full_name": "System Administrator",
                "role": "admin",
                "email": "admin1@example.com",
                "status": "Active",
                "college": "RBMI Group of Institutions"
            }
        }

    # Check Faculty credentials - every faculty member the admin creates can sign in
    faculty = None
    for row in ADMIN_FACULTY:
        aliases = {row.get("email", "").lower(), row.get("name", "").lower()}
        if identifier.lower() in aliases and password == row.get("password"):
            faculty = row
            break
    if not faculty and identifier.lower() in ("teacher", "faculty") and password in ("teacher123", "teacher"):
        faculty = ADMIN_FACULTY[0]
    if faculty:
        return {
            "success": True,
            "role": "teacher",
            "token": f"teacher.{faculty['id']}.{uuid.uuid4().hex[:12]}",
            "user": {
                "id": faculty["id"],
                "email": faculty.get("email", ""),
                "name": faculty.get("name", "Faculty"),
            },
            "profile": faculty_public_profile(faculty),
        }

    # Check Parent credentials
    if identifier.lower() in ["parent", "parent1@example.com"] and password in ["parent123", "parent"]:
        return {
            "success": True,
            "role": "parent",
            "token": f"parent.parent-1.{uuid.uuid4().hex[:12]}",
            "user": {"id": "parent-1", "email": "parent1@example.com", "name": "Rajesh Saxena"},
            "profile": PARENT_DB.get("parent1", {
                "id": "parent-1",
                "full_name": "Rajesh Saxena",
                "role": "parent",
                "email": "parent1@example.com",
                "child_name": "Kanishka Saxena",
                "child_roll": "210161010001",
                "child_course": "B.Tech CSE - Sem 5",
                "status": "Active"
            })
        }

    # Match Student by Roll Number OR Email
    target_student = None
    for s in ADMIN_STUDENTS:
        if s.get("roll_no", "").strip().lower() == identifier.lower() or s.get("email", "").strip().lower() == identifier.lower():
            target_student = s
            break

    if not target_student:
        raise HTTPException(
            status_code=401,
            detail="No student account found with this Roll Number or Email. Please check your credentials or contact the Admin."
        )

    # Validate student's password
    student_pwd = target_student.get("password") or "student123"
    if student_pwd != password:
        raise HTTPException(
            status_code=401,
            detail="Incorrect password for this student account. Please enter the password configured during registration."
        )

    student_id = target_student["id"]
    student_profile = {
        "id": student_id,
        "full_name": target_student["name"],
        "name": target_student["name"],
        "roll_no": target_student["roll_no"],
        "camu_id": target_student.get("camu_id", "RBMI2024001"),
        "course": f"{target_student.get('course', 'B.Tech')} {target_student.get('branch', 'CSE')}",
        "branch": target_student.get("branch", "Computer Science & Engineering"),
        "year": max(1, (int(target_student.get("semester", 1)) + 1) // 2),
        "semester": int(target_student.get("semester", 1)),
        "section": target_student.get("section", "A"),
        "batch": target_student.get("batch", "2024-2028"),
        "email": target_student.get("email", identifier),
        "phone": target_student.get("phone", ""),
        "photo_url": target_student.get("photo_url", ""),
        "attendance": target_student.get("attendance", "100.0%"),
        "status": target_student.get("status", "Active"),
        "dob": target_student.get("dob", ""),
        "gender": target_student.get("gender", ""),
        "blood_group": target_student.get("blood_group", ""),
        "parent_name": target_student.get("parent_name", ""),
        "parent_phone": target_student.get("parent_phone", ""),
        "address": target_student.get("address", ""),
        "role": "student",
        "college": "RBMI Group of Institutions, Bareilly"
    }

    # Synchronize into active student state
    STUDENT_DB[student_id] = student_profile
    STUDENT_DB["student1"] = student_profile

    return {
        "success": True,
        "role": "student",
        "token": f"student.{student_id}.{uuid.uuid4().hex[:12]}",
        "user": {
            "id": student_id,
            "email": target_student.get("email"),
            "name": target_student["name"],
            "roll_no": target_student["roll_no"]
        },
        "profile": student_profile,
        "message": f"Welcome back, {target_student['name']}!"
    }


# =====================================================================
# CROSS-ROLE LINKAGE  (student <-> faculty <-> admin)
# ---------------------------------------------------------------------
# Everything below connects the three portals to one set of facts:
#   * a student created by the admin can sign in and sees their own numbers
#   * that student appears in the faculty roster (attendance, dues, resume)
#   * faculty assignments + circulars reach the student, and the student's
#     submission comes back to faculty for grading
#   * resumes and job applications uploaded in Job Finds are visible to
#     faculty and admin, and campus openings posted by them reach students
# =====================================================================

ADMIN_PROFILE: Dict[str, Any] = {
    "id": "admin-1",
    "full_name": "System Administrator",
    "name": "System Administrator",
    "role": "admin",
    "email": "admin1@example.com",
    "designation": "Registrar & System Administrator",
    "status": "Active",
    "college": "RBMI Group of Institutions, Bareilly",
}

SUBMISSIONS: List[Dict[str, Any]] = [
    {
        "id": "sub-1",
        "assignment_id": "asg-1",
        "student_id": "std-1",
        "student_name": "Kanishka Saxena",
        "file_name": "Kanishka_DBMS_Assignment1.pdf",
        "submitted_at": "2026-11-12",
        "marks": 18,
        "remarks": "Well structured ER diagram and correct 3NF mapping.",
        "graded_by": "Dr. Sharma",
        "graded_at": "2026-11-14",
        "status": "graded",
    },
    {
        "id": "sub-2",
        "assignment_id": "asg-4",
        "student_id": "std-1",
        "student_name": "Kanishka Saxena",
        "file_name": "CyberLaw_CaseStudy_Final.pdf",
        "submitted_at": "2026-11-08",
        "marks": 14,
        "remarks": "Good case selection, cite one more statute next time.",
        "graded_by": "Dr. K. Saxena",
        "graded_at": "2026-11-10",
        "status": "graded",
    },
    {
        "id": "sub-3",
        "assignment_id": "asg-1",
        "student_id": "std-4",
        "student_name": "Vikram Singh",
        "file_name": "Vikram_DBMS_A1.pdf",
        "submitted_at": "2026-11-13",
        "marks": None,
        "remarks": "",
        "graded_by": "",
        "graded_at": "",
        "status": "submitted",
    },
]


# ---------------------------------------------------- identity / tokens
def _token_of(authorization: Optional[str]) -> str:
    if not authorization:
        return ""
    value = authorization.strip()
    if value.lower().startswith("bearer "):
        value = value[7:].strip()
    return value


def _find_student(student_id: str) -> Optional[Dict[str, Any]]:
    for row in ADMIN_STUDENTS:
        if row.get("id") == student_id:
            return row
    return None


def _find_student_by_roll(roll_no: str) -> Optional[Dict[str, Any]]:
    if not roll_no:
        return None
    for row in ADMIN_STUDENTS:
        if str(row.get("roll_no", "")).strip().lower() == str(roll_no).strip().lower():
            return row
    return None


def _find_faculty(faculty_id: str) -> Optional[Dict[str, Any]]:
    for row in ADMIN_FACULTY:
        if row.get("id") == faculty_id:
            return row
    return None


def resolve_actor(authorization: Optional[str]) -> Optional[Dict[str, Any]]:
    """Turn the login token into the actual caller (role + roster record).

    Tokens are issued as  <role>.<record-id>.<random>  by /auth/login, e.g.
    student.std-3.8f2c1a9b4d
    teacher.fac-2.51ab77c0e9
    admin.admin-1.9d0fa1c2b3
    parent.parent-1.73a1c9b02e
    """
    token = _token_of(authorization)
    if not token:
        return None

    role, identifier = "", ""
    parts = token.split(".")
    if len(parts) >= 3 and parts[0] in ("student", "teacher", "admin", "parent"):
        role, identifier = parts[0], parts[1]
    elif token.startswith("student_jwt_"):  # tokens issued by the older build
        role, identifier = "student", "std-1"
    elif token.startswith("demo_token_"):
        pieces = token.split("_")
        role = pieces[2] if len(pieces) > 2 else "student"
        identifier = {
            "student": "std-1",
            "teacher": "fac-1",
            "admin": "admin-1",
            "parent": "parent-1",
        }.get(role, "std-1")
    else:
        return None

    if role == "student":
        record = _find_student(identifier) or _find_student("std-1")
        if not record:
            return None
        name = record.get("name") or "Student"
    elif role == "teacher":
        record = _find_faculty(identifier) or (ADMIN_FACULTY[0] if ADMIN_FACULTY else None)
        if not record:
            return None
        name = record.get("name") or "Faculty"
    elif role == "parent":
        record = PARENT_DB.get("parent1")
        name = (record or {}).get("full_name", "Parent")
    else:
        record = ADMIN_PROFILE
        name = ADMIN_PROFILE["full_name"]

    return {"role": role, "id": identifier or record.get("id"), "record": record, "name": name}


def _require(authorization: Optional[str], roles: List[str], what: str = "This action") -> Dict[str, Any]:
    actor = resolve_actor(authorization)
    if not actor:
        raise HTTPException(401, "Please sign in again - your session could not be read.")
    if actor["role"] not in roles:
        raise HTTPException(403, f"{what} is only for: {', '.join(roles)} accounts.")
    return actor


# ------------------------------------------------------- profile shaping
def _attendance_percent(student: Dict[str, Any]) -> float:
    raw = str(student.get("attendance", "0")).replace("%", "").strip()
    try:
        return max(0.0, min(100.0, float(raw)))
    except ValueError:
        return 0.0


def _number(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def student_public_profile(student: Dict[str, Any]) -> Dict[str, Any]:
    semester = int(student.get("semester") or 1)
    return {
        "id": student.get("id"),
        "full_name": student.get("name"),
        "name": student.get("name"),
        "roll_no": student.get("roll_no"),
        "camu_id": student.get("camu_id"),
        "course": f"{student.get('course', 'B.Tech')} {student.get('branch', 'Computer Science & Engineering')}",
        "branch": student.get("branch"),
        "year": max(1, (semester + 1) // 2),
        "semester": semester,
        "section": student.get("section", "A"),
        "batch": student.get("batch"),
        "email": student.get("email"),
        "phone": student.get("phone"),
        "photo_url": student.get("photo_url"),
        "attendance": student.get("attendance"),
        "status": student.get("status", "Active"),
        "dob": student.get("dob"),
        "gender": student.get("gender"),
        "blood_group": student.get("blood_group"),
        "parent_name": student.get("parent_name"),
        "parent_phone": student.get("parent_phone"),
        "parent_email": student.get("parent_email"),
        "address": student.get("address"),
        "mentor": student.get("mentor"),
        "role": "student",
        "college": "RBMI Group of Institutions, Bareilly",
        "resume_uploaded": bool(student.get("resume_uploaded")),
    }


def faculty_public_profile(faculty: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": faculty.get("id"),
        "full_name": faculty.get("name"),
        "name": faculty.get("name"),
        "role": "teacher",
        "email": faculty.get("email"),
        "department": faculty.get("department", "Computer Science & Engineering"),
        "designation": faculty.get("designation", "Faculty"),
        "subjects": faculty.get("subjects", []),
        "semesters": faculty.get("semesters", []),
        "phone": faculty.get("phone"),
        "office": faculty.get("office"),
        "status": faculty.get("status", "Active"),
        "college": "RBMI Group of Institutions, Bareilly",
    }


def parent_public_profile(parent: Dict[str, Any]) -> Dict[str, Any]:
    child = _find_student_by_roll(parent.get("child_roll", ""))
    return {
        **parent,
        "role": "parent",
        "college": "RBMI Group of Institutions, Bareilly",
        "child_name": (child or {}).get("name", parent.get("child_name")),
        "child_semester": (child or {}).get("semester", parent.get("child_semester")),
    }


# ---------------------------------------------------------- submissions
def _submission_for(assignment_id: str, student_id: str) -> Optional[Dict[str, Any]]:
    for sub in SUBMISSIONS:
        if sub["assignment_id"] == assignment_id and sub["student_id"] == student_id:
            return sub
    return None


def _upsert_submission(assignment_id: str, student_id: str, student_name: str,
                       file_name: str, remarks: Optional[str] = None) -> Dict[str, Any]:
    existing = _submission_for(assignment_id, student_id)
    if existing:
        existing.update({
            "file_name": file_name,
            "student_name": student_name,
            "submitted_at": date.today().isoformat(),
            "status": "resubmitted" if existing.get("marks") is not None else "submitted",
        })
        if remarks:
            existing["student_remarks"] = remarks
        return existing

    submission = {
        "id": f"sub-{uuid.uuid4().hex[:8]}",
        "assignment_id": assignment_id,
        "student_id": student_id,
        "student_name": student_name,
        "file_name": file_name,
        "submitted_at": date.today().isoformat(),
        "marks": None,
        "remarks": remarks or "",
        "graded_by": "",
        "graded_at": "",
        "status": "submitted",
    }
    SUBMISSIONS.insert(0, submission)
    return submission


def _assignment_view(assignment: Dict[str, Any], student_id: Optional[str]) -> Dict[str, Any]:
    item = dict(assignment)
    if not student_id:
        return item
    submission = _submission_for(assignment["id"], student_id)
    item["is_submitted"] = bool(submission)
    item["submission_date"] = submission["submitted_at"] if submission else None
    item["submission_file"] = submission["file_name"] if submission else None
    item["marks_awarded"] = submission.get("marks") if submission else None
    item["feedback"] = submission.get("remarks") if submission else ""
    item["status"] = (
        "graded" if submission and submission.get("marks") is not None
        else "submitted" if submission
        else "pending"
    )
    return item


def _student_assignments(student_id: str) -> Dict[str, Any]:
    items = [_assignment_view(item, student_id) for item in ASSIGNMENTS]
    graded = [item for item in items if item["status"] == "graded"]
    submitted = [item for item in items if item["is_submitted"]]
    return {
        "total": len(items),
        "submitted": len(submitted),
        "pending": len(items) - len(submitted),
        "graded": len(graded),
        "average_marks": round(
            sum(_number(item.get("marks_awarded")) for item in graded) / len(graded), 1
        ) if graded else None,
        "items": items,
    }


# --------------------------------------------------------- money / results
def _student_fee_view(student: Dict[str, Any]) -> Dict[str, Any]:
    total = _number(student.get("fee_total"), 85000.0) or 85000.0
    paid = min(_number(student.get("fee_paid")), total)
    pending = max(0.0, total - paid)

    heads = [
        ("Annual Academic Tuition Fee", 0.765),
        ("University Exam & Enrollment Fee", 0.076),
        ("Advanced Computing & AI Lab Amenity", 0.1),
        ("Library, E-Journals & Book Bank", 0.059),
    ]
    remaining_paid = paid
    breakdown = []
    for label, share in heads:
        amount = round(total * share, -2)
        settled = min(amount, remaining_paid)
        remaining_paid = max(0.0, remaining_paid - settled)
        breakdown.append({
            "item": label,
            "amount": int(amount),
            "paid": int(settled),
            "status": "paid" if settled >= amount else "pending",
        })

    history = list(student.get("fee_history") or [])
    if not history and paid > 0:
        history = [{
            "id": "pay-101",
            "ref": f"RBMI-FEE-{student.get('roll_no', '2026')}-8941",
            "date": "2026-08-14",
            "amount": int(paid),
            "mode": "Online UPI / NetBanking",
            "status": "Success",
            "receipt_no": "REC-94102",
        }]

    return {
        "student_name": student.get("name"),
        "roll_no": student.get("roll_no"),
        "total_fee": int(total),
        "paid_fee": int(paid),
        "pending_fee": int(pending),
        "next_due_date": FEES_DATA["next_due_date"] if pending > 0 else "",
        "breakdown": breakdown,
        "history": history,
    }


def _pay_student_fee(student: Dict[str, Any], req: PaymentRequest) -> Dict[str, Any]:
    if req.amount <= 0:
        raise HTTPException(400, "Payment amount must be greater than zero")
    total = _number(student.get("fee_total"), 85000.0)
    paid = _number(student.get("fee_paid"))
    pending = max(0.0, total - paid)
    if req.amount > pending:
        raise HTTPException(400, f"Amount exceeds remaining pending fee of ₹{int(pending)}")

    transaction = {
        "id": f"PAY-{uuid.uuid4().hex[:8].upper()}",
        "ref": f"RBMI-FEE-2026-{uuid.uuid4().hex[:4].upper()}",
        "date": date.today().isoformat(),
        "amount": req.amount,
        "mode": req.payment_mode,
        "status": "Success",
        "receipt_no": f"REC-{uuid.uuid4().hex[:6].upper()}",
    }
    student["fee_paid"] = paid + req.amount
    student.setdefault("fee_history", []).insert(0, transaction)
    jobs_store.log("student", student.get("name", "Student"), "Paid semester fees",
                   f"₹{int(req.amount):,} via {req.payment_mode}", student_id=student.get("id"))

    ledger = _student_fee_view(student)
    return {
        "success": True,
        "message": f"Payment of ₹{req.amount:,.2f} completed successfully!",
        "transaction": transaction,
        "remaining_pending": ledger["pending_fee"],
        "fees": ledger,
    }


def _student_result_view(student: Dict[str, Any]) -> Dict[str, Any]:
    cgpa = student.get("cgpa")
    published = cgpa is not None
    return {
        **RESULTS,
        "student_name": student.get("name"),
        "roll_no": student.get("roll_no"),
        "published": published,
        "current_cgpa": _number(cgpa),
        "current_sgpa": _number(student.get("sgpa") or cgpa),
        "semesters": RESULTS["semesters"] if published else [],
        "message": "" if published else "Your result card has not been published yet.",
    }


def _parent_child_view(student: Dict[str, Any]) -> Dict[str, Any]:
    pct = _attendance_percent(student)
    fees = _student_fee_view(student)
    graded = [sub for sub in SUBMISSIONS if sub["student_id"] == student.get("id") and sub.get("marks") is not None]
    return {
        "student": student_public_profile(student),
        "attendance": {
            "percentage": round(pct, 1),
            "days_present": round(42 * pct / 100),
            "total_days": 42,
            "status": "Safe (Above 75%)" if pct >= 75 else "Below 75% - condonation required",
            "leave_advice": f"Up to {max(0, int(42 * (pct - 75) / 100))} days leave safe" if pct >= 75 else "Attend all remaining lectures",
        },
        "academic": {
            "cgpa": _number(student.get("cgpa")),
            "sgpa": _number(student.get("sgpa")),
            "rank": "Top 10%" if _number(student.get("cgpa")) >= 8 else "Improving",
            "active_backlogs": 0,
        },
        "fees": {
            "total": fees["total_fee"],
            "paid": fees["paid_fee"],
            "pending": fees["pending_fee"],
            "due_date": fees["next_due_date"],
        },
        "recent_marks": [
            {
                "subject": sub.get("assignment_id", "").upper(),
                "exam": sub.get("assignment_id"),
                "score": f"{sub['marks']}",
            }
            for sub in graded[:4]
        ],
        "mentor_remarks": (
            f"{student.get('name')} is mentored by {student.get('mentor', 'the class mentor')}. "
            f"Current attendance is {round(pct, 1)}%."
        ),
    }


# ---------------------------------------------------------- roster rows
def student_roster_row(student: Dict[str, Any]) -> Dict[str, Any]:
    resume = jobs_store.get_resume(student.get("id", ""))
    applications = jobs_store.list_applications(student.get("id", ""))
    subs = [row for row in SUBMISSIONS if row["student_id"] == student.get("id")]
    pending_subs = [row for row in subs if row.get("marks") is None]
    fees = _student_fee_view(student)
    return {
        "id": student.get("id"),
        "name": student.get("name"),
        "roll_no": student.get("roll_no"),
        "email": student.get("email"),
        "phone": student.get("phone"),
        "course": student.get("course"),
        "branch": student.get("branch"),
        "semester": student.get("semester"),
        "section": student.get("section"),
        "status": student.get("status"),
        "attendance": round(_attendance_percent(student), 1),
        "cgpa": student.get("cgpa"),
        "pending_fee": fees["pending_fee"],
        "resume_uploaded": bool(resume),
        "resume_skills": (resume or {}).get("skills", [])[:8],
        "applications": len(applications),
        "submissions": len(subs),
        "pending_submissions": len(pending_subs),
    }


def _submission_rows() -> List[Dict[str, Any]]:
    rows = []
    for sub in SUBMISSIONS:
        assignment = next((item for item in ASSIGNMENTS if item["id"] == sub["assignment_id"]), None)
        student = _find_student(sub["student_id"])
        rows.append({
            **sub,
            "assignment_title": assignment["title"] if assignment else "Assignment",
            "subject_code": assignment["subject_code"] if assignment else "",
            "subject_name": assignment["subject_name"] if assignment else "",
            "max_marks": assignment["max_marks"] if assignment else 20,
            "roll_no": (student or {}).get("roll_no", ""),
        })
    return rows


# ------------------------------------------------------------ aggregates
def build_student_me(student: Dict[str, Any]) -> Dict[str, Any]:
    pct = _attendance_percent(student)
    assignments = _student_assignments(student["id"])
    resume = jobs_store.get_resume(student["id"])
    applications = jobs_store.list_applications(student["id"])
    return {
        "role": "student",
        "profile": student_public_profile(student),
        "attendance": {
            "percentage": round(pct, 1),
            "lectures_held": 168,
            "lectures_attended": round(168 * pct / 100),
            "status": "Safe" if pct >= 75 else "Below the 75% rule",
            "leave_advice": (
                f"You can miss up to {max(0, int(168 * (pct - 75) / 100))} more lectures"
                if pct >= 75 else "Attend every remaining lecture to recover"
            ),
        },
        "fees": _student_fee_view(student),
        "results": _student_result_view(student),
        "assignments": assignments,
        "faculty": [
            {
                "id": row["id"],
                "name": row["name"],
                "designation": row.get("designation"),
                "subjects": row.get("subjects", []),
                "email": row.get("email"),
            }
            for row in ADMIN_FACULTY
        ],
        "resume": {
            "uploaded": bool(resume),
            "file_name": (resume or {}).get("file_name"),
            "skills": (resume or {}).get("skills", []),
            "updated_at": (resume or {}).get("updated_at"),
            "strength": ((resume or {}).get("profile") or {}).get("strength", 0),
        },
        "applications": len(applications),
        "announcements": ANNOUNCEMENTS[:4],
        "activity": jobs_store.activity(10, student_id=student["id"]),
    }


def build_faculty_me(faculty: Dict[str, Any]) -> Dict[str, Any]:
    students = [student_roster_row(row) for row in ADMIN_STUDENTS]
    submissions = _submission_rows()
    pending = [row for row in submissions if row.get("marks") is None]
    placement = jobs_store.stats()
    return {
        "role": "teacher",
        "profile": faculty_public_profile(faculty),
        "students": students,
        "submissions": submissions,
        "pending_submissions": pending,
        "subjects": faculty.get("subjects", []),
        "announcements": ANNOUNCEMENTS[:5],
        "openings": jobs_store.list_openings(active_only=True)[:5],
        "activity": jobs_store.activity(20),
        "stats": {
            "students": len(students),
            "avg_attendance": round(sum(row["attendance"] for row in students) / len(students), 1) if students else 0.0,
            "pending_reviews": len(pending),
            "resumes": placement["resumes"],
            "applications": placement["applications"],
            "below_75": len([row for row in students if row["attendance"] < 75]),
            "pending_dues": sum(row["pending_fee"] for row in students),
        },
    }


def build_admin_me() -> Dict[str, Any]:
    students = [student_roster_row(row) for row in ADMIN_STUDENTS]
    submissions = _submission_rows()
    placement = jobs_store.stats()
    return {
        "role": "admin",
        "profile": ADMIN_PROFILE,
        "students": students,
        "faculty": [faculty_public_profile(row) for row in ADMIN_FACULTY],
        "courses": ADMIN_COURSES,
        "submissions": submissions,
        "pending_submissions": [row for row in submissions if row.get("marks") is None],
        "openings": jobs_store.list_openings(active_only=True),
        "applications": jobs_store.list_applications(),
        "activity": jobs_store.activity(25),
        "announcements": ANNOUNCEMENTS[:5],
        "stats": {
            "students": len(students),
            "faculty": len(ADMIN_FACULTY),
            "courses": len(ADMIN_COURSES),
            "avg_attendance": round(sum(row["attendance"] for row in students) / len(students), 1) if students else 0.0,
            "below_75": len([row for row in students if row["attendance"] < 75]),
            "pending_dues": sum(row["pending_fee"] for row in students),
            "resumes": placement["resumes"],
            "applications": placement["applications"],
            "openings": placement["openings"],
        },
    }


# --------------------------------------------------------------- schemas
class GradeSubmissionRequest(BaseModel):
    marks: float = Field(ge=0)
    remarks: str = Field(default="", max_length=400)


class NewAssignmentRequest(BaseModel):
    subject_code: str = Field(min_length=3, max_length=12)
    title: str = Field(min_length=3, max_length=140)
    description: str = Field(default="", max_length=800)
    due_date: str = Field(min_length=6, max_length=20)
    max_marks: int = Field(default=20, ge=1, le=100)


class NewAnnouncementRequest(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    content: str = Field(min_length=5, max_length=1500)
    category: str = Field(default="Circular", max_length=40)
    priority: str = Field(default="normal", max_length=12)


class FacultyCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(default="", max_length=120)
    department: str = Field(default="Computer Science & Engineering", max_length=80)
    designation: str = Field(default="Assistant Professor", max_length=60)
    subjects: List[str] = Field(default_factory=list)
    semesters: List[int] = Field(default_factory=lambda: [5])
    password: str = Field(default="", max_length=60)
    phone: str = Field(default="", max_length=30)


# --------------------------------------------------------------- endpoints
@router.get("/me")
def get_me(authorization: Optional[str] = Header(default=None)):
    """One call that gives any signed-in role its connected view of the campus."""
    actor = _require(authorization, ["student", "teacher", "admin", "parent"])
    if actor["role"] == "student":
        return build_student_me(actor["record"])
    if actor["role"] == "teacher":
        return build_faculty_me(actor["record"])
    if actor["role"] == "admin":
        return build_admin_me()
    child = _find_student_by_roll((actor["record"] or {}).get("child_roll", ""))
    return {
        "role": "parent",
        "profile": parent_public_profile(actor["record"]),
        "child": _parent_child_view(child) if child else None,
        "announcements": ANNOUNCEMENTS[:4],
    }


@router.get("/faculty/overview")
def faculty_overview(authorization: Optional[str] = Header(default=None)):
    """Faculty home: roster, submissions waiting for marks, placements, activity."""
    actor = _require(authorization, ["teacher", "admin"], "The faculty roster")
    if actor["role"] == "admin":
        return build_admin_me()
    return build_faculty_me(actor["record"])


@router.get("/admin/linkage")
def admin_linkage(authorization: Optional[str] = Header(default=None)):
    """Admin hub: every student, every faculty member and the shared activity."""
    _require(authorization, ["admin"], "The campus link hub")
    return build_admin_me()


@router.get("/faculty/submissions")
def faculty_submissions(status: Optional[str] = "all",
                        authorization: Optional[str] = Header(default=None)):
    _require(authorization, ["teacher", "admin"], "Reviewing submissions")
    rows = _submission_rows()
    if status == "pending":
        rows = [row for row in rows if row.get("marks") is None]
    elif status == "graded":
        rows = [row for row in rows if row.get("marks") is not None]
    return {"success": True, "submissions": rows, "count": len(rows)}


@router.post("/faculty/submissions/{submission_id}/grade")
def grade_submission(submission_id: str, req: GradeSubmissionRequest,
                     authorization: Optional[str] = Header(default=None)):
    """Faculty awards marks; the student's assignment card updates immediately."""
    actor = _require(authorization, ["teacher", "admin"], "Grading submissions")
    submission = next((row for row in SUBMISSIONS if row["id"] == submission_id), None)
    if not submission:
        raise HTTPException(404, "Submission not found.")
    assignment = next((row for row in ASSIGNMENTS if row["id"] == submission["assignment_id"]), None)
    max_marks = assignment["max_marks"] if assignment else 100
    if req.marks > max_marks:
        raise HTTPException(400, f"Marks cannot be more than {max_marks}.")

    submission["marks"] = req.marks
    submission["remarks"] = req.remarks
    submission["graded_by"] = actor.get("name", "Faculty")
    submission["graded_at"] = date.today().isoformat()
    submission["status"] = "graded"
    jobs_store.log(
        actor["role"],
        actor.get("name", "Faculty"),
        "Graded a submission",
        f"{submission['student_name']} - {assignment['title'] if assignment else submission['assignment_id']}: {req.marks}/{max_marks}",
        student_id=submission["student_id"],
    )
    student = _find_student(submission["student_id"])
    return {
        "success": True,
        "submission": submission,
        "student_assignments": _student_assignments(student["id"]) if student else None,
        "message": f"Marks saved for {submission['student_name']}.",
    }


@router.post("/faculty/assignments")
def create_assignment(req: NewAssignmentRequest, authorization: Optional[str] = Header(default=None)):
    """Faculty post an assignment; it appears in every enrolled student's list."""
    actor = _require(authorization, ["teacher", "admin"], "Creating assignments")
    code = req.subject_code.strip().upper()
    subject = None
    for day in TIMETABLE.values():
        for slot in day:
            if slot["subject_code"].upper() == code:
                subject = slot
                break
        if subject:
            break
    if not subject:
        raise HTTPException(404, f"No subject is timetabled with code {code}.")

    assignment = {
        "id": f"asg-{uuid.uuid4().hex[:6]}",
        "subject_code": code,
        "subject_name": subject["subject_name"],
        "title": req.title.strip(),
        "description": req.description.strip(),
        "faculty": actor.get("name", "Faculty"),
        "due_date": req.due_date,
        "max_marks": req.max_marks,
        "attachments": [],
        "is_submitted": False,
        "submission_date": None,
        "submission_file": None,
        "marks_awarded": None,
        "status": "pending",
    }
    ASSIGNMENTS.insert(0, assignment)
    NOTIFICATIONS.insert(0, {
        "id": f"notif-{uuid.uuid4().hex[:6]}",
        "title": f"New assignment in {code}",
        "message": f"{actor.get('name', 'Faculty')} posted '{assignment['title']}' - due {req.due_date}.",
        "type": "assignment",
        "time": "Just now",
        "is_read": False,
    })
    jobs_store.log(actor["role"], actor.get("name", "Faculty"), "Created an assignment", f"{code}: {assignment['title']}")
    return {"success": True, "assignment": assignment, "message": "Assignment published to the class."}


@router.post("/announcements")
def create_announcement(req: NewAnnouncementRequest, authorization: Optional[str] = Header(default=None)):
    """Admin or faculty publish a circular that every student portal reads."""
    actor = _require(authorization, ["teacher", "admin"], "Publishing circulars")
    announcement = {
        "id": f"ann-{uuid.uuid4().hex[:6]}",
        "title": req.title.strip(),
        "category": req.category or "Circular",
        "content": req.content.strip(),
        "author": actor.get("name", "Administration"),
        "date": date.today().isoformat(),
        "priority": req.priority or "normal",
        "is_read": False,
    }
    ANNOUNCEMENTS.insert(0, announcement)
    NOTIFICATIONS.insert(0, {
        "id": f"notif-{uuid.uuid4().hex[:6]}",
        "title": announcement["title"],
        "message": announcement["content"][:140],
        "type": "announcement",
        "time": "Just now",
        "is_read": False,
    })
    jobs_store.log(actor["role"], actor.get("name", "Admin"), "Published a circular", announcement["title"])
    return {"success": True, "announcement": announcement, "message": "Circular published to all portals."}


@router.get("/faculty/students/{student_id}")
def faculty_student_detail(student_id: str, authorization: Optional[str] = Header(default=None)):
    """360 view of one student: fees, attendance, submissions, resume, applications."""
    _require(authorization, ["teacher", "admin"], "Viewing student records")
    student = _find_student(student_id)
    if not student:
        raise HTTPException(404, "Student record not found.")
    return {
        "success": True,
        "student": student_roster_row(student),
        "profile": student_public_profile(student),
        "attendance": build_student_me(student)["attendance"],
        "fees": _student_fee_view(student),
        "results": _student_result_view(student),
        "assignments": _student_assignments(student["id"]),
        "resume": jobs_store.get_resume(student["id"]),
        "applications": jobs_store.list_applications(student["id"]),
    }


@router.get("/admin/faculty")
def list_faculty(authorization: Optional[str] = Header(default=None)):
    _require(authorization, ["admin", "teacher"], "Reading the faculty list")
    return {
        "success": True,
        "faculty": [faculty_public_profile(row) for row in ADMIN_FACULTY],
        "count": len(ADMIN_FACULTY),
    }


@router.post("/admin/faculty")
def create_faculty(req: FacultyCreateRequest, authorization: Optional[str] = Header(default=None)):
    """Admin creates a faculty account; that faculty can sign in immediately."""
    actor = _require(authorization, ["admin"], "Creating faculty accounts")
    if any(row.get("email", "").lower() == req.email.strip().lower() and req.email for row in ADMIN_FACULTY):
        raise HTTPException(400, "A faculty member with this email already exists.")
    if any(row.get("name", "").lower() == req.name.strip().lower() for row in ADMIN_FACULTY):
        raise HTTPException(400, "A faculty member with this name already exists.")

    email = req.email.strip() or f"{req.name.lower().replace(' ', '.')}@rbmi.in"
    password = req.password.strip() or "fac@2026"
    faculty = {
        "id": f"fac-{len(ADMIN_FACULTY) + 1}",
        "name": req.name.strip(),
        "email": email,
        "department": req.department,
        "designation": req.designation,
        "subjects": req.subjects or ["General"] ,
        "semesters": req.semesters or [5],
        "password": password,
        "phone": req.phone,
        "office": "Block B",
        "status": "Active",
    }
    ADMIN_FACULTY.append(faculty)
    jobs_store.log(actor["role"], actor.get("name", "Admin"), "Created a faculty account", f"{faculty['name']} ({faculty['email']})")
    return {
        "success": True,
        "faculty": faculty_public_profile(faculty),
        "credentials": {"email": email, "password": password},
        "message": f"{faculty['name']} can now sign in with {email}.",
    }


@router.get("/linkage/activity")
def linkage_activity(limit: int = 25, authorization: Optional[str] = Header(default=None)):
    """Shared campus activity feed (upload -> apply -> grade -> circular)."""
    _require(authorization, ["student", "teacher", "admin"], "Reading campus activity")
    return {"success": True, "activity": jobs_store.activity(max(1, min(limit, 100)))}

