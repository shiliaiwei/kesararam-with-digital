import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const errorLog = await req.json();
    
    // Log to server console
    console.error('Client Error:', {
      timestamp: errorLog.timestamp,
      type: errorLog.type,
      message: errorLog.message,
      url: errorLog.url,
      stack: errorLog.stack,
      userAgent: errorLog.userAgent,
      additionalInfo: errorLog.additionalInfo,
    });

    // You can also save to database or external service here
    // Example: await db.insert(errorLogs).values(errorLog);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging endpoint failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
