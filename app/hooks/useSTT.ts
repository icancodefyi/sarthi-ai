"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type STTState = "idle" | "listening" | "done" | "error";

interface UseSTTOptions {
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useSTT({ lang = "hi-IN", onResult, onError }: UseSTTOptions = {}) {
  const [state, setState] = useState<STTState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    setIsSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const start = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      onError?.("Speech recognition not supported. Use Chrome or Edge.");
      setState("error");
      return;
    }

    // Kill any previous session cleanly
    if (recRef.current) {
      try { recRef.current.abort(); } catch { /* ignore */ }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new SR();
    rec.lang = lang;
    rec.interimResults = false;   // final result only — simpler and more reliable
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => {
      setState("listening");
      setTranscript("");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
      setState("done");
      if (text) onResult?.(text.trim());
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "aborted" || e.error === "no-speech") {
        setState("idle");
        return;
      }
      const msgs: Record<string, string> = {
        "not-allowed":       "Microphone access denied — allow mic in browser settings.",
        "service-not-allowed": "Microphone access denied — allow mic in browser settings.",
        network:             "Speech recognition needs internet (Chrome).\nTry Edge which uses Windows speech engine offline.",
        "audio-capture":     "No microphone found.",
        "language-not-supported": "Language not supported by this browser.",
      };
      setState("error");
      onError?.(msgs[e.error] ?? `Speech error: ${e.error}`);
    };

    rec.onend = () => {
      setState((prev: STTState) => prev === "listening" ? "idle" : prev);
    };

    recRef.current = rec;
    rec.start();
  }, [lang, onResult, onError]);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setState("idle");
  }, []);

  const reset = useCallback(() => {
    try { recRef.current?.abort(); } catch { /* ignore */ }
    setState("idle");
    setTranscript("");
  }, []);

  return { state, transcript, isSupported, start, stop, reset };
}


