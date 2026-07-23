import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/utils/devLogger";
import {
  limiters,
  getClientIp,
  normalizeId,
  checkLimits,
  tooManyRequests,
} from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const { password, token, login } = await request.json();

    // TK-441: throttle reset attempts by identifier (3/hour) and IP (10/hour).
    const ip = getClientIp(request);
    const rl = await checkLimits(
      [
        [limiters.pwEmail, normalizeId(login)],
        [limiters.pwIp, ip],
      ],
      "reset-password",
    );
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    if (!password || !token || !login) {
      return NextResponse.json(
        { success: false, message: "Password, token and login are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Connect to WordPress REST API to reset the password
    try {
      const response = await axios.post(
        `${process.env.BASE_URL}/wp-json/custom/v1/reset-password`,
        {
          password,
          key: token,
          login: login,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${process.env.ADMIN_TOKEN}`,
          },
        }
      );

      return NextResponse.json(
        {
          success: true,
          message: "Password has been reset successfully",
        },
        { status: 200 }
      );
    } catch (apiError) {
      logger.error("API password reset error:", apiError?.message);
      return NextResponse.json(
        {
          success: false,
          message:
            apiError.response?.data?.message ||
            apiError.response?.data?.error?.message ||
            "Failed to reset password",
        },
        { status: apiError.response?.status || 400 }
      );
    }
  } catch (error) {
    logger.error("Password reset error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resetting your password",
      },
      { status: 500 }
    );
  }
}
