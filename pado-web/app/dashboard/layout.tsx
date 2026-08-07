"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/components/UserContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("pado_user");
    if (!stored) {
      router.push("/auth");
    } else {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("pado_user");
        router.push("/auth");
      }
    }
  }, [router]);

  if (!mounted || !user) return null;

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-[#faf8f5] font-sans text-gray-900 relative">
        <Sidebar user={user} activePath={pathname} />
        <main className="flex-1 min-h-screen bg-[#faf8f5] pl-[80px]">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
