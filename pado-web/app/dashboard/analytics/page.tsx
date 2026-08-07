"use client";
import { useUser } from "@/components/UserContext";
import AnalyticsSection from "@/components/AnalyticsSection";

export default function AnalyticsPage() {
  const user = useUser();
  return (
    <div className="max-w-5xl mx-auto px-8 py-16">
      <AnalyticsSection user={user} />
    </div>
  );
}
