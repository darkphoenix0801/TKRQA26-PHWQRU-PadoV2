"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const steps = [
  {
    number: "01",
    title: "Upload Resume",
    description: "Drop your PDF or DOCX. The local Llama model extracts your skills, experience, and gaps — no data sent to the cloud.",
  },
  {
    number: "02",
    title: "Get Your Roadmap",
    description: "Receive a tailored preparation plan across DSA, Aptitude, Core Subjects, and Communication — customized for your target company.",
  },
  {
    number: "03",
    title: "Practice Adaptively",
    description: "Start a mock interview. The AI agent inspects your session memory and dynamically pivots to drill down on weak topics.",
  },
  {
    number: "04",
    title: "Track Progress",
    description: "After each session, your XGBoost model predicts your real placement probability and logs it to your weekly analytics dashboard.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".step-card");
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((c) => {
      gsap.set(c, { y: 30, opacity: 0 });
      observer.observe(c);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 px-6 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            How PADO Works
          </h2>
          <p className="text-gray-400 mt-3">Four steps. Zero cloud dependency.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {steps.map((s) => (
            <div key={s.number} className="step-card bg-white p-7">
              <p className="text-3xl font-light text-gray-200 mb-4 tracking-tight">{s.number}</p>
              <p className="text-sm font-semibold text-gray-900 mb-2">{s.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
