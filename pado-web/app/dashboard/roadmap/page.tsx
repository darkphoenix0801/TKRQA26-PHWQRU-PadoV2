"use client";
import { useUser } from "@/components/UserContext";
import RoadmapSection from "@/components/RoadmapSection";

export default function RoadmapPage() {
  const user = useUser();
  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <RoadmapSection user={user} />
    </div>
  );
}
