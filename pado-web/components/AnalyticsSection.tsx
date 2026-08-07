"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function AnalyticsSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const progressRes = await fetch(
        `${BACKEND}/student/${user?.student_id || "demo_user"}/progress`
      );
      const progressJson = await progressRes.json();
      if (!progressRes.ok) throw new Error(progressJson.detail);
      setData(progressJson);

      // Try to fetch ATS Data to provide improvement areas
      try {
        const atsRes = await fetch(`${BACKEND}/student/${user?.student_id || "demo_user"}/ats`);
        if (atsRes.ok) {
          const atsJson = await atsRes.json();
          setAtsData(atsJson);
        }
      } catch (e) {
        console.warn("Could not load ATS data for analytics.");
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const containerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  const maxProb = data ? Math.max(...data.history.map((h) => h.placement_probability), 1) : 100;

  return (
    <div ref={containerRef} className="w-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 font-serif" style={{ letterSpacing: "-0.01em" }}>
            Progress Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto leading-relaxed">
            Track how your placement probability evolves over multiple practice sessions.
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center mb-10">
          <button
            onClick={load}
            disabled={loading || !user?.student_id}
            className="px-8 py-3 bg-[#3D3929] text-white text-sm font-medium rounded-xl hover:bg-[#2A271C] disabled:bg-[#E5E3DB] disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            {loading ? "Loading…" : "Refresh Data"}
          </button>
        </div>

        {error && <p className="text-sm text-red-500 text-center mb-6">{error}</p>}

        {data && data.history.length === 0 && (
          <div className="text-center py-16 border border-dashed border-[#E5E3DB] bg-[#FDFDFB] rounded-2xl">
            <p className="text-sm text-gray-400">No interview sessions recorded yet.</p>
          </div>
        )}

        {data && data.history.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="md:col-span-2 bg-[#FDFDFB] border border-[#E5E3DB] rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="flex justify-between items-end mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  ML Placement Probability
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-green-500"></span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">65% Target</span>
                </div>
              </div>
              
              <div className="flex items-end justify-around gap-2 h-48 relative">
                {/* 65% Threshold Line */}
                <div 
                  className="absolute left-0 right-0 border-t-2 border-dashed border-green-500/30 z-0" 
                  style={{ bottom: `${(65 / maxProb) * 140 + 20}px` }} 
                />
                
                {data.history.map((h, i) => (
                  <div 
                    key={i} 
                    className="flex flex-col items-center gap-2 z-10"
                    style={{ animation: `scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`, transformOrigin: 'bottom', transform: 'scaleY(0)' }}
                  >
                    <span className={`text-xs font-bold ${h.placement_probability >= 65 ? "text-green-600" : "text-[#3D3929]"}`}>
                      {h.placement_probability}%
                    </span>
                    <div
                      className={`w-12 rounded-t-lg transition-all duration-700 ${h.placement_probability >= 65 ? "bg-green-500 hover:bg-green-400" : "bg-[#3D3929] hover:bg-[#D97757]"}`}
                      style={{ height: `${(h.placement_probability / maxProb) * 140}px`, minHeight: "4px" }}
                    />
                    <span className="text-[10px] font-bold text-gray-400">W{h.week_number}</span>
                  </div>
                ))}
              </div>
              <style jsx>{`
                @keyframes scaleUp {
                  to { transform: scaleY(1); }
                }
              `}</style>
            </div>

            {/* Log */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Session Log</p>
              {[...data.history].reverse().map((h, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-[#E5E3DB] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  style={{ animation: `fadeInUp 0.4s ease forwards ${i * 0.1}s`, opacity: 0, transform: 'translateY(10px)' }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Week {h.week_number}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        h.placement_probability >= 65 
                          ? "bg-green-50 text-green-600 border border-green-100" 
                          : "bg-red-50 text-red-600 border border-red-100"
                      }`}>
                        {h.placement_probability >= 65 ? "Ready" : "Needs Work"}
                      </span>
                      <span className="text-sm font-semibold text-[#3D3929]">{h.placement_probability}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "DSA", val: h.dsa_score },
                      { label: "Aptitude", val: h.aptitude_score },
                      { label: "Comms", val: h.communication_score },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-3">
                        <span className="text-[10px] font-medium text-gray-500 w-12 uppercase">{m.label}</span>
                        <div className="flex-1 h-0.5 bg-[#E5E3DB] rounded-full">
                          <div className="h-0.5 bg-[#3D3929] rounded-full" style={{ width: `${m.val}%` }} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">{Math.round(m.val)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 text-right">{new Date(h.recorded_at).toLocaleDateString()}</p>
                </div>
              ))}
              <style jsx>{`
                @keyframes fadeInUp {
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* ATS Intelligence Recommendations */}
        {atsData && atsData.company_readiness_score < 85 && (
          <div className="mt-8 space-y-6 animate-fade-in-up">
            <h3 className="text-2xl font-semibold tracking-tight text-gray-900 font-serif" style={{ letterSpacing: "-0.01em" }}>
              Career Intelligence & Opportunities
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Improvement Areas */}
              <div className="bg-[#FDFDFB] border border-[#E5E3DB] rounded-2xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span> Areas to Improve for {user?.target_company || "Target Company"}
                </h4>
                <p className="text-xs text-gray-500 mb-4">You are currently at a {atsData.company_readiness_score}% match. Address these areas to improve your chances:</p>
                <ul className="space-y-3">
                  {atsData.weaknesses?.map((weak, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-400 mt-0.5">↳</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                  {atsData.recommendations?.map((rec, i) => (
                    <li key={`rec-${i}`} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-400 mt-0.5">↳</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Alternative Companies */}
              {atsData.alternative_companies && atsData.alternative_companies.length > 0 && (
                <div className="bg-[#FDFDFB] border border-[#E5E3DB] rounded-2xl p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Highly Matched Opportunities
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">With the skills you currently have, you can work in this role at these companies right now:</p>
                  
                  <div className="space-y-3">
                    {atsData.alternative_companies.map((company, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-[#E5E3DB] bg-white">
                        <div>
                          <p className="font-bold text-[#3D3929]">{company.company}</p>
                          <p className="text-[10px] text-gray-500 max-w-[200px] leading-tight mt-1">{company.reason}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-green-600">{company.match_percentage}%</span>
                          <p className="text-[9px] uppercase tracking-widest text-gray-400">Match</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
