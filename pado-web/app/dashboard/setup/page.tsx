"use client";
import { useUser } from "@/components/UserContext";
import RegisterSection from "@/components/RegisterSection";

export default function SetupPage() {
  const user = useUser();
  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <RegisterSection user={user} />
    </div>
  );
}
