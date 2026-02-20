"use client";

import { useState } from "react";

interface FarmerProfile {
  aadhaar: string;
  name: string;
  age: number;
  village: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  crops: string[];
  landAcres: number;
  soilType: string;
  irrigationType: string;
  annualIncomeINR: number;
  phone: string;
}

interface WeatherCurrent {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  cloudCover: number;
  condition: string;
  weatherCode: number;
}

interface WeatherDaily {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  evapotranspiration: number;
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

function formatAadhaar(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
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

export default function FarmerPortalPage() {
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [step, setStep] = useState<"input" | "loading" | "profile" | "generating" | "done">("input");
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [weather, setWeather] = useState<{ current: WeatherCurrent; daily: WeatherDaily[] } | null>(null);
  const [insights, setInsights] = useState<FarmerInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch() {
    const digits = aadhaarInput.replace(/\D/g, "");
    if (digits.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    setError(null);
    setStep("loading");

    try {
      // 1. Fetch farmer profile
      const farmerRes = await fetch(`/api/farmer/${digits}`);
      const farmerJson = await farmerRes.json();
      if (!farmerRes.ok) throw new Error(farmerJson.error ?? "Farmer not found");
      setFarmer(farmerJson.farmer);

      // 2. Fetch weather in parallel
      const weatherRes = await fetch(
        `/api/farmer/weather?lat=${farmerJson.farmer.lat}&lon=${farmerJson.farmer.lon}`
      );
      const weatherJson = await weatherRes.json();
      if (!weatherRes.ok) throw new Error("Failed to fetch weather");
      setWeather(weatherJson);

      setStep("profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("input");
    }
  }

  async function handleGenerateInsights() {
    if (!farmer || !weather) return;
    setStep("generating");
    setError(null);

    try {
      const res = await fetch("/api/farmer/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmer, weather }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Insights generation failed");
      setInsights(json.insights);
      setStep("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("profile");
    }
  }

  function reset() {
    setStep("input");
    setAadhaarInput("");
    setFarmer(null);
    setWeather(null);
    setInsights(null);
    setError(null);
  }

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

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Dashboard / Farmer Portal</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Kisan AI Advisory
        </h1>
        <p className="text-[14px] text-[#6b7280] mt-2">
          Enter Aadhaar to fetch farmer profile · Live weather · AI-powered crop & market advisory
        </p>
      </div>

      {/* Demo hint */}
      {step === "input" && (
        <div className="mb-6 bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-4 py-3">
          <p className="text-[12.5px] text-[#c2410c] font-medium mb-1">Demo Aadhaar numbers</p>
          <div className="flex flex-wrap gap-2">
            {["1234-5678-9012", "2345-6789-0123", "3456-7890-1234", "4567-8901-2345", "5678-9012-3456"].map((n) => (
              <button
                key={n}
                onClick={() => setAadhaarInput(n)}
                className="font-mono text-[12px] px-3 py-1 bg-white border border-[#fed7aa] rounded-lg text-[#c2410c] hover:bg-[#fff7ed] transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aadhaar Input */}
      {(step === "input" || step === "loading") && (
        <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
          <label className="block text-[12px] text-[#9ca3af] uppercase tracking-wide mb-3">
            Aadhaar Number
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(formatAadhaar(e.target.value))}
              placeholder="XXXX-XXXX-XXXX"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-[15px] font-mono tracking-wider text-[#0a0a0a] focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/10"
            />
            <button
              onClick={handleFetch}
              disabled={step === "loading"}
              className="px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            >
              {step === "loading" ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Fetching…
                </span>
              ) : (
                "Fetch Details"
              )}
            </button>
          </div>
          {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}
        </div>
      )}

      {/* Farmer Profile + Weather */}
      {farmer && weather && (step === "profile" || step === "generating" || step === "done") && (
        <>
          {/* Profile Card */}
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] flex items-center justify-center text-[22px]">
                  🧑‍🌾
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-[#0a0a0a]">{farmer.name}</p>
                  <p className="text-[13px] text-[#6b7280]">
                    {farmer.village}, {farmer.district}, {farmer.state} · Age {farmer.age}
                  </p>
                </div>
              </div>
              <button onClick={reset} className="text-[12px] text-[#9ca3af] hover:text-[#6b7280] underline">
                Change
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#f5f5f4]">
              {[
                { label: "Crops", value: farmer.crops.join(", ") },
                { label: "Land", value: `${farmer.landAcres} acres` },
                { label: "Soil", value: farmer.soilType },
                { label: "Irrigation", value: farmer.irrigationType },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide">{label}</p>
                  <p className="text-[13px] font-medium text-[#0a0a0a] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Current Weather */}
            <div className="bg-white border border-[#f0ede8] rounded-2xl p-5 col-span-1">
              <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide mb-3">
                Now · {farmer.district}
              </p>
              <div className="text-[36px] mb-1">
                {WEATHER_ICONS[weather.current.condition] ?? "🌡️"}
              </div>
              <p className="text-[28px] font-bold text-[#0a0a0a]">{weather.current.temperature}°C</p>
              <p className="text-[13px] text-[#6b7280]">{weather.current.condition}</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { label: "Humidity", value: `${weather.current.humidity}%` },
                  { label: "Wind", value: `${weather.current.windSpeed} km/h` },
                  { label: "Rain", value: `${weather.current.precipitation}mm` },
                  { label: "Cloud", value: `${weather.current.cloudCover}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#fafaf9] rounded-lg px-2 py-1.5">
                    <p className="text-[10px] text-[#9ca3af]">{label}</p>
                    <p className="text-[12px] font-semibold text-[#0a0a0a]">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="bg-white border border-[#f0ede8] rounded-2xl p-5 col-span-2">
              <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide mb-3">7-Day Forecast</p>
              <div className="space-y-2">
                {weather.daily.slice(0, 7).map((d) => (
                  <div key={d.date} className="flex items-center gap-3 text-[12.5px]">
                    <span className="w-20 text-[#9ca3af] shrink-0">
                      {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <span className="text-[16px]">{WEATHER_ICONS[d.condition] ?? "🌡️"}</span>
                    <span className="font-medium text-[#0a0a0a] w-24 shrink-0">
                      {d.maxTemp}° / {d.minTemp}°
                    </span>
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

          {/* Generate Insights Button */}
          {step === "profile" && (
            <button
              onClick={handleGenerateInsights}
              className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white mb-6 transition-all"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            >
              🤖 Generate AI Farm Advisory
            </button>
          )}

          {step === "generating" && (
            <div className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white mb-6 flex items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)", opacity: 0.8 }}
            >
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Analysing crops, weather & market data…
            </div>
          )}

          {error && <p className="mb-4 text-[13px] text-red-500">{error}</p>}
        </>
      )}

      {/* AI Insights */}
      {insights && step === "done" && (
        <div className="space-y-4">
          {/* Seasonal Summary + Risk */}
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide">Seasonal Summary</p>
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full border ${riskColor[insights.overallRisk]}`}
              >
                {insights.overallRisk} Risk
              </span>
            </div>
            <p className="text-[14px] text-[#374151] leading-relaxed mb-2">{insights.seasonalSummary}</p>
            <p className="text-[13px] text-[#6b7280]">⚠️ {insights.riskReason}</p>
          </div>

          {/* Immediate Actions */}
          {insights.immediateActions?.length > 0 && (
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-5">
              <p className="text-[12px] text-[#c2410c] uppercase tracking-wide font-semibold mb-3">
                Immediate Actions
              </p>
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
              <p className="text-[12px] text-red-700 uppercase tracking-wide font-semibold mb-3">
                ⛈️ Weather Alerts
              </p>
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
                  <span
                    className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg ${statusColor[item.status]}`}
                  >
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
                    {item.priceOutlook === "Bullish" ? "↑" : item.priceOutlook === "Bearish" ? "↓" : "→"}{" "}
                    {item.priceOutlook}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#0a0a0a]">{item.crop}</p>
                    <p className="text-[13px] text-[#6b7280]">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Govt Schemes */}
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
            <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-4">
              🏛️ Government Schemes for You
            </p>
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

          {/* Re-run */}
          <div className="flex gap-3 pb-6">
            <button
              onClick={handleGenerateInsights}
              className="px-5 py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f9fafb] transition-colors"
            >
              ↻ Regenerate Insights
            </button>
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] font-medium text-[#9ca3af] hover:bg-[#f9fafb] transition-colors"
            >
              Look up another farmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
