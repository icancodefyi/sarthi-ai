"use client";

import { useState, useRef, useEffect } from "react";
import { useTTS, TTS_LANGUAGES, type TTSLangCode } from "@/app/hooks/useTTS";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  datasetId: string;
  datasetName: string;
}

export default function DatasetChatbot({ datasetId, datasetName }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<TTSLangCode>("en-IN");
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak, stop, speaking } = useTTS();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        setMessages([{
          role: "assistant",
          content: `Hello! I'm your Sarthi AI assistant for "${datasetName}". Ask me anything about the statistics, anomalies, trends, or risk factors in this dataset. You can also ask in Hindi, Marathi, or Telugu!`,
        }]);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!speaking) setSpeakingIdx(null);
  }, [speaking]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/datasets/${datasetId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages.slice(-8),
          language: lang,
        }),
      });
      const json = await res.json();
      const reply = json.reply ?? "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSpeak(text: string, idx: number) {
    if (speakingIdx === idx) {
      stop();
      setSpeakingIdx(null);
    } else {
      setSpeakingIdx(idx);
      speak(text, lang);
    }
  }

  const QUICK_PROMPTS = [
    "What are the key anomalies?",
    "Explain the risk score",
    "What does the forecast say?",
    "Summary in simple words",
  ];

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          open ? "bg-[#374151] rotate-45" : "bg-[#0a0a0a] hover:bg-[#1f2937]"
        }`}
        title="Ask Sarthi AI"
      >
        {open ? (
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chatbot panel */}
      {open && (
        <div
          className="fixed bottom-22 right-6 z-50 w-[380px] rounded-2xl border border-[#e5e7eb] bg-white shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#f0ede8] flex items-center justify-between bg-[#0a0a0a]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center shrink-0">
                <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-white">Sarthi AI Assistant</p>
                <p className="text-[10.5px] text-[#9ca3af] truncate max-w-[180px]">{datasetName}</p>
              </div>
            </div>
            {/* Language selector */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as TTSLangCode)}
              className="text-[11px] bg-[#1f2937] text-white border border-[#374151] rounded-lg px-2 py-1 focus:outline-none"
            >
              {TTS_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.native}</option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#fafaf9]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center shrink-0 mr-2 mt-1">
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
                <div className="max-w-[78%]">
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#0a0a0a] text-white rounded-br-sm"
                        : "bg-white border border-[#f0ede8] text-[#374151] rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => handleSpeak(msg.content, i)}
                      className={`mt-1 ml-1 flex items-center gap-1 text-[10.5px] transition-colors ${
                        speakingIdx === i ? "text-[#6366f1]" : "text-[#d1d5db] hover:text-[#9ca3af]"
                      }`}
                    >
                      {speakingIdx === i ? (
                        <>
                          <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
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
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center shrink-0 mr-2 mt-1">
                  <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="bg-white border border-[#f0ede8] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 flex gap-1.5 flex-wrap border-t border-[#f0ede8] bg-white">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-[#e5e7eb] text-[#6b7280] hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#f0ede8] bg-white flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={lang === "hi-IN" ? "अपना सवाल पूछें…" : lang === "mr-IN" ? "प्रश्न विचारा…" : lang === "te-IN" ? "మీ ప్రశ్న అడగండి…" : "Ask about this dataset…"}
              disabled={loading}
              className="flex-1 text-[13px] px-3 py-2 rounded-xl border border-[#e5e7eb] focus:outline-none focus:border-[#6366f1] bg-[#fafaf9] disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
            >
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
