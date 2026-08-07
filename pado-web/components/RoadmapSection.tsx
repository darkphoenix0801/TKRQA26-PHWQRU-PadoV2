"use client";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

/* ── flatten all topics into ordered steps ── */
interface Step {
  index: number;
  category: string;
  topic: string;
}

function flattenRoadmap(roadmap: Record<string, string[]>): Step[] {
  const steps: Step[] = [];
  let idx = 0;
  for (const [cat, topics] of Object.entries(roadmap)) {
    for (const topic of topics) {
      steps.push({ index: idx++, category: cat, topic });
    }
  }
  return steps;
}

export default function RoadmapSection({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);
  const [error, setError] = useState("");

  const timelineRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── fetch roadmap ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND}/student/${user?.student_id ?? "demo_user"}/roadmap`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Failed to load");
        setSteps(flattenRoadmap(data.roadmap ?? {}));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /* ── GSAP scroll animations ── */
  useEffect(() => {
    if (loading || steps.length === 0) return;

    // small delay so DOM is painted
    const raf = requestAnimationFrame(() => {
      // 1) Fill the vertical line on scroll
      if (fillRef.current && timelineRef.current) {
        gsap.fromTo(
          fillRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 40%",
              end: "bottom 60%",
              scrub: 0.3,
            },
          }
        );
      }

      // 2) Animate each card in from its side
      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          el,
          { x: fromLeft ? -50 : 50, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loading, steps]);

  /* ────── RENDER ────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Loading roadmap</p>
        </div>
      </div>
    );
  }

  if (error || steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 bg-white/60 backdrop-blur rounded-3xl text-center p-16 min-h-[300px]">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-5 text-gray-400 text-xl">!</div>
        <p className="text-lg font-semibold text-gray-800">No Roadmap Yet</p>
        <p className="text-sm text-gray-400 mt-2 max-w-xs">
          Head to <strong>Roadmap Setup</strong>, upload your resume, and we&apos;ll build one for you.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-32">
      <div className="max-w-4xl mx-auto">
        {/* header */}
        <div className="mb-20 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">Your personalised</p>
          <h2
            className="text-5xl font-bold tracking-tight text-gray-900"
            style={{ letterSpacing: "-0.03em" }}
          >
            Master Plan
          </h2>
          <p className="text-base text-gray-400 mt-5 max-w-md mx-auto leading-relaxed">
            Scroll through each milestone. The line fills as you progress&nbsp;— left&nbsp;and&nbsp;right, step&nbsp;by&nbsp;step.
          </p>
        </div>

        {/* ── TIMELINE ── */}
        <div ref={timelineRef} className="relative" style={{ minHeight: steps.length * 120 }}>
          {/* grey track */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-200 -translate-x-1/2" />
          {/* black fill – grows via scaleY */}
          <div
            ref={fillRef}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-900 -translate-x-1/2 origin-top"
            style={{ transform: "scaleY(0)" }}
          />

          {/* steps */}
          <div className="relative flex flex-col gap-12 py-4">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  ref={(el) => { nodeRefs.current[i] = el; }}
                  className="relative grid items-center"
                  style={{ gridTemplateColumns: "1fr 56px 1fr" }}
                >
                  {/* LEFT column */}
                  <div className={isLeft ? "" : ""}> 
                    {isLeft && (
                      <div className="ml-auto mr-2 max-w-[340px]">
                        <StepCard step={step} align="right" />
                      </div>
                    )}
                  </div>

                  {/* CENTER dot */}
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center z-10 shadow-sm hover:border-gray-900 hover:scale-110 transition-all duration-200">
                      <span className="text-xs font-bold text-gray-500">{step.index + 1}</span>
                    </div>
                  </div>

                  {/* RIGHT column */}
                  <div>
                    {!isLeft && (
                      <div className="ml-2 max-w-[340px]">
                        <StepCard step={step} align="left" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* final dot */}
            <div className="relative grid items-center" style={{ gridTemplateColumns: "1fr 56px 1fr" }}>
              <div />
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center z-10 shadow-lg">
                  <span className="text-white text-lg">🎯</span>
                </div>
              </div>
              <div />
            </div>
            <p className="text-center text-sm font-semibold text-gray-400 tracking-wide uppercase">You&apos;re ready.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── small card component ── */
function StepCard({ step, align }: { step: Step; align: "left" | "right" }) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(step.topic + " free tutorial")}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group glass-tile p-5 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5 group-hover:text-red-500 transition-colors">
        {step.category} • Free Resource ↗
      </p>
      <p className="text-[14px] font-semibold text-gray-800 leading-snug group-hover:text-gray-900">
        {step.topic}
      </p>
    </a>
  );
}
