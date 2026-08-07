import sqlite3
import json
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pado.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def seed_demo_user():
    print("[Seed] Seeding demo_user...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    student_id = "demo_user"
    
    # 1. Student Profile
    extracted_skills = ["React", "Next.js", "FastAPI", "Python", "SQL", "Tailwind CSS", "Data Structures"]
    detailed_resume = {
        "name": "Jane Doe",
        "education": ["B.Tech Computer Science, Stanford University"],
        "cgpa": 3.8,
        "degree": "B.Tech",
        "skills": extracted_skills,
        "projects": ["Full Stack E-commerce App", "AI Resume Parser"],
        "experience": ["Software Engineering Intern at Tech Corp"]
    }
    
    cursor.execute("""
    INSERT OR REPLACE INTO student_profile 
    (student_id, name, resume_text, extracted_skills, detailed_resume, cgpa, target_company, target_role, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        student_id, "Jane Doe", "Full stack developer with experience in React and FastAPI...",
        json.dumps(extracted_skills), json.dumps(detailed_resume), 3.8, "Google", "Software Engineer", 
        "demo123", "student"
    ))
    
    # 2. ATS Analysis
    ats_data = {
        "overall_score": 88,
        "section_scores": {
            "Formatting": {"score": 9, "max": 10, "explanation": "Clean format", "improvement": "None"},
            "Keyword Optimization": {"score": 8, "max": 10, "explanation": "Good use of tech stack keywords", "improvement": "Add more quantitative metrics"},
            "Technical Skills": {"score": 18, "max": 20, "explanation": "Strong full-stack skills", "improvement": "Add cloud deployment skills (AWS/GCP)"}
        },
        "strengths": ["Strong project portfolio", "Excellent academic record"],
        "weaknesses": ["Lack of enterprise cloud experience", "No system design experience"],
        "recommendations": ["Learn AWS or Google Cloud basics", "Study fundamental system design concepts"],
        "company_readiness_score": 82,
        "alternative_companies": [
            {"company": "Stripe", "match_percentage": 92, "reason": "High demand for React/FastAPI developers"},
            {"company": "Microsoft", "match_percentage": 85, "reason": "Strong alignment with backend requirements"}
        ],
        "skill_gap": {
            "priority_skills": ["System Design", "AWS Deployments", "Advanced Graph Algorithms"]
        },
        "resume_level": "Product Company Ready",
        "motivational_feedback": "Your profile is looking great! You have a solid foundation for top product companies. Just polish your cloud deployment knowledge and you'll be highly competitive."
    }
    
    cursor.execute("""
    INSERT OR REPLACE INTO ats_analysis 
    (student_id, overall_score, section_scores, strengths, weaknesses, recommendations, company_readiness_score, alternative_companies, skill_gap, resume_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        student_id, 
        ats_data["overall_score"],
        json.dumps(ats_data["section_scores"]),
        json.dumps(ats_data["strengths"]),
        json.dumps(ats_data["weaknesses"]),
        json.dumps(ats_data["recommendations"]),
        ats_data["company_readiness_score"],
        json.dumps(ats_data["alternative_companies"]),
        json.dumps(ats_data["skill_gap"]),
        ats_data["resume_level"]
    ))
    
    # 3. Weekly Progress (Simulating 3 weeks of progression)
    # Clear old progress
    cursor.execute("DELETE FROM weekly_progress WHERE student_id = ?", (student_id,))
    
    progress_history = [
        {"week_number": 1, "dsa": 45, "aptitude": 50, "communication": 60, "placement": 52, "date": datetime.now() - timedelta(days=21)},
        {"week_number": 2, "dsa": 65, "aptitude": 70, "communication": 75, "placement": 68, "date": datetime.now() - timedelta(days=14)},
        {"week_number": 3, "dsa": 85, "aptitude": 80, "communication": 88, "placement": 82, "date": datetime.now() - timedelta(days=7)},
    ]
    
    for p in progress_history:
        cursor.execute("""
        INSERT INTO weekly_progress (student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (student_id, p["week_number"], p["dsa"], p["aptitude"], p["communication"], p["placement"]))
    
    # 4. Roadmap
    cursor.execute("DELETE FROM roadmap WHERE student_id = ?", (student_id,))
    roadmap_items = [
        ("DSA", "System Design Basics: Client-Server Architecture"),
        ("DSA", "Graph Traversal (BFS/DFS)"),
        ("DSA", "Dynamic Programming: Knapsack Variations"),
        ("Core Subjects", "OS: Threading and Context Switching"),
        ("Communication", "Behavioral: Tell me about a time you failed"),
    ]
    for category, topic in roadmap_items:
        cursor.execute("INSERT INTO roadmap (student_id, category, topic) VALUES (?, ?, ?)", (student_id, category, topic))

    conn.commit()
    conn.close()
    print("[Seed] Demo user seeded successfully!")

if __name__ == "__main__":
    seed_demo_user()
