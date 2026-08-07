"use client";
import { useUser } from "@/components/UserContext";
import { useRouter } from "next/navigation";
import { LogOut, User, Mail, Briefcase, KeyRound } from "lucide-react";

export default function AccountPage() {
  const user = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("pado_user");
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-16 w-full">
      <div className="mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-4">Settings</p>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900" style={{ letterSpacing: "-0.03em" }}>
          Account Details
        </h2>
        <p className="text-base text-gray-400 mt-4">
          Manage your credentials and active session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="glass-tile p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="text-gray-400" size={20} />
              Profile Information
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Full Name
                </label>
                <div className="text-gray-900 font-medium text-lg">
                  {user?.name || "Not provided"}
                </div>
              </div>

              <div className="w-full h-px bg-gray-200/50" />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  User ID / Student ID
                </label>
                <div className="flex items-center gap-2 text-gray-900 font-mono text-sm bg-white/70 px-3 py-2 rounded-lg w-fit border border-gray-200/50">
                  <KeyRound size={14} className="text-gray-400" />
                  {user?.student_id || "guest"}
                </div>
              </div>

              <div className="w-full h-px bg-gray-200/50" />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Virtual ID
                </label>
                <div className="flex items-center gap-2 text-gray-950 font-mono text-sm bg-white/70 px-3 py-2 rounded-lg w-fit border border-gray-200/50">
                  {user?.virtual_id || "N/A"}
                </div>
              </div>

              <div className="w-full h-px bg-gray-200/50" />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Target Company
                </label>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Briefcase size={16} className="text-gray-400" />
                  {user?.target_company || "General"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="space-y-6">
          <div className="glass-tile p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600 border-4 border-white shadow-sm mb-4">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{user?.name || "Student"}</h4>
            <p className="text-xs uppercase font-bold tracking-wider text-indigo-600 mb-2">{user?.role || "student"}</p>
            <p className="text-xs text-gray-400 mb-8">ID: {user?.student_id || "guest"}</p>

            <button
              onClick={handleSignOut}
              className="w-full py-3.5 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 hover:text-red-700 transition-colors flex items-center justify-center gap-2 group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
