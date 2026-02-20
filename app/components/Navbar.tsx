"use client";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(1.8)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent",
      }}
    >
      <nav className="flex items-center justify-between px-8 py-4" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <a href="#" className="flex items-center gap-2">
          <img src="/logo.png" alt="Sarthi Logo" className="h-8 w-auto" />
          <span className="text-[21px] font-semibold tracking-tight" style={{ color: "#0a0a0a" }}>sarthi</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {["PLATFORM", "FEATURES", "DEVELOPERS", "ABOUT"].map((item) => (
            <button
              key={item}
              className="flex items-center gap-0.5 text-[12.5px] font-medium transition-colors"
              style={{ color: "#7a7268", letterSpacing: "0.04em" }}
            >
              {item}
              <span className="text-[9px] ml-0.5" style={{ color: "#b0a89e" }}>›</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="px-5 py-2 rounded-full text-[13px] font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: "#0a0a0a" }}
          >
            Experience Sarthi
          </button>
          <button
            className="px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
            style={{ border: "1px solid #e0d8d0", color: "#3d3530", background: "#fff" }}
          >
            Talk to Us
          </button>
        </div>
      </nav>
    </header>
  );
}
