import re

SKILL_ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "nodejs": "node.js",
    "node": "node.js",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "db": "database",
    "postgres": "postgresql",
    "mongo": "mongodb",
    "k8s": "kubernetes",
}

def normalise_skills(skills: list) -> list:
    normalised = []
    for skill in skills:
        clean = skill.lower().strip()
        clean = SKILL_ALIASES.get(clean, clean)
        if clean not in normalised:
            normalised.append(clean)
    return sorted(normalised)

def find_skill_gap(resume_skills: list, jd_skills: list) -> dict:
    resume_set = set(normalise_skills(resume_skills))
    jd_set = set(normalise_skills(jd_skills))
    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)
    extra = list(resume_set - jd_set)

    match_score = (
        round(len(matched) / len(jd_set) * 100, 1)
        if jd_set else 0
    )

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra,
        "skill_match_score": match_score
    }

def normalise_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def run_normaliser(resume_data: dict, jd_data: dict) -> dict:
    resume_skills = normalise_skills(resume_data.get("skills_found", []))
    jd_skills = normalise_skills(jd_data.get("required_skills", []))
    gap_analysis = find_skill_gap(resume_skills, jd_skills)
    return {
        "resume_skills_normalised": resume_skills,
        "jd_skills_normalised": jd_skills,
        "gap_analysis": gap_analysis,
        "resume_summary": normalise_text(
            resume_data.get("sections", {}).get("summary", "")
        ),
        "jd_requirements_summary": normalise_text(
            jd_data.get("raw_text", "")[:500]
        )
    }