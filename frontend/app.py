import streamlit as st
import requests
import json
import uuid
import time
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader

# FastAPI Backend URLs
BACKEND_URL = "http://localhost:8000"

st.set_page_config(
    page_title="PADO | Placement Agent & Optimizer",
    page_icon="🎓",
    layout="wide"
)

# Custom Styling for Premium Aesthetics
st.markdown("""
<style>
    /* Google Font Import */
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
    
    /* Main Content Styling */
    html, body, [class*="css"] {
        font-family: 'Outfit', sans-serif;
    }
    
    /* Elegant Title and Header styling */
    .main-title {
        font-size: 3rem !important;
        font-weight: 700;
        background: linear-gradient(135deg, #FF6B6B 0%, #4D96FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        font-size: 1.2rem;
        color: #A0AEC0;
        margin-bottom: 2rem;
    }
    
    /* Premium Cards for Roadmaps and Results */
    .card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        backdrop-filter: blur(10px);
    }
    
    .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #4D96FF;
        margin-bottom: 0.8rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 0.4rem;
    }
</style>
""", unsafe_allow_html=True)

# Helper Functions to extract text from files
def extract_text_from_pdf(file) -> str:
    """Extracts text from an uploaded PDF file."""
    try:
        reader = PdfReader(file)
        text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        return f"Error parsing PDF: {e}"

def extract_text_from_docx(file) -> str:
    """Extracts text from an uploaded DOCX file using Python's built-in zipfile parser."""
    try:
        with zipfile.ZipFile(file) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Find all XML text tags in the Word document structure
            text_nodes = root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
            text = [node.text for node in text_nodes if node.text]
            return " ".join(text)
    except Exception as e:
        return f"Error parsing DOCX: {e}"

# App Header
st.markdown('<h1 class="main-title">PADO</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Placement Assessment & Development Orchestrator — Powered by Local Llama 3.1 & XGBoost</p>', unsafe_allow_html=True)

# Tab Layout
tab1, tab2, tab3, tab4 = st.tabs(["👤 Profile & Roadmap", "🎙️ Mock Interview Room", "📈 Analytics & Progress", "🗣️ Audio Training"])

# --- TAB 1: PROFILE & ROADMAP ---
with tab1:
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.subheader("Student Registration")
        
        student_id = st.text_input("Student ID", value="charan_local", placeholder="e.g. charan_01")
        name = st.text_input("Full Name", value="Charan Teja", placeholder="e.g. Charan Teja")
        cgpa = st.number_input("CGPA", min_value=0.0, max_value=10.0, value=8.5, step=0.1)
        target_company = st.selectbox("Target Company", ["Google", "Amazon", "Meta", "Microsoft", "Netflix"])
        
        # 📂 File Uploader Integration
        st.write("---")
        st.markdown("**Submit Resume**")
        uploaded_file = st.file_uploader("Upload Resume File (.pdf, .docx, .txt)", type=["pdf", "docx", "txt"])
        
        extracted_text = ""
        if uploaded_file is not None:
            file_details = {"FileName": uploaded_file.name, "FileType": uploaded_file.type}
            
            # Process based on file extension
            if uploaded_file.name.endswith(".pdf"):
                with st.spinner("Extracting PDF text..."):
                    extracted_text = extract_text_from_pdf(uploaded_file)
            elif uploaded_file.name.endswith(".docx"):
                with st.spinner("Extracting DOCX text..."):
                    extracted_text = extract_text_from_docx(uploaded_file)
            else:  # For standard txt files
                extracted_text = uploaded_file.read().decode("utf-8")
                
            if extracted_text and not extracted_text.startswith("Error"):
                st.success(f"✅ Successfully parsed {uploaded_file.name}!")
                # Show a small preview of the text
                with st.expander("Preview parsed resume text"):
                    st.text(extracted_text[:300] + "...")
            else:
                st.error(f"Failed to read file: {extracted_text}")
                
        # Optional manual text fallback if no file is uploaded
        if not extracted_text:
            resume_text_area = st.text_area(
                "Manual Resume Text Fallback (or edit parsed text)", 
                value="Skills: Python, Javascript, React, SQL. Completed a machine learning classification project. CGPA: 8.5.",
                height=150
            )
            final_resume_text = resume_text_area
        else:
            # Let the user review/edit the parsed text if they want
            final_resume_text = st.text_area("Edit Extracted Resume Text", value=extracted_text, height=150)
            
        st.write("---")
        if st.button("Register & Generate Study Roadmap", use_container_width=True):
            if not student_id or not name or not final_resume_text:
                st.error("Please fill in all details and upload/paste your resume!")
            else:
                with st.spinner("Analyzing resume and generating study roadmap..."):
                    payload = {
                        "student_id": student_id,
                        "name": name,
                        "resume_text": final_resume_text,
                        "cgpa": cgpa,
                        "target_company": target_company
                    }
                    try:
                        res = requests.post(f"{BACKEND_URL}/student/register", json=payload)
                        if res.status_code == 200:
                            st.success("Roadmap Generated successfully! View it in the right panel.")
                            st.session_state["registered_student"] = student_id
                        else:
                            st.error(f"Error: {res.json().get('detail')}")
                    except Exception as e:
                        st.error(f"Could not connect to backend: {e}")
                        
    with col2:
        st.subheader("Your Personalized Study Roadmap")
        
        active_student = st.session_state.get("registered_student", student_id)
        
        if active_student:
            try:
                res = requests.get(f"{BACKEND_URL}/student/{active_student}/roadmap")
                if res.status_code == 200:
                    data = res.json()
                    st.write(f"Showing roadmap for **{data['name']}** targeting **{data['target_company']}**")
                    
                    roadmap = data["roadmap"]
                    
                    # Columns to display categories side-by-side
                    r_col1, r_col2 = st.columns(2)
                    r_col3, r_col4 = st.columns(2)
                    
                    with r_col1:
                        st.markdown('<div class="card"><div class="card-title">💻 DSA Topics</div>', unsafe_allow_html=True)
                        for topic in roadmap.get("DSA", []):
                            st.write(f"- {topic}")
                        st.markdown('</div>', unsafe_allow_html=True)
                        
                    with r_col2:
                        st.markdown('<div class="card"><div class="card-title">🧮 Aptitude Topics</div>', unsafe_allow_html=True)
                        for topic in roadmap.get("Aptitude", []):
                            st.write(f"- {topic}")
                        st.markdown('</div>', unsafe_allow_html=True)
                        
                    with r_col3:
                        st.markdown('<div class="card"><div class="card-title">⚙️ Core Subjects</div>', unsafe_allow_html=True)
                        for topic in roadmap.get("Core Subjects", []):
                            st.write(f"- {topic}")
                        st.markdown('</div>', unsafe_allow_html=True)
                        
                    with r_col4:
                        st.markdown('<div class="card"><div class="card-title">🗣️ Communication Drills</div>', unsafe_allow_html=True)
                        for topic in roadmap.get("Communication", []):
                            st.write(f"- {topic}")
                        st.markdown('</div>', unsafe_allow_html=True)
                else:
                    st.info("No roadmap stored for this student ID yet. Register on the left panel to generate one!")
            except Exception as e:
                st.write("Could not retrieve roadmap. Make sure backend is running.")
        else:
            st.info("Register a student on the left to see their study roadmap here.")

# --- TAB 2: MOCK INTERVIEW ROOM ---
with tab2:
    st.subheader("🎙️ Mock Interview Portal")
    
    # Initialize Interview States in Session Memory
    if "interview_active" not in st.session_state:
        st.session_state["interview_active"] = False
        st.session_state["current_question_num"] = 1
        st.session_state["current_question"] = ""
        st.session_state["current_category"] = ""
        st.session_state["session_id"] = ""
        st.session_state["feedback_history"] = []
        
    col_i1, col_i2 = st.columns([2, 1])
    
    with col_i1:
        # Start Session Panel
        if not st.session_state["interview_active"]:
            st.write("Start an adaptive interview session. The agent will analyze your responses and pivot to check your weak spots.")
            
            i_student_id = st.text_input("Enter Student ID to Start", value="charan_local", key="interview_stud_id")
            
            if st.button("Start Interview", use_container_width=True):
                # Auto-generate a session UUID
                sess_id = f"sess_{str(uuid.uuid4())[:8]}"
                try:
                    payload = {"student_id": i_student_id, "session_id": sess_id}
                    res = requests.post(f"{BACKEND_URL}/interview/start", json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        st.session_state["interview_active"] = True
                        st.session_state["session_id"] = sess_id
                        st.session_state["interview_student_id"] = i_student_id
                        st.session_state["current_question_num"] = 1
                        st.session_state["total_questions"] = data.get("total_questions", 3)
                        st.session_state["current_question"] = data["question_text"]
                        st.session_state["current_category"] = data["category"]
                        st.session_state["feedback_history"] = []
                        st.rerun()
                    else:
                        st.error(res.json().get("detail", "Error starting session"))
                except Exception as e:
                    st.error(f"Connection Error: {e}")
        
        else:
            # Active Interview HUD
            st.markdown(f"**Session Active:** `{st.session_state['session_id']}` | **Candidate:** `{st.session_state['interview_student_id']}`")
            
            tq = st.session_state.get("total_questions", 3)
            curr = st.session_state["current_question_num"]
            st.progress(curr / float(tq), text=f"Question {curr} of {tq} (Company Specific Loop)")
            
            st.markdown(f'<div class="card"><div class="card-title">Round {curr} ({st.session_state["current_category"]})</div><h4>{st.session_state["current_question"]}</h4></div>', unsafe_allow_html=True)
            
            # If the category implies a coding round, provide a code-friendly editor space
            if "DSA" in st.session_state["current_category"]:
                st.markdown("**(Coding Round: Please write your logic or code below)**")
                answer_text = st.text_area("Your Code / Answer", placeholder="def solve(nums):\\n    ...", height=300)
            else:
                answer_text = st.text_area("Your Response", placeholder="Type your full answer here...", height=150)
            
            if st.button("Submit Answer", use_container_width=True):
                if not answer_text.strip():
                    st.warning("Please type your response before submitting!")
                else:
                    with st.spinner("Grading answer and deciding next routing step..."):
                        payload = {
                            "student_id": st.session_state["interview_student_id"],
                            "session_id": st.session_state["session_id"],
                            "question_number": st.session_state["current_question_num"],
                            "question_text": st.session_state["current_question"],
                            "category": st.session_state["current_category"],
                            "answer_text": answer_text
                        }
                        
                        try:
                            res = requests.post(f"{BACKEND_URL}/interview/answer", json=payload)
                            if res.status_code == 200:
                                data = res.json()
                                turn_res = data["turn_result"]
                                
                                # Store result log
                                st.session_state["feedback_history"].append(turn_res)
                                
                                if not data["complete"]:
                                    # Set up next question
                                    next_q = data["next_question"]
                                    st.session_state["current_question_num"] = next_q["question_number"]
                                    st.session_state["current_question"] = next_q["question_text"]
                                    st.session_state["current_category"] = next_q["category"]
                                    st.rerun()
                                else:
                                    # Session Complete
                                    st.session_state["interview_active"] = False
                                    st.session_state["final_score"] = data["placement_probability"]
                                    st.session_state["final_summary"] = data["summary"]
                                    st.session_state["show_results"] = True
                                    st.rerun()
                            else:
                                st.error(res.json().get("detail", "Error submitting answer"))
                        except Exception as e:
                            st.error(f"Connection Error: {e}")
                            
            if st.button("Cancel Interview", type="secondary"):
                st.session_state["interview_active"] = False
                st.rerun()

    with col_i2:
        st.subheader("Real-Time Observation Log")
        
        # Display results panel if complete
        if st.session_state.get("show_results"):
            st.success("🎉 Mock Interview Complete!")
            prob = st.session_state["final_score"]
            
            # Colored readiness indicator
            if prob > 65:
                st.metric("XGBoost Placement Probability", f"{prob}%", "Ready for Placement", delta_color="normal")
            else:
                st.metric("XGBoost Placement Probability", f"{prob}%", "Needs Improvement", delta_color="inverse")
                
            st.markdown('<div class="card"><div class="card-title">🤖 Local Llama Feedback Summary</div>', unsafe_allow_html=True)
            st.write(st.session_state["final_summary"])
            st.markdown('</div>', unsafe_allow_html=True)
            
            if st.button("Clear Results"):
                st.session_state["show_results"] = False
                st.rerun()
                
        # Live display of previous questions in this run
        if st.session_state["feedback_history"]:
            for item in reversed(st.session_state["feedback_history"]):
                st.markdown(
                    f"**Q{item['question_number']} ({item['category']}):** {item['question_text'][:50]}...\n"
                    f"- **Score:** `{item['content_score']}/100`\n"
                    f"- **Weakness Tag:** `{item['weakness_tag']}`\n"
                    f"- *{item['feedback']}*\n"
                    "---"
                )

# --- TAB 3: ANALYTICS & PROGRESS ---
with tab3:
    st.subheader("📊 Candidate Progress Analytics")
    
    prog_student_id = st.text_input("Enter Student ID to View History", value="charan_local", key="progress_stud_id")
    
    if st.button("Load Analytics", use_container_width=True):
        if not prog_student_id:
            st.error("Please enter a Student ID!")
        else:
            try:
                res = requests.get(f"{BACKEND_URL}/student/{prog_student_id}/progress")
                if res.status_code == 200:
                    data = res.json()
                    history = data["history"]
                    
                    if not history:
                        st.info("No mock interview data recorded for this student yet. Complete a mock session in Tab 2 to log scores!")
                    else:
                        st.write(f"Showing performance graph for **{data['name']}**")
                        
                        # Prepare data for plotting
                        weeks = [f"Week {h['week_number']}" for h in history]
                        probs = [h['placement_probability'] for h in history]
                        
                        # Chart layout
                        c_col1, c_col2 = st.columns([2, 1])
                        with c_col1:
                            st.markdown("**Placement Probability Improvement Curve**")
                            # Simple line chart
                            st.line_chart(data=dict(zip(weeks, probs)), y=None)
                            
                        with c_col2:
                            st.markdown("**History Log**")
                            for h in reversed(history):
                                st.markdown(
                                    f"**Week {h['week_number']}**\n"
                                    f"- DSA: `{h['dsa_score']}/100` | Aptitude: `{h['aptitude_score']}/100` | Comms: `{h['communication_score']}/100`\n"
                                    f"- **XGBoost Placement Probability:** `{h['placement_probability']}%`\n"
                                    f"*{h['recorded_at']}*\n"
                                    "---"
                                )
                else:
                    st.error("Student profile not found. Register them first in Tab 1!")
            except Exception as e:
                st.error(f"Error loading data: {e}")

# --- TAB 4: AUDIO TRAINING ---
with tab4:
    st.header("🗣️ Audio Training & Confidence Building")
    st.markdown("Use this tab to practice your verbal communication. The agent will listen to your answer, transcribe it with **Whisper**, analyze your speaking confidence with **Librosa**, and grade your content.")
    
    student_id_audio = st.text_input("Confirm Student ID (for Audio)", value=st.session_state.get('active_student_id', 'charan_local'))
    
    if "audio_question_generated" not in st.session_state:
        st.session_state.audio_question_generated = False
        st.session_state.audio_question_text = ""
        st.session_state.audio_session_id = f"audio_{int(time.time())}"
        
    if st.button("Generate Audio Question"):
        with st.spinner("Generating a behavioral question..."):
            response = requests.get(f"{BACKEND_URL}/student/{student_id_audio}")
            if response.status_code == 200:
                profile_data = response.json()
                # Use a specific behavioral prompt to generate a question
                # We can reuse the interview endpoint by artificially setting question_number
                q_payload = {
                    "student_id": student_id_audio,
                    "session_id": st.session_state.audio_session_id,
                    "target_company": profile_data["target_company"],
                    "question_number": 99 # High number to force behavioral/final round often, or just let agent decide
                }
                st.session_state.audio_question_text = f"Tell me about a time you faced a significant technical challenge at work and how you overcame it."
                st.session_state.audio_question_generated = True
            else:
                st.error("Please register your profile in Tab 1 first.")
                
    if st.session_state.audio_question_generated:
        st.markdown("### Question:")
        st.info(st.session_state.audio_question_text)
        
        st.markdown("### Record your Answer")
        audio_value = st.audio_input("Speak your answer clearly into the microphone")
        
        if audio_value is not None:
            if st.button("Submit Audio Answer"):
                with st.spinner("Analyzing audio (Speech-to-text & Librosa features)..."):
                    # We must send it as a multipart/form-data
                    files = {"audio_file": ("answer.wav", audio_value, "audio/wav")}
                    data = {
                        "student_id": student_id_audio,
                        "session_id": st.session_state.audio_session_id,
                        "question_number": "1",
                        "question_text": st.session_state.audio_question_text,
                        "category": "Behavioral"
                    }
                    try:
                        res = requests.post(f"{BACKEND_URL}/interview/answer_audio", data=data, files=files)
                        if res.status_code == 200:
                            result = res.json()
                            
                            st.success("Analysis Complete!")
                            col_a, col_b = st.columns(2)
                            
                            with col_a:
                                st.markdown("#### Audio Analysis")
                                st.metric("Audio Confidence Score", f"{result['confidence_score']:.1f}/100")
                                st.markdown("**Transcription:**")
                                st.write(f'"{result["transcription"]}"')
                                
                            with col_b:
                                st.markdown("#### Content Grading")
                                turn = result["turn_result"]
                                st.metric("Content Score", f"{turn['content_score']}/100")
                                st.error(f"Weakness Identified: {turn['weakness_tag']}")
                                st.info(f"Feedback: {turn['feedback']}")
                        else:
                            st.error(f"Error submitting audio: {res.text}")
                    except Exception as e:
                        st.error(f"Failed to connect to backend: {e}")

