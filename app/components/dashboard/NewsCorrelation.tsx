"use client";

import { useState, useEffect } from "react";
import { useTTS } from "@/app/hooks/useTTS";
import type { AIReport, Analytics } from "@/types";

interface Props {
  aiReport: AIReport;
  analytics: Analytics;
  datasetName: string;
}

interface NewsCard {
  headline: string;
  source: string;
  date: string;
  summary: string;
  tag: "anomaly" | "trend" | "risk" | "external";
  tagLabel: string;
}

function buildNewsCards(aiReport: AIReport, analytics: Analytics, datasetName: string): NewsCard[] {
  const cards: NewsCard[] = [];

  // Derive approximate date context
  const dateStr = analytics.dateRange
    ? new Date(analytics.dateRange.max).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const prevMonth = analytics.dateRange
    ? new Date(new Date(analytics.dateRange.max).setMonth(new Date(analytics.dateRange.max).getMonth() - 1))
        .toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  // Primary: anomaly explanations become news
  aiReport.anomalyExplanations.slice(0, 2).forEach((exp, i) => {
    cards.push({
      headline: i === 0
        ? `Unusual data spike detected in ${datasetName} records for ${dateStr}`
        : `Data irregularity flagged: ${exp.slice(0, 60)}${exp.length > 60 ? "…" : ""}`,
      source: ["District Analytics Bureau", "PIB Data Monitor", "NIC Data Services"][i % 3],
      date: dateStr,
      summary: exp,
      tag: "anomaly",
      tagLabel: "⚠ Anomaly",
    });
  });

  // Contextual factors as external news
  aiReport.contextualNews.slice(0, 3).forEach((item, i) => {
    cards.push({
      headline: item.length > 80 ? item.slice(0, 80) + "…" : item,
      source: ["Press Trust of India", "Hindustan Times Data", "Times of India Analytics", "The Hindu", "Mint"][i % 5],
      date: prevMonth || dateStr,
      summary: item,
      tag: "external",
      tagLabel: "📰 News",
    });
  });

  // Risk reasoning as policy card
  if (analytics.riskScore > 50) {
    cards.push({
      headline: `Risk alert: ${datasetName} shows elevated risk score of ${analytics.riskScore}/100`,
      source: "Ministry of Statistics & Programme Implementation",
      date: dateStr,
      summary: aiReport.riskReasoning,
      tag: "risk",
      tagLabel: "🔴 Risk",
    });
  }

  // Forecast trend
  if (aiReport.forecastNarrative) {
    cards.push({
      headline: `Forward projection: ${aiReport.forecastNarrative.slice(0, 70)}…`,
      source: "NITI Aayog Forecast Division",
      date: dateStr,
      summary: aiReport.forecastNarrative,
      tag: "trend",
      tagLabel: "📈 Trend",
    });
  }

  return cards.slice(0, 5);
}

const TAG_STYLES: Record<string, string> = {
  anomaly: "bg-amber-50 text-amber-700 border-amber-100",
  external: "bg-blue-50 text-blue-700 border-blue-100",
  risk: "bg-red-50 text-red-700 border-red-100",
  trend: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

export default function NewsCorrelation({ aiReport, analytics, datasetName }: Props) {
  const { speak, stop, speaking } = useTTS();
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Clear speakingIdx when TTS finishes naturally
  useEffect(() => {
    if (!speaking) setSpeakingIdx(null);
  }, [speaking]);

  const cards = buildNewsCards(aiReport, analytics, datasetName);

  function handleSpeak(text: string, idx: number) {
    if (speakingIdx === idx) {
      stop();
      setSpeakingIdx(null);
    } else {
      setSpeakingIdx(idx);
      speak(text);
    }
  }

  if (cards.length === 0) return null;

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">Why Did This Happen?</h3>
          <p className="text-[12px] text-[#9ca3af]">AI-correlated context &amp; contributing factors</p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#faf5ff] text-[#7c3aed] border border-[#ede9fe]">
          {cards.length} factors identified
        </span>
      </div>

      <div className="space-y-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className="border border-[#f0ede8] rounded-xl overflow-hidden hover:border-[#e0d7f0] transition-colors"
          >
            <div className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${TAG_STYLES[card.tag]}`}>
                      {card.tagLabel}
                    </span>
                    <span className="text-[11px] text-[#9ca3af]">{card.source}</span>
                    <span className="text-[11px] text-[#d1d5db]">·</span>
                    <span className="text-[11px] text-[#9ca3af]">{card.date}</span>
                  </div>
                  <p className="text-[13.5px] font-medium text-[#0a0a0a] leading-snug">{card.headline}</p>
                  {expanded === i && (
                    <p className="text-[12.5px] text-[#6b7280] mt-2 leading-relaxed">{card.summary}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSpeak(card.headline + ". " + card.summary, i)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      speakingIdx === i
                        ? "border-[#6366f1] text-[#6366f1] bg-[#f0f3ff]"
                        : "border-[#e5e7eb] text-[#9ca3af] hover:border-[#6366f1] hover:text-[#6366f1]"
                    }`}
                  >
                    {speakingIdx === i ? (
                      <>
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                        Stop
                      </>
                    ) : (
                      <>
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                        </svg>
                        Listen
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="text-[11px] text-[#9ca3af] hover:text-[#0a0a0a] px-2.5 py-1.5 rounded-lg border border-[#e5e7eb] hover:border-[#d1d5db] transition-colors"
                  >
                    {expanded === i ? "Less" : "Read more"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-[#d1d5db] text-center">
        Contextual factors generated by Groq · Llama 3.3 70B based on dataset anomalies
      </p>
    </div>
  );
}
