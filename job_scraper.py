"""
UniMind AI  |  Job scraper for the "Job Finds" section

WHAT IT DOES
  Takes the skills from an uploaded resume plus an optional title/location search,
  scrapes several public job boards and the campus placement board, scores every
  opening against the student's skills, and returns the best matches together with
  the real application URLs.

SOURCES (all public, no API key)
  * Internshala  - HTML pages, parsed here with regex (internships + fresher jobs)
  * Remotive     - JSON feed for remote roles
  * Arbeitnow    - JSON job board (Europe / remote)
  * Jobicy       - JSON feed, supports India geo filter
  * Himalayas    - JSON feed for remote roles
  * RemoteOK     - JSON feed
  * UniMind Campus Board - curated campus drives with official career-page links,
                          always included so the section keeps working offline.

Each source is fetched in its own thread with a timeout, so one blocked site never
breaks the page. Results are cached for 10 minutes per query to be polite.
"""

from __future__ import annotations

import copy
import html as html_lib
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-IN,en;q=0.9",
}
TIMEOUT = httpx.Timeout(15.0, connect=8.0)
CACHE_TTL = 600
MAX_CACHE_ENTRIES = 40

_CACHE: Dict[str, Any] = {}
_CACHE_LOCK = threading.RLock()

CAMPUS_BOARD = "UniMind Campus Board"


# ------------------------------------------------------------------ helpers
def _clean(value: Optional[str], limit: int = 320) -> str:
    if not value:
        return ""
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", str(value), flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_lib.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def _get_json(url: str, params: Optional[dict] = None) -> Any:
    with httpx.Client(headers=HEADERS, timeout=TIMEOUT, follow_redirects=True) as client:
        response = client.get(url, params=params)
        response.raise_for_status()
        return response.json()


def _get_html(url: str) -> str:
    with httpx.Client(headers=HEADERS, timeout=TIMEOUT, follow_redirects=True) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.text


def _job(**fields) -> Dict[str, Any]:
    job = {
        "id": "",
        "title": "",
        "company": "",
        "location": "",
        "type": "Full-time",
        "salary": "",
        "skills": [],
        "description": "",
        "url": "",
        "source": "",
        "posted": "",
        "remote": False,
        "match": 0,
        "matched_skills": [],
    }
    job.update(fields)
    if not job["id"]:
        job["id"] = f"{job['source']}:{job['url']}".lower()
    return job


# ------------------------------------------------------------- live sources
def _internshala(query: str, limit: int = 18) -> List[Dict[str, Any]]:
    slug = re.sub(r"[^a-z0-9]+", "-", (query or "python").lower()).strip("-")
    pages = [
        (f"https://internshala.com/internships/matching-skills/{slug}/", "Internship"),
        (f"https://internshala.com/jobs/matching-skills/{slug}/", "Fresher Job"),
    ]
    results: List[Dict[str, Any]] = []
    for url, kind in pages:
        try:
            markup = _get_html(url)
        except Exception:
            continue
        results.extend(_parse_internshala(markup, kind, limit))
        if len(results) >= limit:
            break
    return results[:limit]


_INTERNSHALA_LINK = re.compile(
    r'href="(/(?:internship|job)/detail/[^"]+)"[^>]*>(.*?)</a>', re.S | re.I
)


def _parse_internshala(markup: str, kind: str, limit: int = 18) -> List[Dict[str, Any]]:
    links = list(_INTERNSHALA_LINK.finditer(markup))
    jobs: List[Dict[str, Any]] = []
    for index, match in enumerate(links[:limit]):
        start = match.end()
        end = links[index + 1].start() if index + 1 < len(links) else len(markup)
        block = markup[start:end]

        company_match = re.search(r'<p class="company-name">\s*(.*?)\s*</p>', block, re.S)
        location_match = re.search(r'locations.*?<a[^>]*>(.*?)</a>', block, re.S)
        stipend_match = re.search(r"<span class='stipend'>(.*?)</span>", block, re.S)
        duration_match = re.search(r"ic-16-calendar.*?<span>(.*?)</span>", block, re.S)
        about_match = re.search(r'<div class="about_job">.*?<div class="text">(.*?)</div>', block, re.S)
        posted_match = re.search(
            r'<div class="status-(?:success|danger|warning)[^"]*">.*?<span>(.*?)</span>', block, re.S
        )
        skill_tags = [_clean(tag, 60) for tag in re.findall(r"<div class='job_skill'>(.*?)</div>", block, re.S)]

        title = _clean(match.group(2), 140)
        if not title:
            continue
        salary = _clean(stipend_match.group(1), 60) if stipend_match else ""
        duration = _clean(duration_match.group(1), 40) if duration_match else ""

        jobs.append(
            _job(
                title=title,
                company=_clean(company_match.group(1), 90) if company_match else "Internshala listing",
                location=_clean(location_match.group(1), 70) if location_match else "India",
                type=kind,
                salary=salary,
                skills=[tag for tag in skill_tags if tag],
                description=_clean(about_match.group(1), 400) if about_match else "",
                url="https://internshala.com" + match.group(1),
                source="Internshala",
                posted=_clean(posted_match.group(1), 40) if posted_match else "",
                remote="work from home" in block.lower() or "remote" in block.lower(),
                extra={"duration": duration},
            )
        )
    return jobs


def _remotive(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    payload = _get_json(
        "https://remotive.com/api/remote-jobs",
        params={"search": query or "developer", "limit": max(limit, 10)},
    )
    jobs = []
    for row in (payload.get("jobs") or [])[:limit]:
        jobs.append(
            _job(
                title=_clean(row.get("title"), 140),
                company=_clean(row.get("company_name"), 90),
                location=_clean(row.get("candidate_required_location"), 70) or "Remote",
                type=(row.get("job_type") or "Full-time").replace("_", " ").title(),
                salary=_clean(row.get("salary"), 60),
                skills=[_clean(tag, 40) for tag in (row.get("tags") or [])][:8],
                description=_clean(row.get("description"), 400),
                url=row.get("url") or "",
                source="Remotive",
                posted=_clean(str(row.get("publication_date") or ""), 30),
                remote=True,
            )
        )
    return [job for job in jobs if job["url"]]


def _arbeitnow(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    payload = _get_json("https://www.arbeitnow.com/api/job-board-api")
    rows = payload.get("data") or []
    needle = (query or "").lower()
    jobs = []
    for row in rows:
        haystack = f"{row.get('title', '')} {row.get('description', '')} {' '.join(row.get('tags') or [])}".lower()
        if needle and needle not in haystack:
            continue
        jobs.append(
            _job(
                title=_clean(row.get("title"), 140),
                company=_clean(row.get("company_name"), 90),
                location=_clean(row.get("location"), 70) or ("Remote" if row.get("remote") else "Europe"),
                type="Remote" if row.get("remote") else ((row.get("job_types") or ["Full-time"])[0]).replace("_", " ").title(),
                salary="",
                skills=[_clean(tag, 40) for tag in (row.get("tags") or [])][:8],
                description=_clean(row.get("description"), 400),
                url=row.get("url") or "",
                source="Arbeitnow",
                posted=datetime.fromtimestamp(row["created_at"]).strftime("%d %b %Y") if row.get("created_at") else "",
                remote=bool(row.get("remote")),
            )
        )
        if len(jobs) >= limit:
            break
    return jobs


def _jobicy(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    params = {"count": max(10, limit), "geo": "india"}
    if query:
        params["tag"] = query
    payload = _get_json("https://jobicy.com/api/v2/remote-jobs", params=params)
    jobs = []
    for row in (payload.get("jobs") or [])[:limit]:
        jobs.append(
            _job(
                title=_clean(row.get("jobTitle"), 140),
                company=_clean(row.get("companyName"), 90),
                location=_clean(row.get("jobGeo"), 70) or "Remote",
                type=_clean(row.get("jobType"), 30) or "Full-time",
                salary="",
                skills=[_clean(tag, 40) for tag in (row.get("jobIndustry") or [])][:6],
                description=_clean(row.get("jobExcerpt") or row.get("jobDescription"), 400),
                url=row.get("url") or "",
                source="Jobicy",
                posted=_clean(str(row.get("pubDate") or ""), 30),
                remote=True,
            )
        )
    return [job for job in jobs if job["url"]]


def _himalayas(query: str, limit: int = 15) -> List[Dict[str, Any]]:
    payload = _get_json("https://himalayas.app/jobs/api", params={"limit": max(10, limit * 2)})
    needle = (query or "").lower()
    jobs = []
    for row in payload.get("jobs") or []:
        haystack = f"{row.get('title', '')} {row.get('description', '')} {' '.join(row.get('categories') or [])}".lower()
        if needle and needle not in haystack:
            continue
        salary = ""
        if row.get("minSalary") and row.get("maxSalary"):
            salary = f"{row.get('currency', 'USD')} {row['minSalary']:,} - {row['maxSalary']:,} / yr"
        jobs.append(
            _job(
                title=_clean(row.get("title"), 140),
                company=_clean(row.get("companyName"), 90),
                location=", ".join(row.get("locationRestrictions") or []) or "Remote",
                type="Remote" if "remote" in str(row.get("employmentType", "")).lower() else _clean(row.get("employmentType"), 30) or "Full-time",
                salary=salary,
                skills=[_clean(item.replace("-", " "), 40) for item in (row.get("categories") or [])][:6],
                description=_clean(row.get("excerpt") or row.get("description"), 400),
                url=row.get("applicationLink") or row.get("guid") or row.get("url") or "",
                source="Himalayas",
                posted=_clean(str(row.get("pubDate") or ""), 30),
                remote=True,
            )
        )
        if len(jobs) >= limit:
            break
    return [job for job in jobs if job["url"]]


def _remoteok(query: str, limit: int = 12) -> List[Dict[str, Any]]:
    payload = _get_json("https://remoteok.com/api")
    needle = (query or "").lower()
    jobs = []
    for row in payload:
        if not isinstance(row, dict) or not row.get("position"):
            continue
        haystack = f"{row.get('position', '')} {row.get('description', '')} {' '.join(row.get('tags') or [])}".lower()
        if needle and needle not in haystack:
            continue
        jobs.append(
            _job(
                title=_clean(row.get("position"), 140),
                company=_clean(row.get("company"), 90),
                location=_clean(row.get("location"), 60) or "Remote",
                type="Remote",
                salary=f"${row['salary_min']:,}+ / yr" if row.get("salary_min") else "",
                skills=[_clean(tag, 40) for tag in (row.get("tags") or [])][:8],
                description=_clean(row.get("description"), 400),
                url=row.get("url") or "",
                source="RemoteOK",
                posted=_clean(str(row.get("date") or ""), 30),
                remote=True,
            )
        )
        if len(jobs) >= limit:
            break
    return [job for job in jobs if job["url"]]


# ------------------------------------------------------- campus placement board
CURATED_JOBS: List[Dict[str, Any]] = [
    {
        "title": "Assistant System Engineer (Fresher)",
        "company": "TCS",
        "location": "Pan India",
        "type": "Full-time",
        "salary": "₹ 3.6 - 7.0 LPA",
        "skills": ["C", "C++", "Java", "Python", "SQL", "Data Structures", "Algorithms", "Communication"],
        "description": "TCS NextStep campus hiring for B.Tech/MCA 2026 graduates. National Qualifier Test followed by technical and HR interview.",
        "url": "https://nextstep.tcs.com/campus/",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Systems Engineer / Digital Specialist",
        "company": "Infosys",
        "location": "Bengaluru, Pune, Hyderabad",
        "type": "Full-time",
        "salary": "₹ 3.6 - 9.5 LPA",
        "skills": ["Python", "Java", "SQL", "DBMS", "Data Structures", "Communication"],
        "description": "Infosys campus recruitment through InfyTQ certification and HackWithInfy coding challenge.",
        "url": "https://career.infosys.com/",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Project Engineer - Fresher Trainee",
        "company": "Wipro",
        "location": "Pan India",
        "type": "Full-time",
        "salary": "₹ 3.5 - 6.5 LPA",
        "skills": ["Java", "Python", "SQL", "Operating Systems", "Computer Networks", "Communication"],
        "description": "Wipro Elite National Talent Hunt for engineering graduates; aptitude, coding and communication rounds.",
        "url": "https://careers.wipro.com/careers-home/",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Associate Software Engineer",
        "company": "Accenture India",
        "location": "Bengaluru, Mumbai, Gurugram",
        "type": "Full-time",
        "salary": "₹ 4.6 - 7.6 LPA",
        "skills": ["JavaScript", "Python", "SQL", "OOP", "Problem Solving", "Communication"],
        "description": "Accenture campus hiring for Associate Software Engineer and Advanced ASE roles.",
        "url": "https://www.accenture.com/in-en/careers/jobsearch",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Programmer Analyst Trainee",
        "company": "Cognizant",
        "location": "Chennai, Coimbatore, Hyderabad",
        "type": "Full-time",
        "salary": "₹ 4.0 - 6.75 LPA",
        "skills": ["Java", "SQL", "DBMS", "HTML", "CSS", "JavaScript"],
        "description": "Cognizant GenC and GenC Elevate hiring for 2026 batch graduates.",
        "url": "https://careers.cognizant.com/global/en",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Software Analyst - Campus",
        "company": "Capgemini",
        "location": "Mumbai, Pune, Bengaluru",
        "type": "Full-time",
        "salary": "₹ 4.25 - 7.5 LPA",
        "skills": ["Java", "Python", "SQL", "Spring Boot", "Agile", "Communication"],
        "description": "Capgemini India campus programme: aptitude test, technical interview and HR round.",
        "url": "https://www.capgemini.com/in-en/careers/join-capgemini/job-search/",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Graduate Engineer Trainee",
        "company": "HCLTech",
        "location": "Noida, Chennai, Bengaluru",
        "type": "Full-time",
        "salary": "₹ 3.5 - 6.0 LPA",
        "skills": ["C++", "Java", "Python", "SQL", "Operating Systems", "Problem Solving"],
        "description": "HCLTech campus drive for GET roles across application development and infrastructure services.",
        "url": "https://www.hcltech.com/careers",
        "posted": "Rolling campus intake",
    },
    {
        "title": "Software Engineer - Intern",
        "company": "Zoho",
        "location": "Chennai, Tenkasi",
        "type": "Internship",
        "salary": "₹ 25,000 - 40,000 /month",
        "skills": ["Java", "C++", "JavaScript", "SQL", "Data Structures", "Algorithms"],
        "description": "Zoho's six-month paid internship with a full-time conversion for strong performers.",
        "url": "https://careers.zohocorp.com/jobs",
        "posted": "Rolling intake",
    },
    {
        "title": "Product Engineer - Fresher",
        "company": "Freshworks",
        "location": "Chennai, Bengaluru",
        "type": "Full-time",
        "salary": "₹ 8 - 14 LPA",
        "skills": ["JavaScript", "React", "Node.js", "SQL", "REST API", "Problem Solving"],
        "description": "Freshworks hires final-year students into product engineering pods working on SaaS at scale.",
        "url": "https://careers.freshworks.com/",
        "posted": "Rolling intake",
    },
    {
        "title": "Frontend Engineering Intern",
        "company": "Razorpay",
        "location": "Bengaluru (Hybrid)",
        "type": "Internship",
        "salary": "₹ 40,000 - 60,000 /month",
        "skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind CSS"],
        "description": "Work with the Razorpay dashboard team on real fintech UI used by lakhs of merchants.",
        "url": "https://razorpay.com/jobs/",
        "posted": "Rolling intake",
    },
    {
        "title": "Software Development Engineer Intern",
        "company": "Amazon India",
        "location": "Bengaluru, Hyderabad",
        "type": "Internship",
        "salary": "₹ 80,000 - 1,10,000 /month",
        "skills": ["Data Structures", "Algorithms", "Java", "Python", "System Design", "Problem Solving"],
        "description": "Amazon SDE internship with an opportunity for a full-time return offer.",
        "url": "https://www.amazon.jobs/en/search?base_query=software+development+engineer+intern",
        "posted": "Rolling intake",
    },
    {
        "title": "Software Engineer - Early Career",
        "company": "Microsoft India",
        "location": "Hyderabad, Bengaluru, Noida",
        "type": "Full-time",
        "salary": "₹ 20 - 45 LPA",
        "skills": ["Data Structures", "Algorithms", "C++", "C#", "System Design", "Problem Solving"],
        "description": "Microsoft India early-career roles for graduating engineers; strong CS fundamentals required.",
        "url": "https://jobs.careers.microsoft.com/global/en/search",
        "posted": "Rolling intake",
    },
    {
        "title": "STEP Intern - Software Engineering",
        "company": "Google India",
        "location": "Bengaluru, Hyderabad",
        "type": "Internship",
        "salary": "₹ 1,00,000+ /month",
        "skills": ["Data Structures", "Algorithms", "C++", "Java", "Python", "System Design"],
        "description": "Google STEP internship for second and third-year students, with mentorship on real products.",
        "url": "https://www.google.com/about/careers/applications/jobs/results/",
        "posted": "Rolling intake",
    },
    {
        "title": "Data Analyst - Fresher",
        "company": "PhonePe",
        "location": "Pune, Bengaluru",
        "type": "Full-time",
        "salary": "₹ 8 - 12 LPA",
        "skills": ["SQL", "Python", "Excel", "Data Analysis", "Power BI", "Statistics"],
        "description": "PhonePe analytics team hiring fresh graduates for payments and lending data products.",
        "url": "https://www.phonepe.com/careers/",
        "posted": "Rolling intake",
    },
    {
        "title": "Business Analyst Intern",
        "company": "Swiggy",
        "location": "Bengaluru",
        "type": "Internship",
        "salary": "₹ 35,000 - 50,000 /month",
        "skills": ["SQL", "Excel", "Data Analysis", "Communication", "Problem Solving"],
        "description": "Work with Swiggy's supply and growth analytics teams on live marketplace problems.",
        "url": "https://careers.swiggy.com/",
        "posted": "Rolling intake",
    },
    {
        "title": "Data Science Intern",
        "company": "Flipkart",
        "location": "Bengaluru",
        "type": "Internship",
        "salary": "₹ 60,000 - 80,000 /month",
        "skills": ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Statistics"],
        "description": "Flipkart data science internship on pricing, recommendation and supply chain models.",
        "url": "https://www.flipkartcareers.com/",
        "posted": "Rolling intake",
    },
    {
        "title": "Machine Learning Intern",
        "company": "Meesho",
        "location": "Bengaluru (Remote friendly)",
        "type": "Internship",
        "salary": "₹ 50,000 - 70,000 /month",
        "skills": ["Python", "Machine Learning", "TensorFlow", "PyTorch", "NLP", "Pandas"],
        "description": "Meesho ML team works on ranking, recommendations and fraud detection at scale.",
        "url": "https://meesho.io/jobs",
        "posted": "Rolling intake",
    },
    {
        "title": "Backend Developer - Graduate Programme",
        "company": "CRED",
        "location": "Bengaluru",
        "type": "Full-time",
        "salary": "₹ 18 - 30 LPA",
        "skills": ["Java", "Python", "Node.js", "PostgreSQL", "Redis", "System Design", "Microservices"],
        "description": "CRED engineering graduate programme for backend and platform teams.",
        "url": "https://careers.cred.club/",
        "posted": "Rolling intake",
    },
    {
        "title": "API Platform Intern",
        "company": "Postman",
        "location": "Bengaluru (Hybrid)",
        "type": "Internship",
        "salary": "₹ 50,000 - 80,000 /month",
        "skills": ["JavaScript", "Node.js", "REST API", "GraphQL", "Unit Testing", "Git"],
        "description": "Postman internship on the API platform tooling and developer experience team.",
        "url": "https://www.postman.com/company/careers/",
        "posted": "Rolling intake",
    },
    {
        "title": "QA Automation Trainee",
        "company": "BrowserStack",
        "location": "Mumbai",
        "type": "Full-time",
        "salary": "₹ 8 - 14 LPA",
        "skills": ["Selenium", "Java", "Python", "Unit Testing", "Postman", "Problem Solving"],
        "description": "BrowserStack QA engineering trainee role focused on cross-browser test automation.",
        "url": "https://www.browserstack.com/careers",
        "posted": "Rolling intake",
    },
    {
        "title": "Cloud & DevOps Trainee",
        "company": "IBM India",
        "location": "Bengaluru, Kochi",
        "type": "Full-time",
        "salary": "₹ 5 - 9 LPA",
        "skills": ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Python", "Shell Scripting"],
        "description": "IBM India graduate hiring for cloud engineering and DevOps support roles.",
        "url": "https://www.ibm.com/careers/search",
        "posted": "Rolling intake",
    },
    {
        "title": "Cyber Security Analyst - Graduate",
        "company": "Deloitte India",
        "location": "Hyderabad, Gurugram",
        "type": "Full-time",
        "salary": "₹ 7 - 11 LPA",
        "skills": ["Cybersecurity", "Linux", "Computer Networks", "Python", "Communication"],
        "description": "Deloitte cyber risk advisory graduate analyst openings across India.",
        "url": "https://www2.deloitte.com/in/en/careers.html",
        "posted": "Rolling intake",
    },
]


def _campus_board() -> List[Dict[str, Any]]:
    return [
        _job(
            title=row["title"],
            company=row["company"],
            location=row["location"],
            type=row["type"],
            salary=row["salary"],
            skills=row["skills"],
            description=row["description"],
            url=row["url"],
            source=CAMPUS_BOARD,
            posted=row["posted"],
            remote="remote" in row["location"].lower(),
        )
        for row in CURATED_JOBS
    ]


# --------------------------------------------------------------- ranking
def _score(job: Dict[str, Any], skills: List[str], query: str, location: str) -> int:
    haystack = " ".join(
        [
            job.get("title", ""),
            job.get("company", ""),
            " ".join(job.get("skills") or []),
            job.get("description", ""),
        ]
    ).lower()

    matched = [skill for skill in skills if skill.lower() in haystack] if skills else []
    base = 38
    if skills:
        base += round(45 * len(matched) / len(skills))
    if query and query.lower() in job.get("title", "").lower():
        base += 14
    if any(
        word in haystack
        for word in ("intern", "fresher", "graduate", "entry level", "trainee", "junior")
    ):
        base += 4
    if location and location.lower() in (job.get("location") or "").lower():
        base += 6

    job["matched_skills"] = matched
    return max(5, min(99, base))


def _dedupe(jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    unique = []
    for job in jobs:
        key = (job.get("title", "").strip().lower(), job.get("company", "").strip().lower())
        if key in seen or not job.get("url"):
            continue
        seen.add(key)
        unique.append(job)
    return unique


# ------------------------------------------------------------- public API
def search_jobs(
    query: str = "",
    location: str = "",
    remote_only: bool = False,
    skills: Optional[List[str]] = None,
    limit: int = 30,
) -> Dict[str, Any]:
    """Scrape every source in parallel, score the results and return the best ones."""
    skills = skills or []
    limit = max(1, min(int(limit or 30), 60))
    query = (query or "").strip()[:80]
    location = (location or "").strip()[:60]
    cache_key = f"{query.lower()}|{location.lower()}|{remote_only}|{','.join(sorted(skills))}|{limit}"

    with _CACHE_LOCK:
        cached = _CACHE.get(cache_key)
        if cached and time.time() - cached[0] < CACHE_TTL:
            return copy.deepcopy(cached[1])

    fetchers = [
        ("Internshala", _internshala, query),
        ("Remotive", _remotive, query),
        ("Arbeitnow", _arbeitnow, query),
        ("Jobicy", _jobicy, query),
        ("Himalayas", _himalayas, query),
        ("RemoteOK", _remoteok, query),
    ]

    collected: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=len(fetchers)) as pool:
        futures = {pool.submit(func, query): name for name, func, _ in fetchers}
        for future in as_completed(futures):
            name = futures[future]
            try:
                rows = future.result() or []
                collected.extend(rows)
                sources.append({"source": name, "status": "ok", "count": len(rows), "error": None})
            except Exception as exc:  # noqa: BLE001 - one board must not break the page
                sources.append(
                    {"source": name, "status": "failed", "count": 0, "error": str(exc)[:160]}
                )

    campus = _campus_board()
    collected.extend(campus)
    sources.append({"source": CAMPUS_BOARD, "status": "ok", "count": len(campus), "error": None})

    if remote_only:
        collected = [job for job in collected if job.get("remote")]

    ranked = []
    for job in _dedupe(collected):
        job["match"] = _score(job, skills, query, location)
        ranked.append(job)
    ranked.sort(key=lambda item: (item["match"], item.get("posted", "")), reverse=True)

    live_count = sum(
        1 for job in ranked if job.get("source") not in (CAMPUS_BOARD,)
    )
    payload = {
        "jobs": ranked[:limit],
        "sources": sources,
        "live": live_count > 0,
        "live_count": live_count,
        "total_found": len(ranked),
        "fetched_at": datetime.now().isoformat(timespec="seconds"),
        "query": query,
        "location": location,
        "skills_used": skills,
    }

    with _CACHE_LOCK:
        if len(_CACHE) > MAX_CACHE_ENTRIES:
            oldest = sorted(_CACHE, key=lambda key: _CACHE[key][0])[:10]
            for key in oldest:
                _CACHE.pop(key, None)
        _CACHE[cache_key] = (time.time(), copy.deepcopy(payload))
    return payload
