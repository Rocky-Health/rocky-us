import { NextResponse } from "next/server";

const privateKey = process.env.RSA_PRIVATE_KEY;

export async function GET(request) {
    try {
        return NextResponse.json({ thereIsPrivateKey: !!privateKey });
    } catch (error) {
        return NextResponse.json(
            { error: error.message, thereIsPrivateKey: false },
            { status: 500 },
        );
    }
}
