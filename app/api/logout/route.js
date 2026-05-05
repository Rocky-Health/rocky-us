import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;

export async function POST(req) {
  try {
    const cookieStore = await cookies();

    // Check if this is a Google auth session
    const googleAuth = cookieStore.get("googleAuth")?.value;
    const sessionId = cookieStore.get("sessionId")?.value;

    // If logged in with Google, revoke the session on backend
    if (googleAuth === "true" && sessionId) {
      try {
        const authToken = cookieStore.get("authToken")?.value;

        if (authToken) {
          await axios.post(
            `${BASE_URL}/wp-json/custom/v1/google-logout`,
            {
              session_id: sessionId,
              all_devices: false, // Only logout current device by default
            },
            {
              headers: {
                Authorization: authToken,
              },
            }
          );

          logger.log(`Google session revoked: ${sessionId}`);
        }
      } catch (backendError) {
        logger.error(
          "Error revoking Google session on backend:",
          backendError.message
        );
        // Continue with local logout even if backend fails
      }
    }

    // Clear server-side cookies
    cookieStore.delete("authToken");
    cookieStore.delete("userName");
    cookieStore.delete("userEmail");
    cookieStore.delete("userId");
    cookieStore.delete("displayName");
    cookieStore.delete("googleAuth");
    cookieStore.delete("sessionId");
    cookieStore.delete("sessionExpiresAt");
    cookieStore.delete("pn");
    cookieStore.delete("province");
    cookieStore.delete("dob");
    cookieStore.delete("stripeCustomerId");
    cookieStore.delete("new-bo-preqiz-data");
    cookieStore.delete("new-bo-essential-consul"); 
    // Set a flag in cookies to trigger client-side cache clearing
    // This is needed because server-side code cannot directly access localStorage
    cookieStore.set("clearCache", "true", {
      maxAge: 10, // Short lifespan, just enough for the client to detect it
      path: "/",
    });

    // Check if this is an AJAX request (fetch/XMLHttpRequest)
    const isAjaxRequest = req.headers.get("content-type")?.includes("application/json");

    // For AJAX requests, return JSON response
    if (isAjaxRequest) {
      return NextResponse.json({
        success: true,
        message: "Logged out successfully",
      });
    }

    // For regular form submissions, redirect
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  } catch (error) {
    logger.error("Error logging out:", error.response?.data || error.message);

    return NextResponse.json(
      {
        error:
          error.response?.data?.message || "Logout failed. Please try again.",
      },
      { status: error.response?.status || 500 }
    );
  }
}
