import { NextRequest, NextResponse } from "next/server";

const LEETCODE_QUERY = `
  query getUserProfile($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Missing LeetCode Username" }, { status: 400 });
    }

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com"
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username }
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from LeetCode" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
