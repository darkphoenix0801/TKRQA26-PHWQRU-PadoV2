"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    name: "",
    password: "",
    virtual_id: "",
    role: "student",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id || !form.password) return;
    
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/student/login" : "/student/register";
      
      const payload = isLogin 
        ? { student_id: form.student_id, password: form.password, virtual_id: form.virtual_id || null }
        : { 
            student_id: form.student_id, 
            name: form.name || "User",
            password: form.password,
            virtual_id: form.virtual_id || null,
            role: form.role,
            resume_text: "N/A",
            cgpa: 0,
            target_company: "Any"
          };

      let res;
      try {
        res = await fetch(`/api${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        throw new Error("Unable to connect to the server. Please ensure the backend is running.");
      }

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          throw new Error(`Server returned an error (${res.status}). Ensure the backend is running properly.`);
        }
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await res.json();
      
      localStorage.setItem(
        "pado_user",
        JSON.stringify({
          student_id: data.student_id || form.student_id,
          name: data.name || form.name || "User",
          role: data.role || form.role || "student",
          virtual_id: data.virtual_id || form.virtual_id || "",
        })
      );
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#faf8f5]">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="w-full max-w-sm glass-tile p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isLogin
                ? "Enter your User ID and credentials"
                : "Enter your details to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                User ID
              </label>
              <input
                required
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                placeholder="charan_01"
                value={form.student_id}
                onChange={(e) =>
                  setForm({ ...form, student_id: e.target.value })
                }
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Full Name
                  </label>
                  <input
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    placeholder="Charan Teja"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Account Role
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="student">Student (User)</option>
                    <option value="manager">Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Password
              </label>
              <input
                required
                type="password"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Virtual ID <span className="text-gray-300 font-normal">(Optional key)</span>
              </label>
              <input
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200/50 rounded-xl bg-white/75 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                placeholder="VIRTUAL-KEY-999"
                value={form.virtual_id}
                onChange={(e) =>
                  setForm({ ...form, virtual_id: e.target.value })
                }
              />
            </div>

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {isLogin ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-gray-500 hover:text-gray-900 font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
