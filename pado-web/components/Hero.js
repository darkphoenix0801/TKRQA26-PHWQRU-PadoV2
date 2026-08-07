"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const stats = [
  { value: "79%", label: "Model Accuracy" },
  { value: "1K+", label: "Training Samples" },
  { value: "4", label: "Skill Categories" },
  { value: "100%", label: "Runs Locally" },
];

export default function Hero() {
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const badgeRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(badgeRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" })
      .fromTo(headlineRef.current.querySelectorAll(".word"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: "power3.out" }, "-=0.2")
      .fromTo(subRef.current, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.3")
      .fromTo(ctaRef.current.children, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.3")
      .fromTo(statsRef.current.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, "-=0.2");
  }, []);

  const headline = "Your AI Placement Coach,\nBuilt for Engineers.";

  return (
    <section className="relative pt-32 pb-24 px-6 min-h-[80vh] flex flex-col justify-center overflow-hidden bg-transparent">
      {/* Animated Purple Clouds Background */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div ref={heroRef} className="max-w-5xl mx-auto text-center relative z-10">
      {/* Badge */}
      <div ref={badgeRef} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-gray-500 font-medium">Powered by Local LLM · No data leaves your machine</span>
      </div>

      {/* Headline */}
      <h1 ref={headlineRef} className="text-5xl md:text-7xl font-semibold tracking-tight text-gray-900 leading-tight mb-6" style={{ letterSpacing: "-0.03em" }}>
        {headline.split("\n").map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((word, wi) => (
              <span key={wi} className="inline-block mr-2">
                <span className="word inline-block">{word}</span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      {/* Sub */}
      <p ref={subRef} className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
        PADO analyses your resume with a local Llama model, builds a company-specific study roadmap, and conducts adaptive mock interviews that pivot in real-time based on your weak areas.
      </p>

      {/* CTAs */}
      <div ref={ctaRef} className="flex items-center justify-center gap-4 mb-20">
        <a
          href="/auth"
          className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
        >
          Start Your Journey
        </a>
        <a
          href="#how-it-works"
          className="px-6 py-3 bg-white/50 backdrop-blur-md text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:border-gray-400 hover:bg-white transition-all duration-200"
        >
          How it works →
        </a>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/10">
        {stats.map((s) => (
          <div key={s.value} className="bg-white/80 backdrop-blur-md py-8 px-4 text-center">
            <div className="text-3xl font-semibold text-gray-900 tracking-tight">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
