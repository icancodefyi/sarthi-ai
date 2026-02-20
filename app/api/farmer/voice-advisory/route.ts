import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface FarmerContext {
  name: string;
  village: string;
  district: string;
  state: string;
  crops: string[];
  landAcres: number;
  soilType: string;
  irrigationType: string;
  annualIncomeINR?: number;
}

interface WeatherContext {
  temperature: number;
  humidity: number;
  precipitation: number;
  condition: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = body.question ?? "";
    const farmer: FarmerContext = body.farmer;
    const weather: WeatherContext | null = body.weather ?? null;
    const lang: string = body.lang ?? "hi-IN";

    if (!question.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const isHindi = lang.startsWith("hi");

    const systemPrompt = isHindi
      ? `आप एक कृषि विशेषज्ञ हैं जो भारतीय किसानों को सलाह देते हैं। 
आपको हमेशा हिंदी में सरल, व्यावहारिक और संक्षिप्त जवाब देना है (3-5 वाक्य)।
केवल उस किसान की विशिष्ट स्थिति को ध्यान में रखकर उत्तर दें।`
      : `You are an expert agricultural advisor helping Indian farmers.
Give clear, practical, concise advice in English (3-5 sentences).
Tailor your answer specifically to this farmer's crops, soil and weather conditions.`;

    const contextBlock = `
Farmer: ${farmer.name}, ${farmer.village}, ${farmer.district}, ${farmer.state}
Crops: ${farmer.crops.join(", ")} | Land: ${farmer.landAcres} acres | Soil: ${farmer.soilType} | Irrigation: ${farmer.irrigationType}
${weather ? `Current Weather: ${weather.temperature}°C, ${weather.condition}, Humidity: ${weather.humidity}%, Rain: ${weather.precipitation}mm` : ""}
`;

    const userMessage = isHindi
      ? `किसान की जानकारी:\n${contextBlock}\n\nप्रश्न: ${question}`
      : `Farmer context:\n${contextBlock}\n\nQuestion: ${question}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    const answer = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Voice advisory error:", err);
    return NextResponse.json({ error: "Advisory generation failed" }, { status: 500 });
  }
}
