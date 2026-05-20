import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API?.trim();
const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

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

    const body = {
      input: query,
      includedRegionCodes: ["us"],
    };
    if (sessionToken) body.sessionToken = sessionToken;

    const response = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      },
      body: JSON.stringify(body),
    });

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

    const addresses = (data.suggestions || [])
      .map((s) => s.placePrediction)
      .filter(Boolean)
      .map((p) => ({
        id: p.placeId,
        formattedAddress: p.text?.text || "",
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
