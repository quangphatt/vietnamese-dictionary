import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    if (!q) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

    try {
      const response = await fetch(
        `https://minhqnd.com/api/dictionary/suggest?q=${q}&limit=10`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      return NextResponse.json({ data }, { status: 200 });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({ error: "Request timeout" }, { status: 408 });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error fetching dictionary", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

// Demo data response: {
//   "suggestions": ["học", "học bạ", "học bổng", "học hành", "học sinh"]
// }
