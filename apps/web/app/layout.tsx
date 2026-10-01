import "./globals.css";
import { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "NeuroForge AI — Autonomous AI Research & Experimentation Lab",
  description: "Hypothesize → Experiment → Train → Evaluate → Improve. Production-grade autonomous AI research operating system powered by Nebius Cloud and NVIDIA GPUs.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080B10] text-[#F3F4F6] min-h-screen antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
