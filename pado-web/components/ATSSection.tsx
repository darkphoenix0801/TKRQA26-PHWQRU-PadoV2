"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Building2, BrainCircuit, ArrowRight, Star } from 'lucide-react';

export default function ATSSection({ atsData, detailedResume, onGenerateRoadmap, isGeneratingRoadmap }) {
  const radarData = useMemo(() => {
    if (!atsData?.section_scores) return [];
    return Object.entries(atsData.section_scores).map(([subject, data]) => ({
      subject,
      score: (data.score / data.max) * 100,
      fullMark: 100,
    }));
  }, [atsData]);

  if (!atsData) return null;

  const scoreColor = atsData.overall_score >= 80 ? 'text-emerald-400' : atsData.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = atsData.overall_score >= 80 ? 'bg-emerald-500/20 border-emerald-500/50' : atsData.overall_score >= 60 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-red-500/20 border-red-500/50';

  const readinessScore = atsData.company_readiness_score || 0;
  const readinessColor = readinessScore >= 80 ? 'text-emerald-400' : readinessScore >= 60 ? 'text-yellow-400' : 'text-red-400';
  
  const getReadinessText = (score) => {
    if (score >= 85) return "Highly Competitive";
    if (score >= 70) return "Strong Match";
    if (score >= 50) return "Developing";
    return "Not Yet Ready";
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
          AI ATS Intelligence Report
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          {atsData.motivational_feedback || "Here is a detailed breakdown of your resume and readiness for your target role."}
        </p>
      </div>

      {/* Top Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATS Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-8 rounded-3xl border backdrop-blur-md flex flex-col items-center justify-center space-y-4 ${scoreBg}`}
        >
          <h3 className="text-xl font-semibold text-white">Overall ATS Score</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-slate-700" strokeWidth="12" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                className={`stroke-current ${scoreColor}`} 
                strokeWidth="12" fill="none" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * atsData.overall_score) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${scoreColor}`}>{atsData.overall_score}</span>
              <span className="text-slate-300 text-sm">/ 100</span>
            </div>
          </div>
          <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${scoreColor} border-current bg-black/20`}>
            {atsData.resume_level || "Intermediate"}
          </span>
        </motion.div>

        {/* Company Readiness Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md flex flex-col items-center justify-center space-y-4"
        >
          <h3 className="text-xl font-semibold text-white">Target Company Readiness</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" className="stroke-slate-700" strokeWidth="12" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                className={`stroke-current ${readinessColor}`} 
                strokeWidth="12" fill="none" 
                strokeDasharray="440" 
                strokeDashoffset={440 - (440 * readinessScore) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-5xl font-black ${readinessColor}`}>{readinessScore}%</span>
            </div>
          </div>
          <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${readinessColor} border-current bg-black/20`}>
            {getReadinessText(readinessScore)}
          </span>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 p-6 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-cyan-400" /> Skill Dimensions
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" /> Detailed Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atsData.section_scores && Object.entries(atsData.section_scores).map(([name, data]) => {
              const percentage = (data.score / data.max) * 100;
              return (
                <div key={name} className="bg-slate-900/50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{name}</span>
                    <span className="text-slate-400">{data.score}/{data.max}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-400' : percentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{data.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Key Strengths
          </h3>
          <ul className="space-y-3">
            {atsData.strengths?.map((str, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
            <XCircle className="w-5 h-5" /> Areas to Improve
          </h3>
          <ul className="space-y-3">
            {atsData.weaknesses?.map((weak, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Alternative Recommendations */}
      {atsData.alternative_companies && atsData.alternative_companies.length > 0 && (
        <div className="p-6 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Better Opportunity Matches
          </h3>
          <p className="text-sm text-slate-300">Based on your current profile, you have a higher probability of matching with these companies:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {atsData.alternative_companies.map((company, i) => (
              <div key={i} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">{company.company}</span>
                  <span className="text-cyan-400 font-semibold">{company.match_percentage}%</span>
                </div>
                <p className="text-xs text-slate-400">{company.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Area */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 text-center space-y-6">
        <h3 className="text-2xl font-bold text-white">Generate Your Personalized Roadmap</h3>
        <p className="text-slate-300 max-w-2xl mx-auto">
          We've identified your skill gaps. Now, let AI generate a customized day-by-day preparation plan targeting EXACTLY what you need to master to crack your target company.
        </p>
        <button
          onClick={onGenerateRoadmap}
          disabled={isGeneratingRoadmap}
          className="mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
        >
          {isGeneratingRoadmap ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Generating Intelligent Roadmap...</span>
            </>
          ) : (
            <>
              Generate AI Roadmap
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
