import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import crypto from "crypto";

const BASE_URL = process.env.BASE_URL;
const privateKey = process.env.RSA_PRIVATE_KEY;

// Helper function to validate date format (YYYY-MM-DD)
function validateDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

export async function POST(req) {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            confirm_password,
            phone,
            date_of_birth,
            province,
            gender,
            register_step,
            isEncryptedPassword,
        } = await req.json();

        const decryptedPassword =
            isEncryptedPassword && privateKey
                ? crypto
                      .privateDecrypt(
                          {
                              key: privateKey,
                              padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                              oaepHash: "sha256",
                          },
                          Buffer.from(password, "base64"),
                      )
                      ?.toString("utf8") || password
                : password;

        // Handle step 1 (validation only)
        if (register_step == 1) {
            // Perform validation checks similar to the PHP version
            if (!first_name || !last_name) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Fullname is required",
                    },
                    { status: 400 },
                );
            }

            if (!email) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Email is required",
                    },
                    { status: 400 },
                );
            }

            if (!email.includes("@") || !email.includes(".")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "A valid email is required",
                    },
                    { status: 400 },
                );
            }

            if (!decryptedPassword || decryptedPassword.length < 6) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Password must be at least 6 characters.",
                    },
                    { status: 400 },
                );
            }

            // Check if email exists (we'll simulate this check)
            try {
                const checkEmailResponse = await axios.post(
                    `${BASE_URL}/wp-json/custom/v1/check-email`,
                    { email: email },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: process.env.ADMIN_TOKEN,
                        },
                    },
                );

                if (checkEmailResponse.data.registered === true) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Email already registered. Please login.",
                        },
                        { status: 409 },
                    );
                }
            } catch (err) {
                logger.log("Error checking email:", err);
                // Continue even if email check fails
            }

            // Step 1 is successful, return validation success
            return NextResponse.json({
                success: true,
                message: "Step 1 validation passed",
            });
        }

        // Handle step 2 (create user)
        if (register_step == 2) {
            // Validate step 1 fields again for security
            if (
                !first_name ||
                !last_name ||
                !email ||
                !decryptedPassword ||
                decryptedPassword.length < 6
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Missing required fields from step 1",
                    },
                    { status: 400 },
                );
            }

            if (!phone) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Phone number is required.",
                    },
                    { status: 400 },
                );
            }

            if (!province) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Province is required.",
                    },
                    { status: 400 },
                );
            }

            if (!date_of_birth) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Date of birth is required.",
                    },
                    { status: 400 },
                );
            }

            if (!validateDateFormat(date_of_birth)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid date of birth format.",
                    },
                    { status: 400 },
                );
            }

            try {
                // Use the new custom registration endpoint
                const userData = {
                    first_name,
                    last_name,
                    email,
                    password: decryptedPassword,
                    confirm_password: decryptedPassword, // Ensure passwords match
                    phone,
                    dob: date_of_birth,
                    province,
                    gender: gender || "",
                };

                logger.log("Registering user with new WordPress endpoint");

                const response = await axios.post(
                    `${BASE_URL}/wp-json/custom/v1/register`,
                    userData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: process.env.ADMIN_TOKEN,
                        },
                    },
                );

                if (response.data.error) {
                    return NextResponse.json(
                        {
                            success: false,
                            error:
                                response.data.message || "Registration failed.",
                        },
                        { status: response.status || 400 },
                    );
                }

                const userId = response.data.user_id;

                // Set up cookies for our Next.js app
                const encodedCredentials = btoa(
                    `${email}:${decryptedPassword}`,
                );
                const cookieStore = await cookies();
                cookieStore.set("authToken", `Basic ${encodedCredentials}`);
                cookieStore.set("userId", userId.toString());
                cookieStore.set("userName", `${first_name} ${last_name}`);
                cookieStore.set("userEmail", email);
                // Store just the first name in displayName to avoid disturbing the design
                cookieStore.set("displayName", first_name);
                cookieStore.set("lastName", last_name);
                cookieStore.set("province", province);
                cookieStore.set("phone", phone);
                cookieStore.set("DOB", date_of_birth);

                // Set cart nonce if provided in the response
                if (response.data.nonce) {
                    cookieStore.set("cart-nonce", response.data.nonce);
                    logger.log(
                        "Set cart-nonce cookie after registration:",
                        response.data.nonce,
                    );
                }

                // Verify that the userId was stored successfully
                const storedUserId = cookieStore.get("userId");
                if (!storedUserId || storedUserId.value !== userId.toString()) {
                    logger.error("Failed to store userId in cookies");
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Failed to store user session. Please try again.",
                        },
                        { status: 500 },
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: "Registration successful",
                    data: {
                        id: userId,
                        first_name,
                        last_name,
                        email,
                        response: response.data,
                    },
                    cookieVerified: true,
                });
            } catch (error) {
                logger.error(
                    "Error registering user with WordPress endpoint:",
                    error.response?.data || error.message,
                );

                // Handle specific error responses from the API
                if (error.response?.data?.message) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: error.response.data.message,
                        },
                        { status: error.response.status || 400 },
                    );
                }

                return NextResponse.json(
                    {
                        success: false,
                        error: "Registration failed. Please try again.",
                    },
                    { status: 500 },
                );
            }
        }


        cookieStore.delete("new-bo-preqiz-data");
        cookieStore.delete("new-bo-essential-consul"); 

        // If no valid register_step provided
        return NextResponse.json(
            {
                success: false,
                error: "Invalid registration step",
            },
            { status: 400 },
        );
    } catch (error) {
        logger.error(
            "Error registering user:",
            error.response?.data || error.message,
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error.response?.data?.message ||
                    "Registration failed. Please try again.",
            },
            { status: error.response?.status || 500 },
        );
    }
}
