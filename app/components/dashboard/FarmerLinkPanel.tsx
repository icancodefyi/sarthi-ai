"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { LinkedFarmer, AIReport } from "@/types";
import { useSTT } from "@/app/hooks/useSTT";
import { useTTS } from "@/app/hooks/useTTS";

// ─── Local interfaces ──────────────────────────────────────────────────────────

interface Props {
  datasetId: string;
  linkedFarmer: LinkedFarmer | null | undefined;
  onLinked: (farmer: LinkedFarmer) => void;
  onUnlinked: () => void;
  onAnalysisComplete?: (report: AIReport) => void;
}

interface WeatherCurrent {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  cloudCover: number;
  condition: string;
}

interface WeatherDaily {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  condition: string;
}

interface CropAdvisory {
  crop: string;
  status: "Good" | "Caution" | "Critical";
  advice: string;
}

interface MarketOutlook {
  crop: string;
  priceOutlook: "Bullish" | "Neutral" | "Bearish";
  reason: string;
}

interface GovtScheme {
  schemeName: string;
  benefit: string;
  howToApply: string;
}

interface FarmerInsights {
  overallRisk: "Low" | "Medium" | "High";
  riskReason: string;
  cropAdvisory: CropAdvisory[];
  irrigationAdvice: string;
  weatherAlerts: string[];
  marketOutlook: MarketOutlook[];
  govtSchemes: GovtScheme[];
  immediateActions: string[];
  seasonalSummary: string;
}

interface Scheme {
  id: string;
  shortName: string;
  icon: string;
  benefitAmount: string;
  ministry: string;
  portal: string;
  docs: string[];
  eligible: boolean;
  reason: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAadhaar(val: string) {
  return val.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1-");
}

const WEATHER_ICONS: Record<string, string> = {
  "Clear sky": "☀️",
  "Partly cloudy": "⛅",
  Foggy: "🌫️",
  Rainy: "🌧️",
  "Rain showers": "🌦️",
  Thunderstorm: "⛈️",
  "Snow / Sleet": "🌨️",
};

function checkSchemes(farmer: LinkedFarmer): Scheme[] {
  const landHa = farmer.landAcres * 0.4047;
  const smallFarmer = landHa <= 2;
  const hasLand = farmer.landAcres > 0;
  const hasCrops = farmer.crops.length > 0;
  return [
    {
      id: "pmkisan",
      shortName: "PM-KISAN",
      icon: "🌾",
      benefitAmount: "₹6,000/year",
      ministry: "Ministry of Agriculture & Farmers Welfare",
      portal: "https://pmkisan.gov.in",
      docs: ["Aadhaar Card", "Land Records (Khatauni/RoR)", "Bank account with IFSC", "Mobile number"],
      eligible: hasLand,
      reason: hasLand
        ? `Owns ${farmer.landAcres} acres (${landHa.toFixed(2)} ha) — qualifies for direct income support`
        : "Must own cultivable agricultural land",
    },
    {
      id: "pmfby",
      shortName: "PMFBY",
      icon: "🛡️",
      benefitAmount: "Full sum insured on crop loss",
      ministry: "Ministry of Agriculture & Farmers Welfare",
      portal: "https://pmfby.gov.in",
      docs: ["Aadhaar Card", "Bank passbook", "Land Records", "Sowing Certificate"],
      eligible: hasCrops && hasLand,
      reason: hasCrops && hasLand
        ? `Grows ${farmer.crops.join(", ")} on ${farmer.landAcres} acres — eligible for coverage`
        : "Must have land with notified crops to enrol",
    },
    {
      id: "kcc",
      shortName: "KCC",
      icon: "💳",
      benefitAmount: `Up to ₹${Math.min(300000, Math.round(farmer.landAcres * 40000)).toLocaleString("en-IN")} @ 4% p.a.`,
      ministry: "Ministry of Finance / NABARD",
      portal: "https://www.nabard.org/content1.aspx?id=569",
      docs: ["Aadhaar Card", "Land Records", "Passport-size photo", "Bank account"],
      eligible: hasLand,
      reason: hasLand
        ? `Owns ${farmer.landAcres} acres — eligible for KCC up to ₹${Math.min(300000, Math.round(farmer.landAcres * 40000)).toLocaleString("en-IN")} estimated`
        : "Requires ownership or tenancy of agricultural land",
    },
    {
      id: "shc",
      shortName: "Soil Health Card",
      icon: "🧪",
      benefitAmount: "Free (₹0 cost to farmer)",
      ministry: "Ministry of Agriculture & Farmers Welfare",
      portal: "https://soilhealth.dac.gov.in",
      docs: ["Aadhaar Card", "Land survey number"],
      eligible: true,
      reason: "All farmers with agricultural land are eligible — no income or size restriction",
    },
    {
      id: "enam",
      shortName: "e-NAM",
      icon: "📲",
      benefitAmount: "Better price discovery + reduced middlemen",
      ministry: "Ministry of Agriculture & Farmers Welfare",
      portal: "https://enam.gov.in",
      docs: ["Aadhaar Card", "Bank account with IFSC", "Produce quality certificate"],
      eligible: hasCrops,
      reason: hasCrops
        ? `Grows ${farmer.crops.join(", ")} — can list produce on e-NAM for ${farmer.district} mandi`
        : "Must have agricultural produce to list",
    },
    {
      id: "nrega",
      shortName: "MGNREGS",
      icon: "🏗️",
      benefitAmount: "₹220–₹374/day (state-wise, 100 days guaranteed)",
      ministry: "Ministry of Rural Development",
      portal: "https://nrega.nic.in",
      docs: ["Aadhaar Card", "Job Card (from Gram Panchayat)", "Bank/PO account"],
      eligible: smallFarmer,
      reason: smallFarmer
        ? `Small/marginal farmer (${landHa.toFixed(2)} ha) — qualifies for guaranteed employment`
        : `Landholding ${landHa.toFixed(2)} ha — may still qualify; confirm with local Panchayat`,
    },
  ];
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#f97316" : "#dc2626";
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className="shrink-0">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#f0ece6" strokeWidth="5" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" transform="rotate(-90 30 30)" />
      <text x="30" y="35" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{score}</text>
    </svg>
  );
}

// ─── Spinner SVG ──────────────────────────────────────────────────────────────

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FarmerLinkPanel({
  datasetId,
  linkedFarmer,
  onLinked,
  onUnlinked,
  onAnalysisComplete,
}: Props) {
  // Link / analysis state
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [linking, setLinking] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Weather
  const [weather, setWeather] = useState<{ current: WeatherCurrent; daily: WeatherDaily[] } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // Farm insights
  const [insights, setInsights] = useState<FarmerInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Voice advisory
  const [voiceLang, setVoiceLang] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [voiceQuestion, setVoiceQuestion] = useState("");
  const [voiceAnswer, setVoiceAnswer] = useState("");
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);

  const { speak, stop: stopTTS, speaking } = useTTS();

  const handleSTTResult = useCallback((transcript: string) => {
    setSttError(null);
    setVoiceQuestion(transcript);
    setTimeout(() => handleVoiceAdvisoryRef.current(transcript), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSTTError = useCallback((err: string) => {
    setSttError(
      err.toLowerCase().includes("network")
        ? "Mic couldn't reach speech servers. Type your question instead."
        : err,
    );
  }, []);

  const { state: sttState, start: startSTT, stop: stopSTT, isSupported: sttSupported } = useSTT({
    lang: voiceLang,
    onResult: handleSTTResult,
    onError: handleSTTError,
  });

  const handleVoiceAdvisoryRef = useRef<(q?: string) => void>(() => {});

  // ── Auto-fetch weather when a farmer is already linked on mount ─────────────
  useEffect(() => {
    if (linkedFarmer && !weather) fetchWeather(linkedFarmer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedFarmer]);

  // ── API helpers ─────────────────────────────────────────────────────────────

  async function fetchWeather(farmer: LinkedFarmer) {
    if (!farmer.lat || !farmer.lon) return;
    setWeatherLoading(true);
    try {
      const res = await fetch(`/api/farmer/weather?lat=${farmer.lat}&lon=${farmer.lon}`);
      if (res.ok) setWeather(await res.json());
    } catch { /* non-blocking */ }
    finally { setWeatherLoading(false); }
  }

  async function handleLink() {
    const digits = aadhaarInput.replace(/\D/g, "");
    if (digits.length !== 12) { setError("Enter a valid 12-digit Aadhaar number."); return; }
    setError(null);
    setLinking(true);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/link-farmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: digits }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Link failed");
      onLinked(json.farmer);
      setAadhaarInput("");
      setAnalysed(false);
      setAiReport(null);
      setInsights(null);
      setVoiceAnswer("");
      setWeather(null);
      fetchWeather(json.farmer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink() {
    setLinking(true);
    await fetch(`/api/datasets/${datasetId}/link-farmer`, { method: "DELETE" });
    setLinking(false);
    setAnalysed(false);
    setAiReport(null);
    setWeather(null);
    setInsights(null);
    setVoiceAnswer("");
    setVoiceQuestion("");
    onUnlinked();
  }

  async function handleRunAnalysis() {
    setAnalysing(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/interpret`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setAnalysed(true);
      setAiReport(json.aiReport ?? null);
      if (json.aiReport && onAnalysisComplete) onAnalysisComplete(json.aiReport);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalysing(false);
    }
  }

  async function handleGenerateInsights() {
    if (!linkedFarmer || !weather) return;
    setInsightsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/farmer/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmer: linkedFarmer, weather }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Insights generation failed");
      setInsights(json.insights);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleVoiceAdvisory(q?: string) {
    const question = q ?? voiceQuestion;
    if (!question.trim() || !linkedFarmer) return;
    setVoiceLoading(true);
    setVoiceError(null);
    setSttError(null);
    stopTTS();
    try {
      const res = await fetch("/api/farmer/voice-advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, farmer: linkedFarmer, weather: weather?.current ?? null, lang: voiceLang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Advisory failed");
      setVoiceAnswer(json.answer);
      speak(json.answer, voiceLang);
    } catch (err: unknown) {
      setVoiceError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setVoiceLoading(false);
    }
  }
  handleVoiceAdvisoryRef.current = handleVoiceAdvisory;

  // ── Color maps ───────────────────────────────────────────────────────────────

  const riskColor = {
    Low: "text-green-700 bg-green-50 border-green-200",
    Medium: "text-amber-700 bg-amber-50 border-amber-200",
    High: "text-red-700 bg-red-50 border-red-200",
  };
  const statusColor = {
    Good: "bg-green-100 text-green-700",
    Caution: "bg-amber-100 text-amber-700",
    Critical: "bg-red-100 text-red-700",
  };
  const outlookColor = {
    Bullish: "text-green-700",
    Neutral: "text-[#6b7280]",
    Bearish: "text-red-600",
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-5 mb-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[22px]">🌾</span>
        <div>
          <p className="text-[13px] font-semibold text-[#92400e]">Kisan AI — Agricultural Dataset</p>
          <p className="text-[12px] text-[#c2410c]">
            Link a farmer profile to enrich AI interpretation with real crop, soil &amp; live weather context
          </p>
        </div>
      </div>

      {linkedFarmer ? (
        <div className="flex flex-col gap-4">

          {/* ── Farmer card ── */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#fed7aa]">
            <div className="flex items-center gap-3">
              <span className="text-[22px]">🧑‍🌾</span>
              <div>
                <p className="text-[13.5px] font-semibold text-[#0a0a0a]">{linkedFarmer.name}</p>
                <p className="text-[12px] text-[#6b7280]">
                  {linkedFarmer.village}, {linkedFarmer.district}, {linkedFarmer.state}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-[11.5px] text-[#9ca3af]">
                  <span>🌱 {linkedFarmer.crops.join(", ")}</span>
                  <span>📐 {linkedFarmer.landAcres} acres</span>
                  <span>🪨 {linkedFarmer.soilType}</span>
                  <span>💧 {linkedFarmer.irrigationType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {analysed && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                  ✓ Analysis done
                </span>
              )}
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Linked</span>
              <button
                onClick={handleUnlink}
                disabled={linking || analysing}
                className="text-[12px] text-[#9ca3af] hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Unlink
              </button>
            </div>
          </div>

          {/* ── Weather ── */}
          {weatherLoading && (
            <div className="flex items-center gap-2 text-[12px] text-[#c2410c]">
              <Spinner className="w-3 h-3" /> Fetching live weather…
            </div>
          )}

          {weather && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Current conditions */}
              <div className="bg-white border border-[#fed7aa] rounded-xl p-4">
                <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide mb-3">
                  Now · {linkedFarmer.district}
                </p>
                <div className="text-[32px] mb-1">{WEATHER_ICONS[weather.current.condition] ?? "🌡️"}</div>
                <p className="text-[26px] font-bold text-[#0a0a0a]">{weather.current.temperature}°C</p>
                <p className="text-[12px] text-[#6b7280]">{weather.current.condition}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    ["Humidity", `${weather.current.humidity}%`],
                    ["Wind", `${weather.current.windSpeed} km/h`],
                    ["Rain", `${weather.current.precipitation}mm`],
                    ["Cloud", `${weather.current.cloudCover}%`],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-[#fafaf9] rounded-lg px-2 py-1.5">
                      <p className="text-[10px] text-[#9ca3af]">{l}</p>
                      <p className="text-[12px] font-semibold text-[#0a0a0a]">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* 7-day forecast */}
              <div className="bg-white border border-[#fed7aa] rounded-xl p-4 md:col-span-2">
                <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide mb-3">7-Day Forecast</p>
                <div className="space-y-2">
                  {weather.daily.slice(0, 7).map((d) => (
                    <div key={d.date} className="flex items-center gap-3 text-[12.5px]">
                      <span className="w-20 text-[#9ca3af] shrink-0">
                        {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                      <span className="text-[16px]">{WEATHER_ICONS[d.condition] ?? "🌡️"}</span>
                      <span className="font-medium text-[#0a0a0a] w-24 shrink-0">{d.maxTemp}° / {d.minTemp}°</span>
                      <div className="flex-1 bg-[#f5f5f4] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-400"
                          style={{ width: `${Math.min(100, (d.precipitation / 20) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[#6b7280] w-14 text-right shrink-0">{d.precipitation}mm</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PM Scheme Eligibility ── */}
          <div className="bg-white border border-[#fed7aa] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[18px]">🏛️</span>
              <div>
                <p className="text-[13px] font-semibold text-[#0a0a0a]">PM Scheme Eligibility</p>
                <p className="text-[11.5px] text-[#9ca3af]">Auto-checked against {linkedFarmer.name}&apos;s profile</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {checkSchemes(linkedFarmer).map((scheme) => (
                <div
                  key={scheme.id}
                  className="rounded-xl border p-3.5 flex flex-col gap-2"
                  style={{ borderColor: scheme.eligible ? "#bbf7d0" : "#fee2e2", background: scheme.eligible ? "#f0fdf4" : "#fff5f5" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">{scheme.icon}</span>
                      <div>
                        <p className="text-[12.5px] font-semibold text-[#0a0a0a] leading-snug">{scheme.shortName}</p>
                        <p className="text-[10.5px] text-[#9ca3af]">{scheme.ministry}</p>
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: scheme.eligible ? "#dcfce7" : "#fee2e2", color: scheme.eligible ? "#15803d" : "#dc2626" }}
                    >
                      {scheme.eligible ? "✓ ELIGIBLE" : "✗ INELIGIBLE"}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11.5px] font-semibold text-[#374151]">{scheme.benefitAmount}</p>
                    <p className="text-[11px] text-[#6b7280] leading-snug mt-0.5">{scheme.reason}</p>
                  </div>
                  {scheme.eligible && (
                    <div className="mt-1 pt-2 border-t border-dashed" style={{ borderColor: "#bbf7d0" }}>
                      <p className="text-[10px] text-[#9ca3af] mb-1">Documents needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {scheme.docs.map((d) => (
                          <span key={d} className="text-[10px] bg-white border border-[#d1fae5] text-[#065f46] px-1.5 py-0.5 rounded">
                            {d}
                          </span>
                        ))}
                      </div>
                      <a
                        href={scheme.portal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-green-700 hover:text-green-900 transition-colors"
                      >
                        Apply at {new URL(scheme.portal).hostname}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Voice Advisory ── */}
          <div className="bg-white border border-[#fed7aa] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🎙️</span>
                <div>
                  <p className="text-[13px] font-semibold text-[#0a0a0a]">Voice Advisory</p>
                  <p className="text-[11.5px] text-[#9ca3af]">Speak your question — Sarthi answers in your language</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-[#f5f5f4] rounded-full p-0.5">
                {(["hi-IN", "en-IN"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setVoiceLang(l)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                    style={{ background: voiceLang === l ? "#0a0a0a" : "transparent", color: voiceLang === l ? "#fff" : "#6b7280" }}
                  >
                    {l === "hi-IN" ? "हिंदी" : "English"}
                  </button>
                ))}
              </div>
            </div>

            {/* Mic + input row */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setSttError(null); sttState === "listening" ? stopSTT() : startSTT(); }}
                disabled={voiceLoading}
                title={!sttSupported ? "Use Chrome/Edge for voice input" : sttState === "listening" ? "Stop listening" : "Speak your question"}
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                style={{
                  background: sttState === "listening" ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#ea580c,#f97316)",
                  boxShadow: sttState === "listening" ? "0 0 0 4px rgba(239,68,68,0.2)" : "none",
                }}
              >
                {sttState === "listening" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 18.5v3M8 21.5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                )}
              </button>
              <input
                type="text"
                value={voiceQuestion}
                onChange={(e) => setVoiceQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVoiceAdvisory()}
                placeholder={voiceLang === "hi-IN" ? "यहाँ टाइप करें या माइक दबाएँ…" : "Type or press mic to speak…"}
                className="flex-1 px-3 py-2 rounded-xl border border-[#e5e7eb] text-[13px] focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/10"
              />
              <button
                onClick={() => handleVoiceAdvisory()}
                disabled={!voiceQuestion.trim() || voiceLoading}
                className="shrink-0 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
              >
                {voiceLoading
                  ? <Spinner />
                  : "Ask"
                }
              </button>
            </div>

            {sttState === "listening" && (
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
                </span>
                <span className="text-[12px] text-red-600 font-medium">Listening… speak now</span>
              </div>
            )}
            {sttError && (
              <p className="text-[11.5px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mb-1">
                🎤 {sttError}
              </p>
            )}

            {/* Suggested questions */}
            {!voiceAnswer && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(voiceLang === "hi-IN"
                  ? ["मेरी फसल में कीड़े क्यों लग रहे हैं?", "अभी सिंचाई करें या नहीं?", "PM-KISAN के लिए कैसे अप्लाई करें?"]
                  : ["When should I irrigate?", "Is my soil suitable for wheat?", "How to apply for PM-KISAN?"]
                ).map((q) => (
                  <button
                    key={q}
                    onClick={() => { setVoiceQuestion(q); handleVoiceAdvisory(q); }}
                    className="text-[11px] px-2.5 py-1 bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] rounded-full hover:bg-[#ffedd5] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Answer */}
            {voiceAnswer && (
              <div className="mt-3 bg-[#f0fdf4] border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">Sarthi Advisory</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speaking ? stopTTS() : speak(voiceAnswer, voiceLang)}
                      className="flex items-center gap-1 text-[11px] font-medium text-green-700 hover:text-green-900"
                    >
                      {speaking ? (
                        <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg> Stop</>
                      ) : (
                        <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                        </svg> Speak</>
                      )}
                    </button>
                    <button
                      onClick={() => { setVoiceAnswer(""); setVoiceQuestion(""); }}
                      className="text-[11px] text-[#9ca3af] hover:text-[#6b7280]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <p className="text-[13.5px] text-[#065f46] leading-relaxed">{voiceAnswer}</p>
              </div>
            )}
            {voiceError && (
              <p className="mt-2 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">⚠ {voiceError}</p>
            )}
          </div>

          {/* ── Kisan AI Dataset Analysis ── */}
          {!analysed ? (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#7c2d12]">Run Kisan AI Analysis</p>
                <p className="text-[12px] text-[#c2410c] mt-0.5">
                  AI insights enriched with {linkedFarmer.name}&apos;s crop profile + live weather at {linkedFarmer.village}
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                disabled={analysing}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
              >
                {analysing ? <><Spinner /> Analysing…</> : <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  Run Kisan Analysis
                </>}
              </button>
            </div>
          ) : aiReport ? (
            <div className="flex flex-col gap-4 mt-1">
              {/* Completed bar */}
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[12.5px] font-semibold text-green-800">
                    Kisan AI Analysis complete — enriched with {linkedFarmer.name}&apos;s crop &amp; weather context
                  </p>
                </div>
                <button
                  onClick={() => { setAnalysed(false); setAiReport(null); }}
                  className="text-[11.5px] text-green-600 hover:text-green-800 transition-colors font-medium shrink-0"
                >
                  Re-run
                </button>
              </div>

              {/* Confidence + summary */}
              <div className="flex items-center gap-4 bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                <ScoreRing score={aiReport.confidenceScore} />
                <div>
                  <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mb-0.5">AI Confidence Score</p>
                  <p className="text-[13px] text-[#3d3530] leading-relaxed">{aiReport.executiveSummary}</p>
                </div>
              </div>

              {/* Insight Highlights */}
              {aiReport.insightHighlights.length > 0 && (
                <div className="bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#f97316] uppercase tracking-wider mb-3">🔍 Insight Highlights</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiReport.insightHighlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0" />
                        <span className="text-[13px] text-[#4a4540] leading-relaxed">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomaly Explanations */}
              {aiReport.anomalyExplanations.length > 0 && (
                <div className="bg-white border border-[#fecaca] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-3">⚠ Anomaly Explanations</p>
                  <div className="flex flex-col gap-2">
                    {aiReport.anomalyExplanations.map((a, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        <span className="text-[13px] text-[#4a4540] leading-relaxed">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk + Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#d97706] uppercase tracking-wider mb-2">📊 Risk Reasoning</p>
                  <p className="text-[13px] text-[#4a4540] leading-relaxed">{aiReport.riskReasoning}</p>
                </div>
                <div className="bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#0ea5e9] uppercase tracking-wider mb-2">📈 Forecast Narrative</p>
                  <p className="text-[13px] text-[#4a4540] leading-relaxed">{aiReport.forecastNarrative}</p>
                </div>
              </div>

              {/* Contextual News */}
              {aiReport.contextualNews.length > 0 && (
                <div className="bg-white border border-[#e2e8f0] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-3">🌐 Possible External Factors</p>
                  <div className="flex flex-col gap-2">
                    {aiReport.contextualNews.map((n, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-[13px] text-[#4a4540] leading-relaxed">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certification */}
              <div className="flex items-start gap-3 bg-[#f0fdf4] border border-green-200 rounded-xl px-5 py-3">
                <svg width="15" height="15" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-[11px] font-semibold text-green-800 uppercase tracking-wider mb-0.5">Certification Note</p>
                  <p className="text-[13px] text-green-700 leading-relaxed">{aiReport.certificationReasoning}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── AI Farm Advisory (Full Insights) ── */}
          {!insights && weather && (
            <button
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            >
              {insightsLoading ? <><Spinner className="w-5 h-5" /> Analysing crops, weather &amp; market data…</> : "🤖 Generate Full Farm Advisory"}
            </button>
          )}

          {insights && (
            <div className="flex flex-col gap-4">
              {/* Seasonal Summary + Risk */}
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide">Seasonal Summary</p>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${riskColor[insights.overallRisk]}`}>
                    {insights.overallRisk} Risk
                  </span>
                </div>
                <p className="text-[14px] text-[#374151] leading-relaxed mb-2">{insights.seasonalSummary}</p>
                <p className="text-[13px] text-[#6b7280]">⚠️ {insights.riskReason}</p>
              </div>

              {/* Immediate Actions */}
              {insights.immediateActions?.length > 0 && (
                <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-5">
                  <p className="text-[12px] text-[#c2410c] uppercase tracking-wide font-semibold mb-3">Immediate Actions</p>
                  <ul className="space-y-2">
                    {insights.immediateActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13.5px] text-[#92400e]">
                        <span className="font-bold shrink-0">{i + 1}.</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weather Alerts */}
              {insights.weatherAlerts?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <p className="text-[12px] text-red-700 uppercase tracking-wide font-semibold mb-3">⛈️ Weather Alerts</p>
                  <ul className="space-y-1.5">
                    {insights.weatherAlerts.map((alert, i) => (
                      <li key={i} className="text-[13.5px] text-red-800">{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Crop Advisory */}
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
                <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-4">Crop Advisory</p>
                <div className="space-y-4">
                  {insights.cropAdvisory?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg ${statusColor[item.status]}`}>
                        {item.status}
                      </span>
                      <div>
                        <p className="text-[13.5px] font-semibold text-[#0a0a0a]">{item.crop}</p>
                        <p className="text-[13px] text-[#6b7280] leading-relaxed mt-0.5">{item.advice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Irrigation */}
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
                <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-2">💧 Irrigation Advisory</p>
                <p className="text-[14px] text-[#374151] leading-relaxed">{insights.irrigationAdvice}</p>
              </div>

              {/* Market Outlook */}
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
                <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-4">Market Price Outlook</p>
                <div className="space-y-3">
                  {insights.marketOutlook?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`shrink-0 text-[13px] font-bold ${outlookColor[item.priceOutlook]}`}>
                        {item.priceOutlook === "Bullish" ? "↑" : item.priceOutlook === "Bearish" ? "↓" : "→"} {item.priceOutlook}
                      </span>
                      <div>
                        <p className="text-[13.5px] font-semibold text-[#0a0a0a]">{item.crop}</p>
                        <p className="text-[13px] text-[#6b7280]">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Government Schemes (AI-suggested, distinct from eligibility grid above) */}
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
                <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-4">🏛️ Government Schemes for You</p>
                <div className="space-y-4">
                  {insights.govtSchemes?.map((scheme, i) => (
                    <div key={i} className="bg-[#fafaf9] rounded-xl p-4">
                      <p className="text-[13.5px] font-semibold text-[#0a0a0a] mb-1">{scheme.schemeName}</p>
                      <p className="text-[12.5px] text-[#374151] mb-1">
                        <span className="text-[#9ca3af]">Benefit:</span> {scheme.benefit}
                      </p>
                      <p className="text-[12.5px] text-[#374151]">
                        <span className="text-[#9ca3af]">How to apply:</span> {scheme.howToApply}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regenerate */}
              <div className="flex gap-3 pb-2">
                <button
                  onClick={handleGenerateInsights}
                  disabled={insightsLoading}
                  className="px-5 py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f9fafb] transition-colors disabled:opacity-50"
                >
                  ↻ Regenerate Insights
                </button>
                <button
                  onClick={() => setInsights(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] font-medium text-[#9ca3af] hover:bg-[#f9fafb] transition-colors"
                >
                  Collapse
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ── Unlinked — Aadhaar input ── */
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(formatAadhaar(e.target.value))}
              placeholder="Enter Aadhaar number (XXXX-XXXX-XXXX)"
              className="flex-1 px-3 py-2 rounded-xl border border-[#fed7aa] text-[13px] font-mono bg-white focus:outline-none focus:border-[#ea580c]"
            />
            <button
              onClick={handleLink}
              disabled={linking}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            >
              {linking ? "Linking…" : "Link Farmer"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#c2410c]">
            Demo: <span className="font-mono">1234-5678-9012</span> · <span className="font-mono">2345-6789-0123</span> · <span className="font-mono">3456-7890-1234</span>
          </p>
        </>
      )}

      {error && <p className="mt-2 text-[12px] text-red-600">⚠ {error}</p>}
    </div>
  );
}
