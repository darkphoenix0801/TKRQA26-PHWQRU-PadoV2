"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import dynamic from "next/dynamic";
const IntroOverlay = dynamic(() => import("@/components/CinematicIntro").then(mod => mod.IntroOverlay), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <IntroOverlay title="PADO" subtitle="AI PLACEMENT COACH" />
      <Navbar />
      <main className="min-h-screen bg-transparent">
        <Hero />
        <HowItWorks />
      </main>
      
      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 py-12 text-center mt-20 bg-gray-50/50">
        <div className="w-7 h-7 mx-auto rounded-lg bg-black flex items-center justify-center mb-4">
          <span className="text-white text-xs font-bold tracking-tight">P</span>
        </div>
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          © {new Date().getFullYear()} PADO. All rights reserved by Bloodline Agents Team.
        </p>
      </footer>
    </>
  );
}
