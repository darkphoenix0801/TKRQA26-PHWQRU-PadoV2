"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Score</span>
        <span className={score >= 60 ? "text-gray-700 font-medium" : "text-red-500 font-medium"}>{score}/100</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-1 rounded-full transition-all duration-700 ${score >= 60 ? "bg-gray-900" : "bg-red-400"}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function InterviewSection({ user }: { user: any }) {
  const [sessionId, setSessionId] = useState("");
  const [active, setActive] = useState(false);
  const [targetCompany, setTargetCompany] = useState("Google");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [question, setQuestion] = useState({ text: "", category: "", number: 1 });
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const questionCardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function animateIn(el: HTMLElement | null) {
    if (!el) return;
    gsap.fromTo(el, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
  }

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // Auto-focus textarea when question loads
  useEffect(() => {
    if (active && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [active, question.number]);

  async function startInterview() {
    setError("");
    setResult(null);
    setHistory([]);
    const sid = `sess_${Math.random().toString(36).slice(2, 10)}`;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: user?.student_id || "demo_user", session_id: sid, target_company: targetCompany }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setSessionId(sid);
      setTotalQuestions(data.total_questions || 3);
      setQuestion({ number: 1, text: data.question_text, category: data.category });
      setAnswer("");
      setActive(true);
      setTimeout(() => animateIn(questionCardRef.current), 50);
    } catch (err: any) {
      if (err.message.toLowerCase().includes("timeout") || err.message.includes("fetch")) {
        setError("The AI took too long to respond. This usually happens if the API is warming up. Please try again.");
      } else {
        setError("Failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/interview/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.student_id || "demo_user",
          session_id: sessionId,
          question_number: question.number,
          question_text: question.text,
          category: question.category,
          answer_text: answer,
          target_company: targetCompany,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setHistory((h) => [...h, data.turn_result]);

      if (!data.complete && data.next_question) {
        setQuestion({
          number: data.next_question.question_number,
          text: data.next_question.question_text,
          category: data.next_question.category,
        });
        setAnswer("");
        setTimeout(() => animateIn(questionCardRef.current), 50);
      } else {
        setActive(false);
        setResult({ probability: data.placement_probability, summary: data.summary });
        setTimeout(() => animateIn(resultRef.current), 50);
      }
    } catch (err: any) {
      if (err.message.toLowerCase().includes("timeout") || err.message.includes("fetch")) {
        setError("The AI took too long to respond. This usually happens if the API is warming up. Please try again.");
      } else {
        setError("Failed: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const progressPct = active ? Math.round(((question.number - 1) / totalQuestions) * 100) : result ? 100 : 0;

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* ── Pre-Interview: Company Selection ── */}
      {!active && !result && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="w-full max-w-2xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900" style={{ letterSpacing: "-0.01em" }}>
                Adaptive Mock Interview
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
                The agent reads your past answers from its session memory and pivots to drill down on
                weak topics — just like a real interviewer.
              </p>
            </div>

            <div className="glass-tile p-8">
              <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center mx-auto mb-6 border border-white/50 shadow-sm">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Ready to begin?</h3>
              <p className="text-sm text-gray-500 mb-6 text-center">Adaptive company-specific questions, scored in real-time by your local Llama model.</p>

              <label className="block text-xs font-medium text-gray-500 mb-3">Select Target Company</label>
              <div className="grid grid-cols-4 gap-2.5 mb-6">
                {["Google", "Amazon", "Meta", "Microsoft", "Netflix", "Apple", "Uber", "Bloomberg"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setTargetCompany(c)}
                    className={`p-2.5 text-sm font-medium rounded-xl transition-all border ${targetCompany === c
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white/50 text-gray-600 border-white/50 hover:border-gray-400 hover:bg-white/80"
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                onClick={startInterview}
                disabled={loading}
                className="w-full py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? "Starting…" : "Start Interview →"}
              </button>
              {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
            </div>

            {/* Observation Log */}
            {history.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Previous Session Scores</p>
                <div className="space-y-3">
                  {history.map((h: any, idx: number) => (
                    <div key={h.question_number} className="border border-gray-200 bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Q{h.question_number} · {h.category}</p>
                        {h.weakness_tag && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">Weak</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-800 font-medium mb-2 line-clamp-1">{h.question_text}</p>
                      <ScoreBar score={h.content_score} />
                      {h.weakness_tag && <p className="text-xs text-orange-600 mt-2">↳ {h.weakness_tag}</p>}
                      {h.feedback && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{h.feedback}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Active Interview: Left = Answer, Right = Question ── */}
      {active && (
        <div ref={questionCardRef} className="flex flex-col h-[calc(100vh-80px)]">
          {/* Top bar: progress */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-gray-500">
                Question {question.number} of {totalQuestions}
              </span>
              <div className="w-40 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-1 bg-gray-900 rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                {question.category}
              </span>
              <button
                onClick={() => { setActive(false); setHistory([]); }}
                className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Main split pane */}
          <div className="flex-1 grid grid-cols-2 min-h-0">
            {/* LEFT: Answer Area */}
            <div className="flex flex-col border-r border-gray-100 bg-white">
              <div className="px-5 py-3 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Answer</span>
              </div>
              <div className="flex-1 p-0 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here... You can write code, explanations, or both."
                  className="w-full h-full resize-none border-0 outline-none p-5 text-sm text-gray-800 font-mono leading-relaxed bg-white placeholder:text-gray-300"
                  spellCheck={false}
                />
              </div>

              {/* Past scores strip */}
              {history.length > 0 && (
                <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">Past:</span>
                  {history.map((h: any) => (
                    <div key={h.question_number} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded">
                      Q{h.question_number}: <span className={h.content_score >= 60 ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{h.content_score}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit bar */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <button
                  onClick={submitAnswer}
                  disabled={loading || !answer.trim()}
                  className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40"
                >
                  {loading ? "Analyzing…" : "Submit Answer →"}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 px-5 pb-2 text-center">{error}</p>}
            </div>

            {/* RIGHT: Question Display */}
            <div className="flex flex-col bg-[#FAFAFA] overflow-y-auto">
              <div className="px-5 py-3 border-b border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question</span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {(question.text || "").replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Card ── */}
      {result && (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div ref={resultRef} className="w-full max-w-2xl border border-gray-200 bg-white rounded-2xl p-8 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Session Complete</p>
            <div className="flex items-end gap-4 mb-6">
              <div>
                <p className="text-5xl font-semibold text-gray-900 tracking-tight">{result.probability}%</p>
                <p className="text-sm text-gray-400 mt-1">XGBoost Placement Probability</p>
              </div>
              <span
                className={`mb-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${result.probability > 65
                  ? "bg-gray-900 text-white"
                  : "bg-red-50 text-red-600 border border-red-100"
                  }`}
              >
                {result.probability > 65 ? "Ready" : "Needs Improvement"}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Llama Feedback</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
            </div>

            {/* Per-question breakdown */}
            {history.length > 0 && (
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Question Breakdown</p>
                <div className="space-y-2">
                  {history.map((h: any) => (
                    <div key={h.question_number} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500">Q{h.question_number}</span>
                        <span className="text-xs text-gray-400">{h.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${h.content_score >= 60 ? "text-gray-900" : "text-red-500"}`}>
                          {h.content_score}/100
                        </span>
                        {h.weakness_tag && (
                          <span className="text-[9px] font-bold uppercase bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">weak</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setResult(null); setHistory([]); }}
              className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-black transition-colors"
            >
              Start new session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
