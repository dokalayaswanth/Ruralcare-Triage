import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/shared/navbar";

export const metadata: Metadata = {
  title: "RuralCare Triage",
  description: "AI-powered rural healthcare triage assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}