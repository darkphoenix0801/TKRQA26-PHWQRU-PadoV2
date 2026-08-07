import sqlite3
import os
import json

if os.environ.get("RENDER"):
    DB_PATH = "/data/pado.db"
else:
    DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pado.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    return conn

def init_db():
    """Initializes the database schema if it doesn't already exist."""
    print("[DB] Initializing SQLite Database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create Student Profile Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS student_profile (
        student_id       TEXT PRIMARY KEY,
        name             TEXT,
        resume_text      TEXT,
        extracted_skills TEXT,        -- JSON array/string, from LLM extraction
        detailed_resume  TEXT,        -- JSON string of highly structured resume data
        cgpa             REAL,
        target_company   TEXT,
        target_role      TEXT,
        password_hash    TEXT,
        virtual_id       TEXT,
        role             TEXT DEFAULT 'student',
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 5. Create ATS Analysis Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ats_analysis (
        student_id              TEXT PRIMARY KEY,
        overall_score           INTEGER,
        section_scores          TEXT, -- JSON
        strengths               TEXT, -- JSON
        weaknesses              TEXT, -- JSON
        recommendations         TEXT, -- JSON
        company_readiness_score INTEGER,
        alternative_companies   TEXT, -- JSON
        skill_gap               TEXT, -- JSON
        resume_level            TEXT,
        created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student_profile(student_id)
    );
    """)
    
    # Run migrations to add missing columns if they don't exist
    try:
        cursor.execute("ALTER TABLE student_profile ADD COLUMN detailed_resume TEXT;")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE student_profile ADD COLUMN password_hash TEXT;")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE student_profile ADD COLUMN virtual_id TEXT;")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE student_profile ADD COLUMN role TEXT DEFAULT 'student';")
    except sqlite3.OperationalError:
        pass
        
    try:
        cursor.execute("ALTER TABLE student_profile ADD COLUMN target_role TEXT;")
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    conn.close()
    print("[DB] Database tables successfully created/validated!")


# --- HELPER FUNCTIONS FOR INTERACTION ---

def save_student_profile(student_id, name, resume_text, extracted_skills, cgpa, target_company, target_role="Software Engineer", password_hash=None, virtual_id=None, role="student", detailed_resume=None):
    """Saves or updates a student profile."""
    conn = get_db_connection()
    cursor = conn.cursor()
    # Serialize skills list to JSON string if it is a list
    if isinstance(extracted_skills, list):
        extracted_skills = json.dumps(extracted_skills)
    if isinstance(detailed_resume, dict):
        detailed_resume = json.dumps(detailed_resume)
        
    cursor.execute("""
    INSERT OR REPLACE INTO student_profile (student_id, name, resume_text, extracted_skills, detailed_resume, cgpa, target_company, target_role, password_hash, virtual_id, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (student_id, name, resume_text, extracted_skills, detailed_resume, cgpa, target_company, target_role, password_hash, virtual_id, role))
    conn.commit()
    conn.close()

def save_ats_analysis(student_id, ats_data):
    """Saves the ATS analysis results for a student."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    INSERT OR REPLACE INTO ats_analysis 
    (student_id, overall_score, section_scores, strengths, weaknesses, recommendations, company_readiness_score, alternative_companies, skill_gap, resume_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        student_id, 
        ats_data.get('overall_score', 0),
        json.dumps(ats_data.get('section_scores', {})),
        json.dumps(ats_data.get('strengths', [])),
        json.dumps(ats_data.get('weaknesses', [])),
        json.dumps(ats_data.get('recommendations', [])),
        ats_data.get('company_readiness_score', 0),
        json.dumps(ats_data.get('alternative_companies', [])),
        json.dumps(ats_data.get('skill_gap', {})),
        ats_data.get('resume_level', 'Beginner')
    ))
    conn.commit()
    conn.close()

def get_ats_analysis(student_id):
    """Retrieves the ATS analysis for a student."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ats_analysis WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
        
    data = dict(row)
    # Parse JSON fields
    for field in ['section_scores', 'strengths', 'weaknesses', 'recommendations', 'alternative_companies', 'skill_gap']:
        if data.get(field):
            data[field] = json.loads(data[field])
    return data

def get_student_profile(student_id):
    """Retrieves student profile."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_profile WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def clear_roadmap(student_id):
    """Deletes all existing roadmap items for a student before regeneration."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM roadmap WHERE student_id = ?", (student_id,))
    conn.commit()
    conn.close()

def save_roadmap_item(student_id, category, topic):
    """Saves a roadmap topic recommendation."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO roadmap (student_id, category, topic)
    VALUES (?, ?, ?)
    """, (student_id, category, topic))
    conn.commit()
    conn.close()

def get_roadmap(student_id):
    """Retrieves roadmap items for a student."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM roadmap WHERE student_id = ?", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_interview_turn(student_id, session_id, question_number, question_text, question_category, 
                        answer_transcript=None, content_score=None, confidence_score=None, weakness_tag=None):
    """Saves or updates an interview question and answer turn."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO interview_sessions 
    (student_id, session_id, question_number, question_text, question_category, answer_transcript, content_score, confidence_score, weakness_tag)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (student_id, session_id, question_number, question_text, question_category, 
          answer_transcript, content_score, confidence_score, weakness_tag))
    conn.commit()
    conn.close()

def get_past_answers(student_id, session_id):
    """Gets all questions and answers in a specific interview session ordered by question number."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM interview_sessions 
    WHERE student_id = ? AND session_id = ? 
    ORDER BY question_number
    """, (student_id, session_id))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_weekly_progress(student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability):
    """Saves weekly progress and the calculated placement probability."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO weekly_progress (student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (student_id, week_number, dsa_score, aptitude_score, communication_score, placement_probability))
    conn.commit()
    conn.close()

def get_weekly_progress(student_id):
    """Retrieves progress history over time."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM weekly_progress WHERE student_id = ? ORDER BY week_number", (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

if __name__ == "__main__":
    init_db()
