"use client";

import { useUser } from "@/components/UserContext";
import { useEffect, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, AlertCircle, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardRoot() {
  const user = useUser();
  const [data, setData] = useState({ ats: null, progress: null, loading: true, error: "" });

  useEffect(() => {
    async function loadSnapshot() {
      if (!user?.student_id) return;
      try {
        const atsRes = await fetch(`/api/student/${user.student_id}/ats`);
        const progRes = await fetch(`/api/student/${user.student_id}/progress`);
        
        let ats = null;
        let progress = null;
        
        if (atsRes.ok) ats = await atsRes.json();
        if (progRes.ok) {
          const pData = await progRes.json();
          if (pData.history && pData.history.length > 0) {
            // Get most recent progress
            progress = pData.history[pData.history.length - 1];
          }
        }
        
        setData({ ats, progress, loading: false, error: "" });
      } catch (e) {
        setData(prev => ({ ...prev, loading: false, error: "Failed to load snapshot" }));
      }
    }
    loadSnapshot();
  }, [user]);

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Analyzing your career data...</p>
      </div>
    );
  }

  const resumeScore = data.ats?.overall_score || 0;
  const techScore = data.progress?.dsa_score || 0;
  const commsScore = data.progress?.communication_score || 0;
  const placementProb = data.progress?.placement_probability || data.ats?.company_readiness_score || 0;
  const biggestGap = data.ats?.skill_gap?.priority_skills?.[0] || "Take mock interviews to find gaps";

  const radarData = [
    { subject: "Resume", A: resumeScore, fullMark: 100 },
    { subject: "Technical", A: techScore, fullMark: 100 },
    { subject: "Communication", A: commsScore, fullMark: 100 },
    { subject: "Aptitude", A: data.progress?.aptitude_score || 0, fullMark: 100 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 font-serif">AI Career Snapshot</h1>
        <p className="text-gray-500">Your overall readiness for <span className="font-semibold text-gray-800">{user?.target_role || "Target Role"}</span> at <span className="font-semibold text-gray-800">{user?.target_company || "Target Company"}</span></p>
      </div>

      {data.error && <p className="text-red-500 text-center">{data.error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placement Probability */}
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5E3DB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <Target className="w-5 h-5 text-[#D97757]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest">Placement Prob</h3>
          </div>
          <div className="text-5xl font-black text-[#3D3929]">{placementProb}%</div>
          <p className="text-xs text-gray-400 mt-2">Combined ATS & Interview Readiness</p>
        </div>

        {/* Resume Score */}
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5E3DB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <Briefcase className="w-5 h-5 text-[#3D3929]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest">Resume Score</h3>
          </div>
          <div className="text-5xl font-black text-[#3D3929]">{resumeScore}/100</div>
          <Link href="/dashboard/roadmap" className="text-xs text-blue-600 mt-2 flex items-center hover:underline">
            View ATS Breakdown <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {/* Technical Score */}
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5E3DB] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-semibold uppercase tracking-widest">Technical</h3>
          </div>
          <div className="text-5xl font-black text-[#3D3929]">{techScore}/100</div>
          <Link href="/dashboard/interview" className="text-xs text-blue-600 mt-2 flex items-center hover:underline">
            Practice Mock Interview <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {/* Biggest Gap */}
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-red-600 mb-4">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-widest">Biggest Gap</h3>
          </div>
          <div className="text-2xl font-bold text-red-700 leading-tight">{biggestGap}</div>
          <p className="text-xs text-red-500 mt-2">Prioritize this in your roadmap</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5E3DB] shadow-sm">
          <h3 className="text-lg font-bold text-[#3D3929] mb-4">Skill Dimensions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E5E3DB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#3D3929', fontSize: 12 }} />
                <Radar name="Score" dataKey="A" stroke="#D97757" fill="#D97757" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E5E3DB] shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-[#3D3929]">Motivational Feedback</h3>
          <p className="text-gray-600 leading-relaxed italic border-l-4 border-[#D97757] pl-4">
            "{data.ats?.motivational_feedback || "Keep pushing forward! Take a mock interview to establish your baseline and get personalized feedback."}"
          </p>
          
          <div className="mt-8">
             <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">Quick Actions</h4>
             <div className="space-y-3">
               <Link href="/dashboard/roadmap" className="block w-full text-center py-3 bg-[#3D3929] text-white rounded-xl hover:bg-black transition-colors font-medium shadow-sm">
                 Continue Roadmap
               </Link>
               <Link href="/dashboard/interview" className="block w-full text-center py-3 border border-[#E5E3DB] text-[#3D3929] rounded-xl hover:bg-gray-50 transition-colors font-medium">
                 Start Mock Interview
               </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
