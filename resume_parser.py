"""
UniMind AI  |  Resume text extraction + skill parsing

The Job Finds section needs to understand an uploaded resume without any paid API:
  * PDF  -> pypdf text layer
  * DOCX -> the word/document.xml part inside the zip (no extra dependency)
  * TXT / MD -> plain decode

From the text we pull the student's name, email, phone, profile links, education,
experience and the technology skills they actually list. Those skills are then
used by job_scraper.py to score and rank live job-board results.
"""

from __future__ import annotations

import io
import re
import zipfile
from typing import Any, Dict, List

MAX_TEXT_CHARS = 20000

# Canonical skill -> the spellings that may appear inside a resume.
SKILL_LIBRARY: Dict[str, List[str]] = {
    # Programming languages
    "Python": ["python"],
    "Java": ["java"],
    "JavaScript": ["javascript", "js"],
    "TypeScript": ["typescript"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "c sharp"],
    "C": [" c "],
    "Go": ["golang", "go lang"],
    "Rust": ["rust"],
    "PHP": ["php"],
    "Kotlin": ["kotlin"],
    "Swift": ["swift"],
    "R": [" r programming", "rstudio"],
    "MATLAB": ["matlab"],
    "SQL": ["sql"],
    "Shell Scripting": ["shell scripting", "bash", "powershell"],
    # Frontend
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3"],
    "React": ["react", "react.js", "reactjs"],
    "Next.js": ["next.js", "nextjs"],
    "Angular": ["angular"],
    "Vue": ["vue", "vue.js", "vuejs"],
    "Tailwind CSS": ["tailwind"],
    "Bootstrap": ["bootstrap"],
    "jQuery": ["jquery"],
    "Redux": ["redux"],
    # Backend
    "Node.js": ["node.js", "nodejs", "node js"],
    "Express": ["express.js", "expressjs", "express js"],
    "Django": ["django"],
    "Flask": ["flask"],
    "FastAPI": ["fastapi", "fast api"],
    "Spring Boot": ["spring boot", "springboot"],
    "REST API": ["rest api", "restful", "rest apis"],
    "GraphQL": ["graphql"],
    "Microservices": ["microservices", "microservice"],
    # Data / AI
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Matplotlib": ["matplotlib"],
    "Scikit-learn": ["scikit", "sklearn", "scikit-learn"],
    "TensorFlow": ["tensorflow"],
    "PyTorch": ["pytorch"],
    "Keras": ["keras"],
    "Machine Learning": ["machine learning", "ml models"],
    "Deep Learning": ["deep learning", "neural network", "neural networks"],
    "NLP": ["nlp", "natural language processing"],
    "Computer Vision": ["computer vision", "opencv"],
    "Generative AI": ["generative ai", "genai", "gen ai", "llm", "large language model"],
    "Data Analysis": ["data analysis", "data analytics", "eda"],
    "Data Visualization": ["data visualization", "data visualisation", "dashboards"],
    "Power BI": ["power bi", "powerbi"],
    "Tableau": ["tableau"],
    "Excel": ["excel", "ms excel", "advanced excel"],
    "Statistics": ["statistics", "statistical"],
    "Big Data": ["big data", "hadoop", "spark"],
    # Databases
    "MySQL": ["mysql"],
    "PostgreSQL": ["postgres", "postgresql"],
    "MongoDB": ["mongodb", "mongo db"],
    "SQLite": ["sqlite"],
    "Redis": ["redis"],
    "Firebase": ["firebase"],
    "Supabase": ["supabase"],
    "Oracle": ["oracle db", "oracle database"],
    # Cloud / DevOps
    "AWS": ["aws", "amazon web services"],
    "Azure": ["azure"],
    "GCP": ["gcp", "google cloud"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"],
    "Linux": ["linux", "ubuntu"],
    "Git": ["git"],
    "GitHub": ["github"],
    "CI/CD": ["ci/cd", "cicd", "continuous integration"],
    "Jenkins": ["jenkins"],
    "Terraform": ["terraform"],
    "Nginx": ["nginx"],
    "Vercel": ["vercel"],
    "Heroku": ["heroku"],
    # Mobile
    "Android": ["android"],
    "iOS": ["ios development", "ios app"],
    "Flutter": ["flutter"],
    "React Native": ["react native"],
    # CS fundamentals
    "Data Structures": ["data structures"],
    "Algorithms": ["algorithms", "algorithm design"],
    "DBMS": ["dbms", "database management system"],
    "Operating Systems": ["operating systems", "operating system"],
    "Computer Networks": ["computer networks", "networking"],
    "OOP": ["oop", "object oriented", "object-oriented"],
    "System Design": ["system design", "low level design", "high level design"],
    "Software Engineering": ["software engineering", "sdlc"],
    "Cybersecurity": ["cybersecurity", "cyber security", "ethical hacking"],
    "Blockchain": ["blockchain", "solidity", "web3"],
    "IoT": ["iot", "internet of things", "arduino", "raspberry pi"],
    # Testing / tools / product
    "Selenium": ["selenium"],
    "Postman": ["postman"],
    "Unit Testing": ["unit testing", "junit", "pytest"],
    "Jira": ["jira"],
    "Agile": ["agile", "scrum"],
    "Figma": ["figma"],
    "Canva": ["canva"],
    "Photoshop": ["photoshop"],
    "SEO": ["seo", "search engine optimization"],
    "Digital Marketing": ["digital marketing"],
    "Content Writing": ["content writing", "copywriting"],
    # Soft skills
    "Communication": ["communication skills", "communication"],
    "Teamwork": ["teamwork", "team player", "collaboration"],
    "Leadership": ["leadership", "team lead"],
    "Problem Solving": ["problem solving", "problem-solving"],
    "Project Management": ["project management"],
    "Time Management": ["time management"],
    "Presentation": ["presentation skills", "public speaking"],
}

# Skill groups used to suggest realistic roles for a fresher.
ROLE_HINTS: Dict[str, List[str]] = {
    "Full Stack Developer": ["React", "Node.js", "Express", "MongoDB", "JavaScript", "TypeScript", "Next.js"],
    "Frontend Developer": ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Redux", "Next.js"],
    "Backend Developer": ["Python", "Django", "Flask", "FastAPI", "Node.js", "Java", "Spring Boot", "PostgreSQL", "MySQL"],
    "Data Analyst": ["SQL", "Excel", "Power BI", "Tableau", "Pandas", "Data Analysis", "Statistics"],
    "Data Scientist / ML Engineer": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Deep Learning"],
    "AI / LLM Engineer": ["Python", "Generative AI", "NLP", "Deep Learning", "FastAPI", "PyTorch"],
    "DevOps / Cloud Engineer": ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Jenkins"],
    "Mobile App Developer": ["Flutter", "React Native", "Kotlin", "Android", "Swift", "iOS"],
    "QA / Automation Engineer": ["Selenium", "Unit Testing", "Postman", "Java", "Python"],
    "Cybersecurity Analyst": ["Cybersecurity", "Linux", "Computer Networks", "Python"],
}

LINK_PATTERNS = {
    "linkedin": re.compile(r"(?:https?://)?(?:www\.)?linkedin\.com/[^\s,;)]+", re.I),
    "github": re.compile(r"(?:https?://)?(?:www\.)?github\.com/[^\s,;)]+", re.I),
    "portfolio": re.compile(r"https?://[^\s,;)]+", re.I),
}
EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:\+91[\s-]?)?[6-9]\d{9}\b|\+?\d{1,3}[\s-]\d{3,5}[\s-]\d{3,5}\b")
YEARS_RE = re.compile(r"(\d{1,2})\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?", re.I)
EDUCATION_RE = re.compile(
    r"(b\.?tech|b\.?e\b|bachelor|m\.?tech|master|mca|bca|b\.?sc|m\.?sc|diploma|12th|senior secondary|intermediate)",
    re.I,
)


# --------------------------------------------------------------- extraction
def extract_text(filename: str, data: bytes) -> str:
    """Return the plain text inside a PDF, DOCX, TXT or MD resume."""
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        try:
            from pypdf import PdfReader
        except ImportError as exc:  # pragma: no cover - depends on the host
            raise ValueError(
                "PDF reading needs the 'pypdf' package. Run: pip install -r requirements.txt"
            ) from exc
        reader = PdfReader(io.BytesIO(data))
        pages = [(page.extract_text() or "") for page in reader.pages]
        text = "\n".join(pages)
    elif name.endswith(".docx"):
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            xml = archive.read("word/document.xml").decode("utf-8", errors="ignore")
        xml = re.sub(r"</w:p>", "\n", xml)
        xml = re.sub(r"<w:tab[^>]*/>", " ", xml)
        text = re.sub(r"<[^>]+>", "", xml)
    elif name.endswith((".txt", ".md", ".rtf")):
        text = data.decode("utf-8", errors="ignore")
    else:
        raise ValueError("Please upload a PDF, DOCX, TXT or MD resume.")

    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    if len(text) < 40:
        raise ValueError(
            "No readable text was found in this file. If it is a scanned PDF, export it "
            "again as a text PDF or upload a DOCX/TXT copy."
        )
    return text[:MAX_TEXT_CHARS]


def _display_span(raw: str) -> str:
    """Title-case-ish cleanup for the resume name line."""
    parts = []
    for word in raw.split():
        if word.isupper() and len(word) > 1:
            parts.append(word.title())
        else:
            parts.append(word[0].upper() + word[1:] if word else word)
    return " ".join(parts)


def guess_name(text: str) -> str:
    skip = {"resume", "curriculum vitae", "curriculum-vitae", "cv", "biodata", "bio-data"}
    for line in text.split("\n")[:12]:
        candidate = line.strip(" |,-\t")
        if not candidate or len(candidate) > 42 or len(candidate) < 3:
            continue
        low = candidate.lower()
        if low in skip or "@" in candidate or "http" in low:
            continue
        if any(token in low for token in ("resume", "profile", "contact", "address", "email", "phone")):
            continue
        words = candidate.split()
        if not (1 < len(words) <= 4):
            continue
        if not re.fullmatch(r"[A-Za-z][A-Za-z.'\-\s]+", candidate):
            continue
        return _display_span(candidate)
    return ""


def detect_skills(text: str) -> List[str]:
    """Match the resume against the skill library, most specific first."""
    low = " " + text.lower() + " "
    found: List[str] = []
    for canonical, aliases in SKILL_LIBRARY.items():
        for alias in aliases:
            alias_low = alias.lower()
            if alias_low.isalpha() or " " in alias_low:
                pattern = r"(?<![a-z0-9])" + re.escape(alias_low) + r"(?![a-z0-9])"
            else:
                pattern = re.escape(alias_low)
            if re.search(pattern, low):
                found.append(canonical)
                break
    # Drop "C" when it only came from "C++"/"C#" style text.
    if "C" in found and "C++" in found and not re.search(r"(?<![\w+])c(?!\s*[+#])", low):
        found.remove("C")
    return found


def suggest_roles(skills: List[str]) -> List[str]:
    scored = []
    skill_set = set(skills)
    for role, needed in ROLE_HINTS.items():
        hits = len(skill_set.intersection(needed))
        if hits:
            scored.append((hits / len(needed), hits, role))
    scored.sort(reverse=True)
    return [role for _, hits, role in scored if hits >= 2][:3] or [role for _, _, role in scored[:2]]


def _find_education(text: str) -> str:
    for line in text.split("\n"):
        clean = line.strip(" •|-\t")
        if 8 <= len(clean) <= 120 and EDUCATION_RE.search(clean):
            return clean
    return ""


def _experience_years(text: str) -> float:
    values = [float(match.group(1)) for match in YEARS_RE.finditer(text) if int(match.group(1)) <= 40]
    if values:
        return max(values)
    low = text.lower()
    if any(word in low for word in ("fresher", "no experience", "seeking internship")):
        return 0.0
    return 0.0


def _links(text: str) -> Dict[str, str]:
    links: Dict[str, str] = {}
    for label, pattern in LINK_PATTERNS.items():
        match = pattern.search(text)
        if match:
            url = match.group(0).rstrip(".,);")
            if label == "portfolio" and (links.get("linkedin") == url or links.get("github") == url):
                continue
            if not url.startswith("http"):
                url = "https://" + url
            links[label] = url
    return links


def _headline(text: str, skills: List[str], roles: List[str]) -> str:
    for line in text.split("\n")[1:10]:
        clean = line.strip(" •|-\t")
        low = clean.lower()
        if 6 <= len(clean) <= 90 and any(
            word in low for word in ("developer", "engineer", "analyst", "intern", "student", "designer", "scientist")
        ):
            return clean
    if roles:
        return f"Aspiring {roles[0]}"
    if skills:
        return f"{skills[0]} enthusiast"
    return ""


def parse_resume(text: str, fallback_name: str = "") -> Dict[str, Any]:
    """Turn resume text into the structured profile the app stores and ranks with."""
    skills = detect_skills(text)
    roles = suggest_roles(skills)
    email_match = EMAIL_RE.search(text)
    phone_match = PHONE_RE.search(text)

    name = guess_name(text) or fallback_name.strip() or "Student"
    strength = 35
    strength += min(30, len(skills) * 2)
    if email_match:
        strength += 8
    if phone_match:
        strength += 7
    if _links(text):
        strength += 8
    if _find_education(text):
        strength += 7
    if len(text) > 1200:
        strength += 5

    return {
        "name": name,
        "email": email_match.group(0) if email_match else "",
        "phone": phone_match.group(0) if phone_match else "",
        "headline": _headline(text, skills, roles),
        "skills": skills,
        "suggested_roles": roles,
        "education": _find_education(text),
        "experience_years": _experience_years(text),
        "links": _links(text),
        "strength": min(98, strength),
        "word_count": len(text.split()),
        "text_preview": text[:1200],
    }
