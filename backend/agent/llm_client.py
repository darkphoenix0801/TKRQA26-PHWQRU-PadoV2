import os
import json
import requests
from backend.agent.prompts import RESUME_EXTRACTION_PROMPT, ROADMAP_GENERATION_PROMPT, ATS_ANALYSIS_PROMPT
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI & Groq API Configurations
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

OPENAI_URL = "https://api.openai.com/v1/chat/completions"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def clean_and_parse_json(text: str) -> dict:
    """
    Cleans LLM outputs which often contain markdown wrappers (e.g. ```json ... ```)
    and parses it into a Python dictionary.
    """
    cleaned = text.strip()
    start_idx = cleaned.find('{')
    end_idx = cleaned.rfind('}')
    
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        cleaned = cleaned[start_idx:end_idx + 1]
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[LLM] Failed to parse JSON. Raw Text: {text}")
        raise ValueError(f"LLM did not return a valid JSON structure: {e}")

def get_fallback_mock(prompt: str) -> str:
    """Returns high quality static mock values if API calls fail or keys are missing."""
    if "EXTRACT_RESUME" in prompt or "extract" in prompt.lower():
        return json.dumps({
            "name": "Mock User",
            "education": ["B.Tech Mock University"],
            "cgpa": 8.5,
            "degree": "B.Tech",
            "skills": ["Python", "JavaScript", "React", "Node.js", "SQL", "FastAPI", "XGBoost", "Machine Learning"],
            "programming_languages": ["Python", "JavaScript"],
            "frameworks": ["React", "FastAPI"],
            "tools": ["Git"],
            "databases": ["SQL"],
            "certifications": [],
            "internships": [],
            "projects": ["Placement Assessment System", "Resume Parser NLP"],
            "achievements": [],
            "soft_skills": [],
            "leadership": [],
            "experience": ["Software Engineer Intern"]
        })
    elif "ROADMAP_GEN" in prompt or "roadmap" in prompt.lower():
        return json.dumps({
            "DSA": ["Array Hashing & Strings", "Two Pointers", "Trees & Recursion", "Binary Search"],
            "Aptitude": ["Quantitative Math Problems", "Logical Sequence Problems"],
            "Core Subjects": ["DBMS SQL Joins", "OS Threading & Context Switch"],
            "Communication": ["Behavioral Star Method Interview Questions"]
        })
    elif "ATS_ANALYSIS" in prompt or "evaluate this detailed resume" in prompt.lower():
         return json.dumps({
              "overall_score": 85,
              "section_scores": {
                "Formatting": {"score": 9, "max": 10, "explanation": "Good format", "improvement": "None"},
                "Keyword Optimization": {"score": 8, "max": 10, "explanation": "Good", "improvement": "Add more keywords"},
                "Project Quality": {"score": 18, "max": 20, "explanation": "Strong projects", "improvement": "None"},
                "Technical Skills": {"score": 18, "max": 20, "explanation": "Great skills", "improvement": "None"},
                "Experience": {"score": 12, "max": 15, "explanation": "Good internship", "improvement": "None"},
                "Achievements": {"score": 8, "max": 10, "explanation": "Okay", "improvement": "Add more"},
                "Education": {"score": 12, "max": 15, "explanation": "Good GPA", "improvement": "None"}
              },
              "strengths": ["Strong Python skills"],
              "weaknesses": ["No leadership experience"],
              "recommendations": ["Build a full-stack project"],
              "company_readiness_score": 75,
              "alternative_companies": [{"company": "TCS", "match_percentage": 90, "reason": "Good match"}],
              "skill_gap": {
                  "strong_skills": ["Python", "React"],
                  "weak_skills": ["System Design"],
                  "missing_skills": ["AWS"],
                  "priority_skills": ["System Design"],
                  "expected_learning_time": "2 weeks"
              },
              "resume_level": "Placement Ready",
              "motivational_feedback": "Your resume has a strong foundation..."
         })
    elif "ONE interview question" in prompt or "QUESTION_GENERATION" in prompt:
        return "Can you explain the differences between React and Angular?"
    elif "FINAL_RECOMMENDATION" in prompt or "short readiness summary" in prompt:
        return "1. Review Graph Algorithms.\n2. Needs Improvement.\n3. Do 5 LeetCode Mediums."
    return json.dumps({"status": "mock", "message": "Fallback invoked due to API failure"})

def call_local_llm(prompt: str, json_mode: bool = True) -> str:
    """Sends a chat request to Groq (preferred) or OpenAI using environment API keys."""
    if not GROQ_API_KEY and not OPENAI_API_KEY:
        return get_fallback_mock(prompt)
    groq_failed_or_invalid = False
    
    # Use Groq if key is present
    if GROQ_API_KEY:
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }
        try:
            response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Verify if it's parseable JSON before returning. If not, fallback to OpenAI.
            if json_mode:
                try:
                    clean_and_parse_json(content)
                    return content
                except ValueError:
                    print("[LLM] Groq returned invalid JSON, falling back to OpenAI...")
                    groq_failed_or_invalid = True
            else:
                return content
        except Exception as e:
            print(f"[LLM] Groq request failed, attempting OpenAI fallback if possible: {e}")
            groq_failed_or_invalid = True
            if not OPENAI_API_KEY:
                raise e

    # Fallback to OpenAI
    if OPENAI_API_KEY:
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        try:
            response = requests.post(OPENAI_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[LLM] OpenAI request failed (e.g., 429 Too Many Requests): {e}. Falling back to mock data.")

    # Ultimate fallback if both APIs fail or limit out
    print("[LLM] Returning static mock fallback because all API requests failed.")
    return get_fallback_mock(prompt)

def get_judge_fallback_mock() -> str:
    """Returns static mock values for judge if API calls fail or keys are missing."""
    return json.dumps({
        "content_score": 80.0,
        "weakness_tag": "None",
        "brief_feedback": "Good answer. (Fallback mode active due to API failure/limits)."
    })

def call_local_llm_as_judge(prompt: str) -> str:
    """
    Sends a scoring/judging request to Groq (preferred) or OpenAI with a strict system prompt.
    """
    if not GROQ_API_KEY and not OPENAI_API_KEY:
        # Fallback mocks for interview scoring when keys are missing
        return get_judge_fallback_mock()

    system_message = (
        "You are a STRICT technical interviewer at a top tech company. "
        "Your ONLY job is to honestly evaluate the candidate's answer to the question asked. "
        "Your output MUST be ONLY a valid JSON object. "
        "Do NOT include any explanations, apologies, or conversational text outside the JSON."
    )

    if GROQ_API_KEY:
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"}
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }
        try:
            response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[LLM] Groq judge failed, attempting OpenAI: {e}")
            if not OPENAI_API_KEY:
                raise e

    if OPENAI_API_KEY:
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0,
            "response_format": {"type": "json_object"}
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        try:
            response = requests.post(OPENAI_URL, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"[LLM] OpenAI judge request failed: {e}. Falling back to mock data.")

    print("[LLM] Returning static mock fallback for judge because all API requests failed.")
    return get_judge_fallback_mock()

def extract_skills_from_resume(resume_text: str) -> dict:
    """Sends resume text to local Llama model to extract highly structured skills, projects, and details."""
    prompt = RESUME_EXTRACTION_PROMPT.format(resume_text=resume_text)
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

def analyze_ats(detailed_resume_json: str, target_company: str, target_role: str = "Software Engineer") -> dict:
    """Sends structured resume to local Llama model for ATS scoring and skill gap analysis."""
    prompt = ATS_ANALYSIS_PROMPT.format(detailed_resume_json=detailed_resume_json, target_company=target_company, target_role=target_role)
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

def generate_roadmap_from_skills(detailed_resume_json: str, ats_analysis_json: str, target_company: str, target_role: str = "Software Engineer") -> dict:
    """Sends extracted skills and ATS analysis to local Llama model to generate a tailored preparation roadmap."""
    prompt = ROADMAP_GENERATION_PROMPT.format(
        detailed_resume_json=detailed_resume_json,
        ats_analysis_json=ats_analysis_json,
        target_company=target_company,
        target_role=target_role
    )
    response_text = call_local_llm(prompt)
    return clean_and_parse_json(response_text)

if __name__ == "__main__":
    # Test script to run locally
    test_resume = "FastAPI developer with 2 years experience. CGPA: 8.8. Worked on SQL and machine learning projects."
    try:
        print("[Test] Testing Local Resume Extraction...")
        res = extract_skills_from_resume(test_resume)
        print(json.dumps(res, indent=2))
        
        print("\n[Test] Testing Local Roadmap Generation...")
        roadmap = generate_roadmap_from_skills(json.dumps(res), "Google")
        print(json.dumps(roadmap, indent=2))
    except Exception as e:
        print(f"Test failed: {e}")
