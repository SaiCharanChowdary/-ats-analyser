import os
import json
import hashlib
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

CHECKLIST_CACHE_DIR = "checklist_cache"
os.makedirs(CHECKLIST_CACHE_DIR, exist_ok=True)


EXTRACTION_PROMPT = """You are a recruiter analysing a job description to build a skills checklist.

Read the JOB DESCRIPTION below and extract a checklist of the specific skills, tools,
certifications, technologies, and competencies a candidate needs for THIS role.

This could be a software engineering role, a nursing role, a marketing role, a finance
role, a teaching role, or anything else — extract whatever this specific JD actually asks
for. Do not assume it is a tech role.

Respond with ONLY valid JSON, no preamble, no markdown, no backticks:

{
  "checklist": ["skill 1", "skill 2", "skill 3", ...]
}

Rules:
- Include both required and preferred skills/qualifications mentioned in the JD.
- Use the exact terminology the JD uses (e.g. if it says "EHR systems", write "EHR systems", not "electronic health records software").
- Extract between 10 and 25 items — enough to be thorough, not so many that minor phrases get treated as separate skills.
- Do not include generic traits like "hardworking" or "team player" unless the JD frames them as a specific named competency.
- Do not invent skills the JD doesn't mention.
"""


ANALYSIS_PROMPT_TEMPLATE = """You are an expert ATS (Applicant Tracking System) analyst and senior technical recruiter.

You will be given a RESUME, a JOB DESCRIPTION, and a FIXED CHECKLIST already extracted from this job description.

Respond with ONLY valid JSON. No preamble, no markdown formatting, no backticks. Just the raw JSON object.

Use this exact structure:

{{
  "ats_score": ,
  "score_breakdown": {{
    "skill_match": ,
    "experience_relevance": ,
    "formatting_clarity": ,
    "keyword_density": 
  }},
  "job_title_detected": "",
  "candidate_name": "",
  "skill_checklist_results": [
    {{
      "skill": "",
      "status": "matched or missing",
      "evidence": "<exact short quote from resume if matched, max 15 words. Empty string if missing.>"
    }}
  ],
  "repetition_flags": [
    {{
      "evidence_quote": "<the resume quote that was reused>",
      "first_skill_assigned": "<the checklist item that legitimately keeps this evidence>",
      "skills_moved_to_missing": ["<checklist items that lost this evidence and were moved to missing>"],
      "note": "<one sentence explaining the resume only provides one piece of evidence for what looks like several checklist items>"
    }}
  ],
  "extra_skills": [""],
  "strengths": ["<3-5 specific strengths of this resume for this role>"],
  "weaknesses": ["<3-5 specific gaps or weaknesses for this role>"],
  "rewrite_suggestions": [
    {{
      "original": "",
      "improved": "",
      "reason": "",
      "priority": ""
    }}
  ],
  "summary": "<2-3 sentence overall verdict on fit for this role>"
}}

CHECKLIST RULE — this is the most important rule:
- skill_checklist_results MUST contain EXACTLY these {skill_count} items, in this exact order, no more, no fewer:
{checklist_items}
- Do not skip any, do not merge two checklist items into one entry, do not add items that aren't on this list (those go in extra_skills instead if found in the resume).

Evidence rule:
- status is "matched" ONLY IF you can quote an exact short phrase from the resume (max 15 words) that directly states or directly demonstrates that item being present.
- If you cannot find such a quote, status is "missing" — even if it feels likely the candidate has it. No quote means no match.
- Never use words like "implied", "likely", or "via general experience" in an evidence field.

NO-DOUBLE-COUNTING RULE — read this carefully, it is new and important:
- Each distinct piece of evidence (a specific quote) may justify a "matched" status for ONLY ONE checklist item — the item it most directly and specifically supports.
- Before finalizing your answers, review all your "matched" entries. If you used the same quote, or a quote describing the same single event/sentence, to justify two or more checklist items, you must:
  1. Decide which ONE checklist item is the strongest, most specific fit for that evidence and keep it as "matched" there.
  2. Change the status of all OTHER checklist items that relied on that same evidence to "missing", with empty evidence.
  3. Add one entry to repetition_flags documenting this: which quote was reused, which skill kept it, which skills got moved to missing, and a short note explaining why one sentence cannot prove multiple separate competencies on its own.
- A single vague sentence describing one general action (e.g. "linked the frontend to the backend") is normally only strong enough evidence for ONE specific checklist item, not several. Specific, separate sentences are required to justify separate matches.
- If there are no instances of double-counting, return an empty array for repetition_flags.

Scoring rules — ats_score must be the weighted average of score_breakdown:
- skill_match (0-100, weight 40%): (number of "matched" entries / {skill_count}) * 100, rounded. Calculate this AFTER applying the no-double-counting rule above.
- experience_relevance (0-100, weight 30%): how closely the candidate's actual experience matches the seniority and domain of this specific role.
- formatting_clarity (0-100, weight 15%): whether the resume is well-structured, uses clear section headers, and avoids vague or passive bullet points.
- keyword_density (0-100, weight 15%): same calculation as skill_match — (matched count / {skill_count}) * 100, rounded, after the no-double-counting rule is applied.
- Calculate ats_score as: round(skill_match*0.4 + experience_relevance*0.3 + formatting_clarity*0.15 + keyword_density*0.15)

Rewrite suggestion rules:
- Select up to 5 of the weakest, vaguest, or most passive bullet points from the ENTIRE resume.
- Prioritise bullets that appear in repetition_flags — these are proven to be doing too much work and are the highest-value rewrites.
- Set "priority" to "high", "medium", or "low".
- Order rewrite_suggestions from highest to lowest priority.
- Each "improved" version must naturally incorporate at least one missing checklist item where truthful and relevant.

General rules:
- Be honest and specific. Do not inflate scores to be encouraging.
- All score values must be integers between 0 and 100.
- Go through the checklist top to bottom, one item at a time. Then do a second pass specifically checking for double-counted evidence before writing the final response.
"""


def _jd_cache_key(jd_text: str) -> str:
    return hashlib.sha256(jd_text.strip().encode("utf-8")).hexdigest()[:16]


def extract_checklist_from_jd(jd_text: str) -> list:
    cache_key = _jd_cache_key(jd_text)
    cache_path = f"{CHECKLIST_CACHE_DIR}/{cache_key}.json"

    if os.path.exists(cache_path):
        with open(cache_path, "r") as f:
            return json.load(f)["checklist"]

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        temperature=0,
        system=EXTRACTION_PROMPT,
        messages=[{"role": "user", "content": f"JOB DESCRIPTION:\n{jd_text}"}]
    )

    raw_output = message.content[0].text.strip()
    if raw_output.startswith("```"):
        raw_output = raw_output.strip("`")
        if raw_output.startswith("json"):
            raw_output = raw_output[4:]

    parsed = json.loads(raw_output)
    checklist = parsed["checklist"]

    with open(cache_path, "w") as f:
        json.dump({"checklist": checklist, "jd_text": jd_text}, f)

    return checklist


def build_analysis_prompt(checklist: list) -> str:
    checklist_items = "\n".join(f"  {i+1}. {item}" for i, item in enumerate(checklist))
    return ANALYSIS_PROMPT_TEMPLATE.format(
        skill_count=len(checklist),
        checklist_items=checklist_items
    )


def analyse_resume_with_claude(resume_text: str, jd_text: str) -> dict:
    checklist = extract_checklist_from_jd(jd_text)

    system_prompt = build_analysis_prompt(checklist)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3500,
        temperature=0,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{jd_text}\n\nCHECKLIST TO EVALUATE:\n{', '.join(checklist)}"
            }
        ]
    )

    raw_output = message.content[0].text.strip()
    if raw_output.startswith("```"):
        raw_output = raw_output.strip("`")
        if raw_output.startswith("json"):
            raw_output = raw_output[4:]

    try:
        result = json.loads(raw_output)
        result["checklist_used"] = checklist
    except json.JSONDecodeError:
        result = {
            "error": "Could not parse Claude's response as JSON",
            "raw_output": raw_output
        }

    return result