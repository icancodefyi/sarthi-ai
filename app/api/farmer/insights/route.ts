import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface WeatherCurrent {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
}

interface WeatherDaily {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  evapotranspiration: number;
  condition: string;
}

interface FarmerProfile {
  name: string;
  district: string;
  state: string;
  crops: string[];
  landAcres: number;
  soilType: string;
  irrigationType: string;
  annualIncomeINR: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      farmer,
      weather,
    }: { farmer: FarmerProfile; weather: { current: WeatherCurrent; daily: WeatherDaily[] } } = body;

    if (!farmer || !weather) {
      return NextResponse.json({ error: "farmer and weather data are required" }, { status: 400 });
    }

    const prompt = buildPrompt(farmer, weather);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.45,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const insights = JSON.parse(raw);

    return NextResponse.json({ insights });
  } catch (err) {
    console.error("Farmer insights error:", err);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

function buildPrompt(
  farmer: FarmerProfile,
  weather: { current: WeatherCurrent; daily: WeatherDaily[] }
): string {
  const dailySummary = weather.daily
    .map(
      (d) =>
        `${d.date}: max ${d.maxTemp}°C / min ${d.minTemp}°C, rain ${d.precipitation}mm, condition: ${d.condition}`
    )
    .join("\n");

  return `You are an AI agricultural advisor for Indian farmers. Analyze the following farmer profile and weather data, then generate comprehensive advisory insights.

FARMER PROFILE:
- Name: ${farmer.name}
- Location: ${farmer.district}, ${farmer.state}
- Crops: ${farmer.crops.join(", ")}
- Land: ${farmer.landAcres} acres
- Soil Type: ${farmer.soilType}
- Irrigation: ${farmer.irrigationType}
- Annual Income: ₹${farmer.annualIncomeINR.toLocaleString("en-IN")}

CURRENT WEATHER (${farmer.district}):
- Temperature: ${weather.current.temperature}°C
- Humidity: ${weather.current.humidity}%
- Precipitation: ${weather.current.precipitation}mm
- Wind: ${weather.current.windSpeed} km/h
- Condition: ${weather.current.condition}

7-DAY FORECAST:
${dailySummary}

Return a JSON object with exactly this structure:
{
  "overallRisk": "Low | Medium | High",
  "riskReason": "one sentence explaining the main current risk",
  "cropAdvisory": [
    { "crop": "crop name", "status": "Good | Caution | Critical", "advice": "specific actionable advice 2-3 sentences" }
  ],
  "irrigationAdvice": "specific irrigation recommendation (2-3 sentences) based on current humidity, rainfall, and ET0 data",
  "weatherAlerts": ["alert 1", "alert 2"] or [],
  "marketOutlook": [
    { "crop": "crop name", "priceOutlook": "Bullish | Neutral | Bearish", "reason": "1-2 sentences on market price expectation based on weather & season" }
  ],
  "govtSchemes": [
    { "schemeName": "scheme name", "benefit": "what benefit the farmer can get", "howToApply": "brief instruction" }
  ],
  "immediateActions": ["action 1", "action 2", "action 3"],
  "seasonalSummary": "2-3 sentence overall summary of the farming situation this week"
}

Base govt schemes on the farmer's state (${farmer.state}) and crops. Include PM-KISAN, PMFBY crop insurance, and 1-2 state-specific relevant schemes. All advice must be practical, specific to the crops and location. Respond ONLY in JSON.`;
}
