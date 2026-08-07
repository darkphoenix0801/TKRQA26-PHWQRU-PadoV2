# PADO 🎓 — Placement Assessment & Development Orchestrator

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)

PADO is a smart, AI-powered agent designed to act as a **personal career mentor** for college students. Instead of static, generic preparation, PADO dynamically analyzes resumes, identifies skill gaps, generates custom learning roadmaps, and conducts **adaptive mock interviews** tailored specifically to the user's weaknesses.

---

## 🚀 Features

*   **Dynamic Onboarding & ATS Analysis:** Upload your resume and target company. PADO extracts your skills using advanced LLMs (Groq / LLaMA 3.1) and provides a comprehensive ATS score, highlighting strengths and missing requirements.
*   **Personalized Study Roadmap:** Get an actionable, week-by-week preparation plan covering DSA, Aptitude, Core Subjects, and Communication.
*   **Adaptive Mock Interviews:** 
    *   PADO asks technical and behavioral questions.
    *   Answers are accepted via text or **Voice** (powered by local Whisper models).
    *   **Agentic Behavior:** If you struggle on a specific topic, PADO actively queries its memory and asks follow-up questions to test your limits.
*   **Speech & Content Grading:**
    *   Transcribes audio using OpenAI Whisper locally.
    *   Analyzes speech confidence, pause durations, and speed using **Librosa**.
    *   Grades answer content via an LLM "AI Judge".
*   **Placement Probability Prediction:** An integrated XGBoost Machine Learning model calculates a dynamic "Placement Probability" score (0–100%) based on academic performance and mock interview scores.
*   **Progress Dashboard:** Visualize your weekly progress towards placement readiness using dynamic, interactive charts (Recharts).

---

## 🛠️ Technology Stack

**Frontend:**
*   **Framework:** Next.js (React 19)
*   **Styling & Animation:** Tailwind CSS, Framer Motion, GSAP
*   **Data Visualization:** Recharts

**Backend:**
*   **Framework:** FastAPI (Python)
*   **Database:** SQLite (`pado.db`)
*   **AI Models & Processing:** 
    *   Groq API (LLaMA 3.1 8B Instant) for reasoning and evaluation.
    *   OpenAI Whisper (`tiny.en`) for local speech-to-text.
    *   Librosa & NumPy for audio analysis.
    *   XGBoost / Scikit-Learn for ML prediction.

---

## ⚙️ Getting Started (Local Development)

Follow these steps to run the application locally on your machine.

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   Groq API Key (and optionally OpenAI API Key)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pado.git
cd pado
```

### 2. Setup the Backend
Navigate to the `backend` directory and set up the Python environment:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Set up your `.env` file in the root `pado` folder:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Start the FastAPI server:
```bash
python -m uvicorn main:app --reload --port 8000
```
*The backend will be running at `http://127.0.0.1:8000`*

### 3. Setup the Frontend
Open a new terminal and navigate to the `pado-web` directory:
```bash
cd pado-web
npm install
```

Configure your `.env.local` file in `pado-web`:
```env
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

Start the Next.js development server:
```bash
npm run dev
```
*The frontend will be running at `http://localhost:3000`*

---

## 🔮 Future Enhancements (Roadmap)
*   **Interactive Code Playground:** Integrated code execution environment for real-time coding rounds.
*   **HR Attitude Analysis:** Sentiment analysis on transcribed speech to determine emotional state (optimistic, stressed, etc.).
*   **Automated Resume Builder:** AI-driven suggestions and automated generation of resume improvements based on skill gaps.
*   **Automated Progress Reports:** Scheduled PDF reports emailed directly to students and placement officers.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for discussion.

## 📄 License
This project is licensed under the team Bloodline Agents and Completely Rights Reserved by DarkPhoenix 
All rights are reserved. 
