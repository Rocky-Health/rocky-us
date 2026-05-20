import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import { PHASE_1_STATES } from "@/lib/constants/usStates";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API;
const GOOGLE_PLACES_DETAILS_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";

const findComponent = (components, type) =>
  components.find((c) => c.types.includes(type));

function parseGoogleAddress(addressComponents) {
  const streetNumber = findComponent(addressComponents, "street_number");
  const route = findComponent(addressComponents, "route");
  const city =
    findComponent(addressComponents, "locality") ||
    findComponent(addressComponents, "sublocality_level_1") ||
    findComponent(addressComponents, "postal_town") ||
    findComponent(addressComponents, "administrative_area_level_3");
  const state = findComponent(addressComponents, "administrative_area_level_1");
  const postalCode = findComponent(addressComponents, "postal_code");

  const street = [streetNumber?.long_name, route?.long_name]
    .filter(Boolean)
    .join(" ");

  return {
    street,
    unit: "",
    city: city?.long_name || "",
    province: state?.short_name || "",
    postalCode: postalCode?.long_name || "",
  };
}

export async function POST(request) {
  try {
    const { addressId, sessionToken } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { error: "addressId (place_id) is required" },
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

    const url = new URL(GOOGLE_PLACES_DETAILS_URL);
    url.searchParams.append("place_id", addressId);
    url.searchParams.append("fields", "address_components,formatted_address");
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);
    if (sessionToken) {
      url.searchParams.append("sessiontoken", sessionToken);
    }

    const response = await fetch(url.toString(), { method: "GET" });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Google Places details HTTP error:", {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: "Google Places API error", details: errorText },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (data.status !== "OK") {
      logger.error("Google Places details non-OK status:", data);
      return NextResponse.json(
        {
          error: "Google Places API Error",
          details: data.error_message || data.status,
        },
        { status: 502 },
      );
    }

    const components = data.result?.address_components || [];
    const address = parseGoogleAddress(components);

    if (!PHASE_1_STATES.includes(address.province)) {
      return NextResponse.json(
        {
          error: "Service not available in this state",
          details: `We currently don't ship to ${address.province || "this state"}.`,
          serviceCoverageUrl: "/service-coverage/",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ address });
  } catch (err) {
    logger.error("Google Places details unexpected error:", err);
    return NextResponse.json(
      { error: "Unexpected error", details: err.message },
      { status: 500 },
    );
  }
}
