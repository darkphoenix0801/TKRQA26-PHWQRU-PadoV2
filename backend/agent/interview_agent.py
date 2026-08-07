import json
from collections import Counter
from backend.db import get_past_answers, save_interview_turn, get_student_profile
from backend.agent.llm_client import call_local_llm, call_local_llm_as_judge, clean_and_parse_json
from backend.agent.prompts import QUESTION_GENERATION_PROMPT, ANSWER_SCORING_PROMPT, FINAL_RECOMMENDATION_PROMPT
from backend.agent.scraper import get_latest_interview_context

CATEGORIES = ['DSA', 'System Design', 'Behavioral', 'Core Subjects']

def pick_next_category(student_id: str, session_id: str, target_company: str) -> str:
    """
    OBSERVE & THINK: Queries database memory for past answers in this session,
    detects weaknesses, and dynamically decides what topic to ask about next.
    """
    past_turns = get_past_answers(student_id, session_id)
    
    # Rule A: If it's the start of the interview, start with DSA
    if not past_turns:
        print("🤖 Session memory is empty. Starting with default category: DSA")
        return 'DSA'
        
    # Rule B: Check for weak areas (where content_score < 60)
    weak_categories = []
    for turn in past_turns:
        # Check if the turn has been scored and is a failure (< 60)
        if turn['content_score'] is not None and turn['content_score'] < 60:
            weak_categories.append(turn['question_category'])
            
    if weak_categories:
        # DRILL DOWN: Pick the category the candidate failed most frequently
        most_common_weak = Counter(weak_categories).most_common(1)[0][0]
        print(f"🕵️ Agent detected weakness in: {most_common_weak}. Pivoting to drill down here.")
        return most_common_weak
        
    # Rule C: Broaden coverage (pick the next category that hasn't been asked yet)
    asked_categories = set(turn['question_category'] for turn in past_turns)
    for cat in CATEGORIES:
        if cat not in asked_categories:
            print(f"🕵️ Candidate is doing well. Expanding coverage to new category: {cat}")
            return cat
            
    # Rule D: If all categories are explored and done well, loop back to the first one
    print("🕵️ All categories explored. Loop back to standard rotation.")
    return CATEGORIES[len(past_turns) % len(CATEGORIES)]

from backend.agent.company_kb import get_company_loop

def generate_interview_question(student_id: str, session_id: str, target_company: str, question_number: int = 1) -> tuple:
    """
    ACT: Generates the actual question text via the local LLM, grounded in 
    the selected company loop, and past questions.
    """
    # 1. Get the target company's interview loop structure
    company_loop = get_company_loop(target_company)
    total_rounds = company_loop["rounds"]
    
    # Map the current question number to the specific round.
    # If the student answers more questions than rounds, we cap it at the last round
    round_idx = min(question_number - 1, total_rounds - 1)
    current_round = company_loop["structure"][round_idx]
    
    round_name = current_round["name"]
    round_type = current_round["type"]
    round_focus = current_round["focus"]
    
    # Get student profile to inject into the prompt
    profile = get_student_profile(student_id)
    skills_json = profile.get("skills_json", "[]") if profile else "[]"
    
    # 2. Get past questions to prevent repetition
    past_turns = get_past_answers(student_id, session_id)
    past_questions_list = [turn['question_text'] for turn in past_turns]
    
    # 3. Fetch Live Web Context for the target company and round
    print(f"[Dataset] Fetching dataset context for {target_company} {round_type} round...")
    from backend.agent.hf_datasets import get_dataset_context
    live_context = get_dataset_context(target_company, round_type)
    
    # Fallback to web scraper if dataset fails or returns empty
    if not live_context or "No dataset data found" in live_context:
        print(f"[Scraper] Falling back to web scraper...")
        live_context = get_latest_interview_context(target_company, round_type)
        
    print(f"[Dataset] Context retrieved ({len(live_context)} chars).")

    # 4. Format the prompt and call the LLM
    prompt = QUESTION_GENERATION_PROMPT.format(
        target_company=target_company,
        round_name=round_name,
        round_type=round_type,
        round_focus=round_focus,
        skills_json=skills_json,
        past_questions_list=json.dumps(past_questions_list),
        live_context=live_context
    )
    
    print(f"[Interview] Generating local LLM question for [{target_company}] Round: {round_name}...")
    question_text = call_local_llm(prompt, json_mode=False).strip()
    
    # We return the round_name + round_type as the "category" for legacy compatibility
    category_label = f"{round_name} ({round_type})"
    
    return question_text, category_label
 
def score_and_store_turn(student_id: str, session_id: str, question_number: int, 
                         question_text: str, category: str, answer_text: str,
                         provided_confidence_score: float = None) -> dict:
    """
    ACT: Scores the candidate's answer using the local LLM, analyzes features,
    and stores the complete observation in the database memory.
    """
    # 1. Score the answer content using local LLM
    prompt = ANSWER_SCORING_PROMPT.format(
        question=question_text,
        category=category,
        transcript=answer_text
    )
    
    print("[Interview] Scoring answer with STRICT judge (temperature=0)...")
    score_data = clean_and_parse_json(call_local_llm_as_judge(prompt))
    
    content_score = float(score_data.get("content_score", 0))
    weakness_tag = score_data.get("weakness_tag")
    brief_feedback = score_data.get("brief_feedback", "")
    
    # Use real audio confidence if provided, else fallback to 85.0 for text-only
    final_confidence = provided_confidence_score if provided_confidence_score is not None else 85.0
    
    # 3. Save the turn to DB memory
    print("[DB] Saving scored turn to database memory...")
    save_interview_turn(
        student_id=student_id,
        session_id=session_id,
        question_number=question_number,
        question_text=question_text,
        question_category=category,
        answer_transcript=answer_text,
        content_score=content_score,
        confidence_score=final_confidence,
        weakness_tag=weakness_tag
    )
    
    return {
        "question_number": question_number,
        "question_text": question_text,
        "category": category,
        "content_score": content_score,
        "confidence_score": final_confidence,
        "weakness_tag": weakness_tag,
        "feedback": brief_feedback
    }
 
def generate_session_summary(student_id: str, session_id: str, model_output_probability: float) -> str:
    """
    Generates a final assessment summary at the end of the interview session.
    """
    past_turns = get_past_answers(student_id, session_id)
    profile = get_student_profile(student_id)
    
    # Compile a text summary of the student's performance for the LLM prompt
    turns_summary = []
    for turn in past_turns:
        turns_summary.append(
            f"Question {turn['question_number']} ({turn['question_category']}): {turn['question_text']}\n"
            f"Score: {turn['content_score']}/100. Weakness tag: {turn['weakness_tag']}\n"
        )
        
    prompt = FINAL_RECOMMENDATION_PROMPT.format(
        all_session_rows_summary="\n".join(turns_summary),
        model_output=model_output_probability,
        target_company=profile.get("target_company", "Target Company")
    )
    
    print("[Interview] Generating final recommendation text...")
    summary_text = call_local_llm(prompt, json_mode=False).strip()
    return summary_text
