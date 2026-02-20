"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export const TTS_LANGUAGES = [
  { code: "en-IN", label: "English",  native: "English", gtts: "en" },
  { code: "hi-IN", label: "Hindi",    native: "हिंदी",    gtts: "hi" },
  { code: "mr-IN", label: "Marathi",  native: "मराठी",    gtts: "mr" },
  { code: "te-IN", label: "Telugu",   native: "తెలుగు",   gtts: "te" },
  { code: "ta-IN", label: "Tamil",    native: "தமிழ்",    gtts: "ta" },
  { code: "kn-IN", label: "Kannada",  native: "ಕನ್ನಡ",    gtts: "kn" },
] as const;

export type TTSLangCode = (typeof TTS_LANGUAGES)[number]["code"];

// ─── Web Speech helpers ──────────────────────────────────────────────────────

function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) { resolve(v); return; }
    const h = () => { window.removeEventListener("voiceschanged" as never, h); resolve(window.speechSynthesis.getVoices()); };
    window.addEventListener("voiceschanged" as never, h);
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1200);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const lc = lang.toLowerCase();
  const prefix = lc.split("-")[0];
  return (
    voices.find((v) => v.lang.toLowerCase() === lc) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    null
  );
}

// Chrome long-text pause bug workaround
function startKeepAlive(ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  ref.current = setInterval(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 9000);
}
function stopKeepAlive(ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (ref.current) { clearInterval(ref.current); ref.current = null; }
}

// ─── Google Translate TTS fallback ──────────────────────────────────────────
// Splits text into ≤200-char chunks at sentence / comma boundaries

function splitText(text: string, maxLen = 190): string[] {
  const chunks: string[] = [];
  const sentences = text.replace(/([।.!?])\s+/g, "$1|").split("|");
  let current = "";
  for (const s of sentences) {
    if ((current + s).length > maxLen) {
      if (current) { chunks.push(current.trim()); current = ""; }
      // if single sentence still too long, split on comma
      if (s.length > maxLen) {
        s.split(/,\s*/).forEach((part) => {
          if ((current + part).length > maxLen) {
            if (current) chunks.push(current.trim());
            current = part + ", ";
          } else {
            current += part + ", ";
          }
        });
      } else {
        current = s + " ";
      }
    } else {
      current += s + " ";
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}

function gttsUrl(text: string, lang: string) {
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
}

async function playGTTS(
  chunks: string[],
  gttsLang: string,
  onStart: () => void,
  onEnd: () => void,
  cancelRef: React.MutableRefObject<boolean>
) {
  onStart();
  for (const chunk of chunks) {
    if (cancelRef.current) break;
    await new Promise<void>((resolve) => {
      const audio = new Audio(gttsUrl(chunk, gttsLang));
      audio.onended = () => resolve();
      audio.onerror = () => resolve(); // skip bad chunk, continue
      if (cancelRef.current) { resolve(); return; }
      audio.play().catch(() => resolve());
    });
  }
  onEnd();
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gttsCancelRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) getVoices();
  }, []);

  const speak = useCallback(async (text: string, lang: string = "en-IN") => {
    if (typeof window === "undefined") return;

    // Cancel any ongoing speech
    if (window.speechSynthesis) { window.speechSynthesis.cancel(); stopKeepAlive(keepAliveRef); }
    gttsCancelRef.current = true;
    await new Promise((r) => setTimeout(r, 80)); // small gap to let audio stop
    gttsCancelRef.current = false;

    const trimmed = text.slice(0, 1500);
    const entry = TTS_LANGUAGES.find((l) => l.code === lang);
    const gttsLang = entry?.gtts ?? "en";

    // Try Web Speech first — use it only if a matching voice actually exists
    if (window.speechSynthesis) {
      const voices = await getVoices();
      const voice = pickVoice(voices, lang);

      if (voice) {
        // Native voice available — use Web Speech
        const utt = new SpeechSynthesisUtterance(trimmed);
        utt.lang = voice.lang;
        utt.voice = voice;
        utt.rate = 0.88;
        utt.pitch = 1;
        utt.volume = 1;
        utt.onstart = () => { setSpeaking(true); startKeepAlive(keepAliveRef); };
        utt.onend   = () => { setSpeaking(false); stopKeepAlive(keepAliveRef); };
        utt.onerror = () => { setSpeaking(false); stopKeepAlive(keepAliveRef); };
        window.speechSynthesis.speak(utt);
        return;
      }
    }

    // No native voice — fall back to Google Translate TTS
    const chunks = splitText(trimmed);
    playGTTS(chunks, gttsLang, () => setSpeaking(true), () => setSpeaking(false), gttsCancelRef);
  }, []);

  const stop = useCallback(() => {
    gttsCancelRef.current = true;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      stopKeepAlive(keepAliveRef);
    }
    setSpeaking(false);
  }, []);

  const supported =
    typeof window !== "undefined" &&
    ("speechSynthesis" in window || "Audio" in window);

  return { speak, stop, speaking, supported };
}
