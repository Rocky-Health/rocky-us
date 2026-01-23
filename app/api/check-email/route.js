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
        }
      );

      return NextResponse.json({
        success: true,
        registered: checkEmailResponse.data.registered === true,
      });
    } catch (err) {
      logger.log("Error checking email:", err);
      
      // If the API call fails, return false for safety
      return NextResponse.json({
        success: true,
        registered: false,
      });
    }
  } catch (error) {
    logger.log("Error in check-email API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
