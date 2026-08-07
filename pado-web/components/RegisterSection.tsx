"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import ATSSection from "./ATSSection";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function RegisterSection({ user }: { user: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    cgpa: "8.5",
    target_company: "Google",
    target_role: "Software Engineer",
  });
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // New ATS State
  const [atsData, setAtsData] = useState(null);
  const [detailedResume, setDetailedResume] = useState(null);
  const [showATS, setShowATS] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  
  const containerRef = useRef(null);

  // Parse resume file: PDF, DOCX or TXT (client-side text extraction)
  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.name.endsWith(".txt")) {
      const text = await file.text();
      setResumeText(text);
    } else if (file.name.endsWith(".pdf")) {
      // Read raw text via FormData → backend helper endpoint
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`${BACKEND}/util/parse_resume`, { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setResumeText(data.text);
        } else {
          setError("Could not parse PDF. Try pasting your resume text below.");
        }
      } catch {
        setError("Backend not reachable. Paste your resume text manually.");
      }
    } else if (file.name.endsWith(".docx")) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(`${BACKEND}/util/parse_resume`, { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          setResumeText(data.text);
        } else {
          setError("Could not parse DOCX. Try pasting your resume text below.");
        }
      } catch {
        setError("Backend not reachable. Paste your resume text manually.");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!resumeText) {
      setError("Please provide a resume.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.student_id || "demo_user",
          name: user?.name || "Demo User",
          cgpa: parseFloat(form.cgpa) || 0.0,
          target_company: form.target_company,
          target_role: form.target_role,
          resume_text: resumeText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      
      // We now have ATS Data, show the ATS Dashboard
      setAtsData(data.ats_data);
      setDetailedResume(data.detailed_resume);
      setShowATS(true);
      
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("timeout") || err.message?.includes("fetch")) {
        setError("The AI analysis took too long (this can happen with detailed resumes). Please try again in a moment.");
      } else {
        setError("Failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateRoadmap() {
    setIsGeneratingRoadmap(true);
    setError("");
    try {
      const res = await fetch(`${BACKEND}/student/generate_roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user?.student_id || "demo_user" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Roadmap generation failed");
      
      router.push("/dashboard/roadmap");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("timeout") || err.message?.includes("fetch")) {
        setError("Roadmap generation is taking longer than expected. Please try again.");
      } else {
        setError("Failed: " + err.message);
      }
      setIsGeneratingRoadmap(false);
    }
  }

  const categoryMeta = {
    DSA: { icon: "⌥", label: "Data Structures & Algorithms" },
    Aptitude: { icon: "◈", label: "Aptitude & Reasoning" },
    "Core Subjects": { icon: "◉", label: "Core CS Subjects" },
    Communication: { icon: "◎", label: "Communication Skills" },
  };

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      {showATS ? (
        <div className="max-w-6xl mx-auto py-8">
          {error && <p className="text-sm text-red-500 bg-red-500/10 px-4 py-3 rounded-xl mb-4 border border-red-500/20">{error}</p>}
          <ATSSection 
            atsData={atsData} 
            detailedResume={detailedResume} 
            onGenerateRoadmap={handleGenerateRoadmap}
            isGeneratingRoadmap={isGeneratingRoadmap}
          />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 font-serif" style={{ letterSpacing: "-0.01em" }}>
              AI ATS Intelligence & Roadmap
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
              Upload your resume to receive a highly detailed ATS Analysis. Afterwards, our AI will generate a personalized preparation plan to crack your target company.
            </p>
          </div>

          <div className="max-w-xl mx-auto glass-tile p-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">CGPA</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    value={form.cgpa}
                    onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Target Company</label>
                  <select
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    value={form.target_company}
                    onChange={(e) => setForm({ ...form, target_company: e.target.value })}
                  >
                    {["Google", "Amazon", "Meta", "Microsoft", "Netflix", "TCS", "Infosys", "Accenture", "Cognizant", "Capgemini"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Target Role</label>
                  <select
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    value={form.target_role}
                    onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                  >
                    {["Software Engineer", "Full Stack Developer", "Backend Developer", "Frontend Developer", "Data Analyst", "Cybersecurity Analyst", "Machine Learning Engineer"].map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Resume File</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200/50 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-white/90 transition-all bg-white/50">
                  <div className="text-center">
                    {fileName ? (
                      <>
                        <p className="text-sm font-medium text-gray-900">✓ {fileName}</p>
                        <p className="text-xs text-gray-400 mt-1">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">Drop your resume here</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {/* Manual fallback */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Resume Text <span className="text-gray-300">(auto-filled from upload or paste manually)</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all resize-none"
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading || !resumeText}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Analyzing Resume ATS & Matching Company...
                  </>
                ) : (
                  "Analyze ATS & Company Readiness →"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
