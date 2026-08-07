import "./globals.css";

export const metadata = {
  title: "PADO — Placement Assessment & Development Orchestrator",
  description:
    "An AI-powered placement coach powered by local LLMs and XGBoost. Get a personalized study roadmap, adaptive mock interviews, and weekly placement analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF8F5] text-[#1e1e1a] antialiased">{children}</body>
    </html>
  );
}
