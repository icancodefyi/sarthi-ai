"use client";

import { useState, useCallback, useRef } from "react";

export const TTS_LANGUAGES = [
  { code: "en-IN", label: "English",  native: "English" },
  { code: "hi-IN", label: "Hindi",    native: "हिंदी" },
  { code: "mr-IN", label: "Marathi",  native: "मराठी" },
  { code: "te-IN", label: "Telugu",   native: "తెలుగు" },
  { code: "ta-IN", label: "Tamil",    native: "தமிழ்" },
  { code: "kn-IN", label: "Kannada",  native: "ಕನ್ನಡ" },
] as const;

export type TTSLangCode = (typeof TTS_LANGUAGES)[number]["code"];

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Pure browser speechSynthesis — no external services, works fully offline.

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string, lang: string = "en-IN") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);

    const trimmed = text.trim().slice(0, 2000);
    if (!trimmed) return;

    const utt = new SpeechSynthesisUtterance(trimmed);
    utt.lang = lang;   // system picks the best installed voice for this lang
    utt.rate = 0.92;
    utt.pitch = 1;
    utt.volume = 1;

    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled") setSpeaking(false);
    };

    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, stop, speaking, supported };
}

