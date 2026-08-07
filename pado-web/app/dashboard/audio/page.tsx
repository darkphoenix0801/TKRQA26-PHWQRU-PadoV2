"use client";
import { useUser } from "@/components/UserContext";
import AudioSection from "@/components/AudioSection";

export default function AudioPage() {
  const user = useUser();
  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <AudioSection user={user} />
    </div>
  );
}
