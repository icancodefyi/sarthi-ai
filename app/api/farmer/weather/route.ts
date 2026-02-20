import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code,cloud_cover"
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weather_code"
    );
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "Asia/Kolkata");

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error("OpenMeteo request failed");

    const data = await res.json();

    // Shape a clean response
    const current = data.current ?? {};
    const daily = data.daily ?? {};

    const weatherCodeDesc = (code: number): string => {
      if (code === 0) return "Clear sky";
      if (code <= 3) return "Partly cloudy";
      if (code <= 49) return "Foggy";
      if (code <= 67) return "Rainy";
      if (code <= 77) return "Snow / Sleet";
      if (code <= 82) return "Rain showers";
      if (code <= 99) return "Thunderstorm";
      return "Unknown";
    };

    return NextResponse.json({
      current: {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        windSpeed: current.wind_speed_10m,
        cloudCover: current.cloud_cover,
        condition: weatherCodeDesc(current.weather_code ?? 0),
        weatherCode: current.weather_code,
      },
      daily: (daily.time ?? []).map((date: string, i: number) => ({
        date,
        maxTemp: daily.temperature_2m_max?.[i],
        minTemp: daily.temperature_2m_min?.[i],
        precipitation: daily.precipitation_sum?.[i],
        evapotranspiration: daily.et0_fao_evapotranspiration?.[i],
        condition: weatherCodeDesc(daily.weather_code?.[i] ?? 0),
      })),
    });
  } catch (err) {
    console.error("Weather fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
