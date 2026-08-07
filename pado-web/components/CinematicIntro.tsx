"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/* ═══════════════════════════════════════════════════════════
   OPTIMIZED PAPER-CONFETTI CANVAS
   ═══════════════════════════════════════════════════════════ */

const COLORS = [
  "#6366f1","#818cf8","#c7d2fe","#f59e0b","#fbbf24",
  "#10b981","#6ee7b7","#ef4444","#fca5a5","#ec4899",
  "#8b5cf6","#e2e8f0","#ffffff","#fcd34d","#14b8a6",
];

function CinematicCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(dpr, dpr);

    // Initial white paper "A4" blocks falling
    const paperCount = W > 1000 ? 50 : 30;
    const papers: any[] = [];
    for (let i = 0; i < paperCount; i++) {
      papers.push({
        x: Math.random() * W, 
        y: -Math.random() * H - 100, 
        w: 45 + Math.random() * 35, 
        h: 60 + Math.random() * 45,
        o: 1,
        vy: 12 + Math.random() * 15,
        rot: (Math.random() - 0.5) * 1.5,
        rs: (Math.random() - 0.5) * 0.05,
      });
    }

    const COUNT = Math.min(250, Math.floor((W * H) / 4500));
    const particles: any[] = [];

    let phase: "papers" | "tearing" | "confetti" | "done" = "papers";
    let elapsedTotal = 0;
    let tearTimer = 0;
    lastFrameRef.current = performance.now();

    function burstConfetti() {
      for (let i = 0; i < COUNT; i++) {
        const startX = W / 2 + (Math.random() - 0.5) * W * 1.2;
        const startY = H * 0.2 + (Math.random() - 0.5) * H * 0.8;
        particles.push({
          x: startX, y: startY,
          w: 6 + Math.random() * 12, h: 8 + Math.random() * 16,
          rot: Math.random() * 6.28,
          rs: (Math.random() - 0.5) * 0.15,
          vx: (Math.random() - 0.5) * 12, 
          vy: -(4 + Math.random() * 8), 
          g: 0.1 + Math.random() * 0.1,
          o: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          sway: 15 + Math.random() * 30,
          swaySpd: 0.02 + Math.random() * 0.03,
          swayOff: Math.random() * 6.28,
        });
      }
    }

    const animate = (now: number) => {
      const delta = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      elapsedTotal += delta;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      if (phase === "papers") {
        let allPastMiddle = true;
        for (const p of papers) {
          p.y += p.vy;
          p.rot += p.rs;
          if (p.y < H * 0.4) allPastMiddle = false;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = "#fafafa";
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 1;
          ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.strokeStyle = "#cbd5e1";
          for (let l = -p.h / 2 + 10; l < p.h / 2 - 5; l += 8) {
            ctx.beginPath(); ctx.moveTo(-p.w / 2 + 8, l); ctx.lineTo(p.w / 2 - 8, l); ctx.stroke();
          }
          ctx.restore();
        }
        
        if (elapsedTotal > 1.0 || allPastMiddle) { 
          phase = "tearing"; 
          tearTimer = 0; 
        }
      }

      if (phase === "tearing") {
        tearTimer += delta;
        for (const p of papers) {
          p.y += p.vy * 0.5;
          p.o = Math.max(0, 1 - tearTimer * 4);
          ctx.save();
          ctx.globalAlpha = p.o;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = "#f8fafc";
          ctx.beginPath();
          ctx.moveTo(-p.w / 2, -p.h / 2);
          ctx.lineTo(0, -p.h / 2 + 15);
          ctx.lineTo(p.w / 2, -p.h / 2);
          ctx.lineTo(p.w / 2, p.h / 2);
          ctx.lineTo(-p.w / 2, p.h / 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        
        if (tearTimer > 0.1 && particles.length === 0) burstConfetti();
        if (tearTimer > 0.3) phase = "confetti";
      }

      if (phase === "confetti" || phase === "tearing") {
        let alive = 0;
        for (const p of particles) {
          if (p.o <= 0 || p.y > H + 50) continue;
          p.vy += p.g;
          p.x += p.vx + Math.sin(elapsedTotal * p.swaySpd * 50 + p.swayOff) * 0.6;
          p.y += p.vy;
          p.rot += p.rs;
          p.vx *= 0.98;

          if (elapsedTotal > 4.5) p.o -= 0.01; 

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.max(0, p.o);
          const scaleY = Math.abs(Math.cos(p.rot * 1.5));
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, (-p.h / 2) * scaleY, p.w, p.h * Math.max(0.2, scaleY));
          ctx.restore();
          alive++;
        }
        if (elapsedTotal > 6.0 || alive === 0) phase = "done";
      }

      if (phase === "done") {
        onComplete();
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-10" />;
}

/* ═══════════════════════════════════════════════════════════
   INTRO OVERLAY COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function IntroOverlay({ title, subtitle }: { title: string, subtitle: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const [canvasDone, setCanvasDone] = useState(false);
  const [show, setShow] = useState(true);

  // 1. Initial fade-in of the text using GSAP
  useEffect(() => {
    if (textRef.current) gsap.fromTo(textRef.current, { opacity: 0, scale: 0.92, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1, delay: 1, ease: "power3.out" });
    if (subRef.current) gsap.fromTo(subRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, delay: 1.8, ease: "power2.out" });
  }, []);

  // 2. Outro animation when canvas animations complete
  useEffect(() => {
    if (!canvasDone) return;
    const tl = gsap.timeline({ onComplete: () => setShow(false) });
    tl.to(textRef.current, { opacity: 0, y: -30, duration: 0.4, ease: "power2.in" })
      .to(subRef.current, { opacity: 0, y: -15, duration: 0.25 }, "<0.05")
      .to(overlayRef.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut", delay: 0.15 });
  }, [canvasDone]);

  if (!show) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <CinematicCanvas onComplete={() => setCanvasDone(true)} />
      <div className="relative z-20 text-center">
        <div ref={textRef} className="opacity-0">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900" dangerouslySetInnerHTML={{ __html: title }} />
        </div>
        <div ref={subRef} className="opacity-0 mt-3">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
