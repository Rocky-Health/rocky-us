import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if email exists in WordPress
    try {
      const checkEmailResponse = await axios.post(
        `${BASE_URL}/wp-json/custom/v1/check-email`,
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.ADMIN_TOKEN,
          },
          timeout: 5000,
        }
      );

      return NextResponse.json({
        success: true,
        registered: checkEmailResponse.data.registered === true,
      });
    } catch (err) {
      logger.log("Error checking email:", err);

      // Fail closed. Reporting an unverified address as "not registered" is
      // what let existing customers through the quiz into the signup flow.
      return NextResponse.json(
        {
          success: false,
          error: "Could not verify email availability. Please try again.",
        },
        { status: 503 }
      );
    }
  } catch (error) {
    logger.log("Error in check-email API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
