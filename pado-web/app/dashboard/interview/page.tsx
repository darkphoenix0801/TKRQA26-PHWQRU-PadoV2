"use client";
import { useUser } from "@/components/UserContext";
import InterviewSection from "@/components/InterviewSection";

export default function InterviewPage() {
  const user = useUser();
  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <InterviewSection user={user} />
    </div>
  );
}
