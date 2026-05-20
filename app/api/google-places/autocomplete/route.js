import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API;
const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";

export async function POST(request) {
  try {
    const { query, sessionToken } = await request.json();

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: "Query must be at least 1 character long" },
        { status: 400 },
      );
    }

    if (!GOOGLE_PLACES_API_KEY) {
      logger.error("GOOGLE_PLACES_API key is missing");
      return NextResponse.json(
        { error: "Google Places API key is not configured" },
        { status: 500 },
      );
    }

    const url = new URL(GOOGLE_PLACES_AUTOCOMPLETE_URL);
    url.searchParams.append("input", query);
    url.searchParams.append("components", "country:us");
    url.searchParams.append("types", "address");
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);
    if (sessionToken) {
      url.searchParams.append("sessiontoken", sessionToken);
    }

    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Google Places autocomplete HTTP error:", {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: "Google Places API error", details: errorText },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      logger.error("Google Places autocomplete non-OK status:", data);
      return NextResponse.json(
        {
          error: "Google Places API Error",
          details: data.error_message || data.status,
        },
        { status: 502 },
      );
    }

    const addresses = (data.predictions || []).map((p) => ({
      id: p.place_id,
      formattedAddress: p.description,
    }));

    return NextResponse.json({ addresses });
  } catch (err) {
    logger.error("Google Places autocomplete unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error", details: err.message },
      { status: 500 },
    );
  }
}
