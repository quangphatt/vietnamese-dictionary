import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get("word");
    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

    try {
      const response = await fetch(
        `https://minhqnd.com/api/dictionary/lookup?word=${encodeURIComponent(
          word
        )}`,
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
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 408 }
        );
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

// demo data response if success: {
//     "exists": true,
//     "word": "học sinh",
//     "meanings": [
//         {
//             "definition": "người học ở bậc phổ thông",
//             "example": "học sinh tiểu học ~ thời học sinh",
//             "pos": "Danh từ",
//             "sub_pos": "Danh từ chỉ vật, hiện tượng"
//         }
//     ]
// }
// demo data response if error: {
//     "exists": false,
// }
