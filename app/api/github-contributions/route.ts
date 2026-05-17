import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 });
    }

    // Uses the public contributions API (reads the GitHub contribution graph)
    // Returns total commits per year and per day
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=all`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch contributions" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
