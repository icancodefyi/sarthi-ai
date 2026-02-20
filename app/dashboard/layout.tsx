import type { Metadata } from "next";
import Sidebar from "@/app/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard — Sarthi AI",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Sidebar />
      <main style={{ marginLeft: "220px" }}>
        {children}
      </main>
    </div>
  );
}
