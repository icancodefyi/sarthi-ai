"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOCK_USER } from "@/lib/mockUser";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Upload",
    href: "/dashboard/upload",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Datasets",
    href: "/dashboard/datasets",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
        <path d="M4 14v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    label: "Kisan AI",
    href: "/dashboard/farmer",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 2C6 2 3 7 3 12c0 3 1.5 5.5 4 7" strokeLinecap="round" />
        <path d="M12 2c6 0 9 5 9 10 0 3-1.5 5.5-4 7" strokeLinecap="round" />
        <path d="M12 22v-6M9 19h6" strokeLinecap="round" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "Verify Document",
    href: "/dashboard/verify",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-white border-r border-[#f0ede8] flex flex-col"
      style={{ width: "220px", zIndex: 40 }}
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4 border-b border-[#f0ede8]">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-[20px] text-[#0a0a0a] tracking-tight"
            style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
          >
            Sarthi
          </span>
          <span
            className="text-[10px] font-semibold uppercase tracking-widest text-[#e97316] ml-0.5"
            style={{ letterSpacing: "0.14em" }}
          >
            AI
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                    isActive
                      ? "bg-[#fff7ed] text-[#e97316]"
                      : "text-[#4b5563] hover:bg-[#fafaf9] hover:text-[#0a0a0a]"
                  }`}
                >
                  <span className={isActive ? "text-[#e97316]" : "text-[#9ca3af]"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-[#f0ede8]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-400 to-orange-400 flex items-center justify-center text-white text-[12px] font-semibold">
            {MOCK_USER.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-[#0a0a0a] truncate">
              {MOCK_USER.name}
            </p>
            <p className="text-[11px] text-[#9ca3af] truncate">
              {MOCK_USER.planType} plan
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
