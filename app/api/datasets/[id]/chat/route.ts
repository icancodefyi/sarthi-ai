import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LANG_INSTRUCTIONS: Record<string, string> = {
  "en-IN": "Respond in clear, concise English.",
  "hi-IN": "हिंदी में जवाब दें। सरल और स्पष्ट भाषा का उपयोग करें।",
  "mr-IN": "मराठीत उत्तर द्या. सोपी भाषा वापरा.",
  "te-IN": "తెలుగులో సమాధానం ఇవ్వండి. సరళమైన భాషను ఉపయోగించండి.",
  "ta-IN": "தமிழில் பதில் கூறுங்கள். எளிய மொழியைப் பயன்படுத்துங்கள்.",
  "kn-IN": "ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ. ಸರಳ ಭಾಷೆ ಬಳಸಿ.",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { message, history = [], language = "en-IN" } = await req.json();

    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataset = await db.collection("datasets").findOne({ _id: id as any, userId: MOCK_USER.id });
    if (!dataset) return NextResponse.json({ error: "Dataset not found" }, { status: 404 });

    const a = dataset.analytics;
    const ai = dataset.aiReport;

    const statsBlock = a
      ? `Dataset: "${dataset.originalName}" (Category: ${dataset.category ?? "general"})
Total Records: ${a.totalRecords}
Risk Score: ${a.riskScore}/100
Growth %: ${a.growthPercent ?? "N/A"}
Anomalies Detected: ${a.anomalies?.length ?? 0}
Date Range: ${a.dateRange ? `${a.dateRange.min} to ${a.dateRange.max}` : "Not detected"}
Numeric Columns: ${Object.keys(a.numericSummary ?? {}).join(", ")}
Column Stats (mean): ${Object.entries(a.numericSummary ?? {})
        .slice(0, 6)
        .map(([col, s]) => `${col}=${(s as { mean: number }).mean}`)
        .join(", ")}`
      : `Dataset: "${dataset.originalName}" — analytics not yet available.`;

    const aiBlock = ai
      ? `\nAI Summary: ${ai.executiveSummary}
Risk Reasoning: ${ai.riskReasoning}
Forecast: ${ai.forecastNarrative}` : "";

    const langInstruction = LANG_INSTRUCTIONS[language] ?? LANG_INSTRUCTIONS["en-IN"];

    const systemPrompt = `You are Sarthi AI's data assistant for government officials and farmers. You have access to dataset statistics and AI analysis below. Answer the user's question based on this data. Be brief (2–4 sentences), factual, and practical. Do NOT make up data not present below.

${statsBlock}${aiBlock}

${langInstruction}`;

    const messages = [
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.5,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
