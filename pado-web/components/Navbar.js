"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar({ activeTab, setActiveTab }) {
  const navRef = useRef(null);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read user from localStorage
    const storedUser = localStorage.getItem("pado_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("pado_user");
      }
    }

    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("pado_user");
    setUser(null);
    window.location.href = "/";
  };

  if (!mounted) {
    return (
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-xl border-b border-gray-100 transition-all">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">P</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            PADO
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-xl border-b border-gray-100 transition-all"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-tight">P</span>
        </div>
        <span className="text-sm font-semibold tracking-tight text-gray-900">
          PADO
        </span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {!user && (
          <Link
            href="/#how-it-works"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >
            How it works
          </Link>
        )}
        {user && typeof setActiveTab === "function" ? (
          <div className="flex items-center gap-6">
            {["Register", "Interview", "Analytics", "Audio"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition-all duration-200 ${
                  activeTab === tab 
                    ? "text-gray-900 border-b-2 border-gray-900 pb-1" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
            <span className="text-sm text-gray-300 ml-2">|</span>
            <span className="text-sm text-gray-500">Hi, {user.name}</span>
          </div>
        ) : user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-900 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <span className="text-sm text-gray-300">|</span>
            <span className="text-sm text-gray-500">Hi, {user.name}</span>
          </>
        ) : null}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-4">
        {!user && (
          <>
            <Link
              href="/auth"
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth"
              className="text-sm font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-md shadow-gray-200"
            >
              Sign up
            </Link>
          </>
        )}
        {user && (
          <button
            onClick={handleSignOut}
            className="text-sm font-medium bg-gray-100 text-gray-700 px-5 py-2 rounded-full hover:bg-gray-200 transition-all duration-200"
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
