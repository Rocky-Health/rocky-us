import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";

// Email validation function
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export async function POST(request) {
    try {
        // Parse the request body
        const { email } = await request.json();
        logger.log("Received subscription request");

        // Validate the email
        if (!email || !isValidEmail(email)) {
            logger.log("Invalid email format");
            return NextResponse.json(
                { success: false, error: "Invalid or missing email" },
                { status: 400 },
            );
        }

        // Make a request to the Attentive API
        logger.log("Making request to Attentive API...");
        const response = await fetch(
            "https://api.attentivemobile.com/v1/subscriptions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.ATTENTIVE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user: {
                        email: email,
                    },
                    locale: {
                      language: "en",
                      country: "US",
                    },
                    signUpSourceId: "1239403",
                    singleOptIn: false,
                    subscriptionType: "MARKETING",
                }),
            },
        );

        // Parse the response
        const data = await response.json();
        logger.log("Attentive API response:", {
            status: response.status,
            data,
        });

        // Check if the API request was successful
        if (!response.ok) {
            logger.log("Attentive API error:", data);
            return NextResponse.json(
                {
                    success: false,
                    error: data.message || "Subscription failed",
                },
                { status: response.status },
            );
        }

        logger.log("Subscription successful");
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        logger.error("Subscription error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
