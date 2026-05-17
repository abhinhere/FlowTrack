import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 400 });
    }

    const base64Key = Buffer.from(apiKey).toString("base64");

    const response = await fetch("https://wakatime.com/api/v1/users/current/summaries?start=today&end=today", {
      headers: {
        Authorization: `Basic ${base64Key}`
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from WakaTime" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
