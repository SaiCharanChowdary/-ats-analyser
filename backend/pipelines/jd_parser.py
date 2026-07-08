import re

def extract_requirements(text: str) -> dict:
    must_have_keywords = [
        "required", "must have", "you must", "essential",
        "mandatory", "minimum", "you will need"
    ]
    nice_to_have_keywords = [
        "preferred", "nice to have", "bonus", "desirable",
        "plus", "advantage", "ideally"
    ]

    lines = text.split("\n")
    must_have = []
    nice_to_have = []
    general = []
    for line in lines:
        line_lower = line.lower().strip()
        if not line_lower:
            continue
        if any(kw in line_lower for kw in must_have_keywords):
            must_have.append(line.strip())
        elif any(kw in line_lower for kw in nice_to_have_keywords):
            nice_to_have.append(line.strip())
        else:
            general.append(line.strip())

    return {
        "must_have": must_have,
        "nice_to_have": nice_to_have,
        "general": general
    }

def extract_jd_skills(text: str) -> list:
    common_skills = [
        "python", "javascript", "react", "node.js", "sql", "java",
        "typescript", "html", "css", "git", "docker", "aws", "azure",
        "machine learning", "data analysis", "fastapi", "django", "flask",
        "mongodb", "postgresql", "rest api", "agile", "scrum",
        "communication", "leadership", "problem solving", "teamwork"
    ]
    found = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill in text_lower:
            found.append(skill)
    return found
def extract_experience_years(text: str) -> str:
    pattern = r'(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)'
    match = re.search(pattern, text.lower())
    return match.group(0) if match else "not specified"

def parse_jd(jd_text: str) -> dict:
    requirements = extract_requirements(jd_text)
    skills = extract_jd_skills(jd_text)
    experience = extract_experience_years(jd_text)

    title_match = re.search(
        r'^(.+?)(?:\n|$)', jd_text.strip()
    )
    title = title_match.group(1).strip() if title_match else "Unknown"

    return {
        "job_title": title,
        "required_skills": skills,
        "experience_required": experience,
        "requirements": requirements,
        "raw_text": jd_text,
        "word_count": len(jd_text.split())
    }