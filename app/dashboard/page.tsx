import Link from "next/link";
import { MOCK_USER } from "@/lib/mockUser";

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Welcome back</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          {MOCK_USER.name}
        </h1>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <Link href="/dashboard/upload">
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-[#fff7ed] flex items-center justify-center mb-4 group-hover:bg-[#e97316] transition-colors">
              <svg width="20" height="20" fill="none" stroke="#e97316" strokeWidth="1.8" viewBox="0 0 24 24" className="group-hover:stroke-white transition-colors">
                <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-[#0a0a0a] mb-1">Upload Dataset</h2>
            <p className="text-[13px] text-[#9ca3af]">Upload a CSV and start analysis</p>
          </div>
        </Link>

        <Link href="/dashboard/datasets">
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center mb-4 group-hover:bg-[#6366f1] transition-colors">
              <svg width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="1.8" viewBox="0 0 24 24" className="group-hover:stroke-white transition-colors">
                <ellipse cx="12" cy="6" rx="8" ry="3" />
                <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
                <path d="M4 14v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-[#0a0a0a] mb-1">My Datasets</h2>
            <p className="text-[13px] text-[#9ca3af]">View and manage your uploaded data</p>
          </div>
        </Link>

        <Link href="/dashboard/reports">
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center mb-4 group-hover:bg-[#22c55e] transition-colors">
              <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="1.8" viewBox="0 0 24 24" className="group-hover:stroke-white transition-colors">
                <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-[#0a0a0a] mb-1">Reports</h2>
            <p className="text-[13px] text-[#9ca3af]">View certified AI reports</p>
          </div>
        </Link>
      </div>

      {/* Phase status banner */}
      <div
        className="rounded-2xl border border-[#e0e7ff] p-6"
        style={{ background: "linear-gradient(135deg,#f0f3ff 0%,#fff7ed 100%)" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-2 h-2 rounded-full bg-[#6366f1] mt-2 shrink-0" />
          <div>
            <h3 className="text-[14px] font-semibold text-[#0a0a0a] mb-1">Phase 1 — Core Infrastructure</h3>
            <p className="text-[13px] text-[#6b7280] leading-relaxed">
              MongoDB connection, CSV upload, and dataset parsing are live.{" "}
              <strong>Phase 2</strong> (Analytics Engine) is next —{" "}
              statistical analysis, anomaly detection, and forecasting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
