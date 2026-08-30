import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    return new NextResponse("did:plc:7zm67iz4hjqrk6psvrcpecxx", {
        status: 200,
        headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache",
        },
    });
}
