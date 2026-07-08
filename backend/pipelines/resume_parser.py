import pdfplumber
import re

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()

def parse_sections(text: str) -> dict:
    sections = {
        "raw_text": text,
        "contact": "",
        "summary": "",
        "experience": "",
        "education": "",
        "skills": "",
        "certifications": ""
    }

    section_keywords = {
        "summary": ["summary", "objective", "profile", "about"],
        "experience": ["experience", "work history", "employment"],
        "education": ["education", "academic", "qualification"],
        "skills": ["skills", "technical skills", "competencies"],
        "certifications": ["certifications", "certificates", "courses"]
    }
    lines = text.split("\n")
    current_section = "contact"

    for line in lines:
        line_lower = line.lower().strip()
        matched = False
        for section, keywords in section_keywords.items():
            if any(kw in line_lower for kw in keywords):
                current_section = section
                matched = True
                break
        if not matched:
            sections[current_section] += line + "\n"

    return sections

def extract_skills(text: str) -> list:
    common_skills = [
        "python", "javascript", "react", "node.js", "sql", "java",
        "typescript", "html", "css", "git", "docker", "aws", "azure",
        "machine learning", "data analysis", "fastapi", "django", "flask",
        "mongodb", "postgresql", "rest api", "agile", "scrum"
    ]
    found = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill in text_lower:
            found.append(skill)
    return found
def parse_resume(file_path: str) -> dict:
    text = extract_text_from_pdf(file_path)
    sections = parse_sections(text)
    skills = extract_skills(text)

    return {
        "raw_text": text,
        "sections": sections,
        "skills_found": skills,
        "word_count": len(text.split())
    }