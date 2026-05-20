import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import { PHASE_1_STATES } from "@/lib/constants/usStates";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API?.trim();
const GOOGLE_PLACES_DETAILS_BASE_URL =
  "https://places.googleapis.com/v1/places/";

const findComponent = (components, type) =>
  components.find((c) => Array.isArray(c.types) && c.types.includes(type));

function parseGoogleAddress(addressComponents, formattedAddress) {
  const streetNumber = findComponent(addressComponents, "street_number");
  const route = findComponent(addressComponents, "route");
  const subpremise = findComponent(addressComponents, "subpremise");
  const city =
    findComponent(addressComponents, "locality") ||
    findComponent(addressComponents, "sublocality_level_1") ||
    findComponent(addressComponents, "postal_town") ||
    findComponent(addressComponents, "administrative_area_level_3");
  const state = findComponent(addressComponents, "administrative_area_level_1");
  const postalCode = findComponent(addressComponents, "postal_code");

  let street = [streetNumber?.longText, route?.longText]
    .filter(Boolean)
    .join(" ");

  // Final safety: if components didn't yield a street, derive it from
  // the first comma-segment of the formattedAddress so address_1 is never
  // empty for an otherwise valid place selection.
  if (!street && formattedAddress) {
    street = formattedAddress.split(",")[0]?.trim() || "";
  }

  return {
    street,
    unit: subpremise?.longText || "",
    city: city?.longText || "",
    province: state?.shortText || "",
    postalCode: postalCode?.longText || "",
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

    const url = new URL(
      GOOGLE_PLACES_DETAILS_BASE_URL + encodeURIComponent(addressId),
    );
    if (sessionToken) url.searchParams.append("sessionToken", sessionToken);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": "addressComponents,formattedAddress",
      },
    });

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
    const components = data.addressComponents || [];
    const address = parseGoogleAddress(components, data.formattedAddress);

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
