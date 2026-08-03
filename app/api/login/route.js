import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import crypto from "crypto";

const BASE_URL = process.env.BASE_URL;
const privateKey = process.env.RSA_PRIVATE_KEY;

export async function POST(req) {
    try {
        const { username, password, isEncryptedPassword } = await req.json();

        const decryptedPassword =
            isEncryptedPassword && privateKey
                ? crypto.privateDecrypt(
                      {
                          key: privateKey,
                          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                          oaepHash: "sha256",
                      },
                      Buffer.from(password, "base64"),
                  )
                : password;

        const encodedCredentials = btoa(
            `${username}:${isEncryptedPassword && privateKey ? decryptedPassword.toString("utf8") : password}`,
        );

        const response = await axios.post(
            `${BASE_URL}/wp-json/jwt-auth/v1/token`,
            {
                username,
                password:
                    isEncryptedPassword && privateKey
                        ? decryptedPassword.toString("utf8")
                        : password,
            },
            {
                headers: {
                    Authorization: `Basic ${encodedCredentials}`,
                },
            },
        );

        logger.log("Login response:", response.data);

        const { token } = response.data;

        if (!token) {
            return NextResponse.json(
                {
                    error:
                        response.data?.message ||
                        "Login failed. Please try again.",
                },
                { status: 401 },
            );
        }

        // Extract user ID from the token
        const tokenParts = token.split(".");
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.data.user.id;

        // Get user display name and email from response
        const userDisplayName = response.data.user_display_name || "";
        const userEmail = response.data.user_email || username;

        // Extract first and last name if available
        const firstName =
            response.data.user_firstname || userDisplayName.split(" ")[0] || "";
        const lastName =
            response.data.user_lastname ||
            (userDisplayName.split(" ").length > 1
                ? userDisplayName.split(" ").slice(1).join(" ")
                : "");
        const fullName = `${firstName} ${lastName}`.trim();

        const cookieStore = await cookies();
        cookieStore.set("authToken", `Basic ${encodedCredentials}`);
        // Marks the session start so the inactivity hook can discard stale
        // lastActivityTime values left over from a previous session
        cookieStore.set("loginTime", Date.now().toString());
        cookieStore.set("userId", userId);
        cookieStore.set("userName", fullName);
        cookieStore.set("userEmail", userEmail);
        // Store just the first name in displayName to avoid disturbing the design
        cookieStore.set(
            "displayName",
            firstName || userDisplayName.split(" ")[0],
        );

        const authToken = cookieStore.get("authToken");


        cookieStore.delete("new-bo-preqiz-data");
        cookieStore.delete("new-bo-essential-consul"); 

        if (!authToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Not authenticated",
                },
                { status: 401 },
            );
        }

        const wpResponse = await axios.get(
            `${BASE_URL}/wp-json/custom/v1/user-profile`,
            {
                headers: {
                    Authorization: authToken.value,
                },
            },
        );

        const phone = wpResponse.data.custom_meta.phone_number;
        const province = wpResponse.data.custom_meta.province;
        const dob = wpResponse.data.custom_meta.date_of_birth;
        cookieStore.set("pn", phone);
        cookieStore.set("province", province);
        cookieStore.set("dob", dob);

        // Fetch Stripe customer ID from WooCommerce and save to cookies
        try {
            const customerResponse = await axios.get(
                `${BASE_URL}/wp-json/wc/v3/customers/${userId}`,
                {
                    headers: {
                        Authorization: authToken.value,
                    },
                },
            );

            const metaData = customerResponse.data.meta_data || [];
            const stripeCustomerMeta = metaData.find(
                (meta) => meta.key === "_stripe_customer_id",
            );

            if (stripeCustomerMeta && stripeCustomerMeta.value) {
                cookieStore.set("stripeCustomerId", stripeCustomerMeta.value);
                logger.log(
                    "Stripe customer ID saved to cookies:",
                    stripeCustomerMeta.value,
                );
            }
        } catch (customerError) {
            logger.error(
                "Failed to fetch Stripe customer ID:",
                customerError.message,
            );
            // Continue login even if we can't fetch customer ID
        }

        // Verify the cookies were set correctly
        const storedUserId = cookieStore.get("userId");
        if (!storedUserId || storedUserId.value !== userId) {
            logger.error("Failed to store userId in cookies");
            return NextResponse.json(
                {
                    error: "Failed to store user session. Please try again.",
                },
                { status: 500 },
            );
        }

        return NextResponse.json({
            success: true,
            userId: userId,
            userDisplayName: firstName || userDisplayName.split(" ")[0],
        });
    } catch (error) {
        logger.error(
            "Error logging in:",
            error.response?.data || error.message,
        );

        // Check for authentication-related error codes from WordPress
        const errorCode = error.response?.data?.code;
        const isAuthError =
            errorCode === "incorrect_password" ||
            errorCode === "invalid_email" ||
            errorCode === "invalid_username" ||
            errorCode === "[jwt_auth] invalid_username" ||
            errorCode === "[jwt_auth] incorrect_password";

        // Use 401 for authentication errors, otherwise use response status or 500
        const statusCode = isAuthError ? 401 : error.response?.status || 500;

        return NextResponse.json(
            {
                error:
                    error.response?.data?.message ||
                    "Login failed. Please try again.",
                code: errorCode, // Include the error code for frontend handling
            },
            { status: statusCode },
        );
    }
}
