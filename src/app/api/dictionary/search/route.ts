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
        `https://minhqnd.com/api/dictionary/lookup?word=${word}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();

      return NextResponse.json(
        {
          data: {
            ...data,
            results: data.results?.length
              ? data.results.map((result: any) => {
                  // Group meanings by definition_lang
                  const groupedMeanings = result.meanings?.reduce(
                    (acc: Record<string, any[]>, meaning: any) => {
                      const lang = meaning.definition_lang || "other";
                      if (!acc[lang]) {
                        acc[lang] = [];
                      }
                      acc[lang].push(meaning);
                      return acc;
                    },
                    {} as Record<string, any[]>
                  );

                  return {
                    ...result,
                    audio: result.audio ? "https://minhqnd.com" + result.audio : undefined,
                    meanings: groupedMeanings || result.meanings,
                  };
                })
              : [],
          },
        },
        { status: 200 }
      );
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

// demo data response if success: {
//   "exists": true,
//   "word": "tau",
//   "results": [
//     {
//       "lang_code": "vi",
//       "lang_name": "Tiếng Việt",
//       "audio": "/api/dictionary/tts?word=tau&lang=vi",
//       "meanings": [
//         {
//           "definition": "tên một con chữ [τ, viết hoa T] của chữ cái Hi Lạp",
//           "definition_lang": "vi",
//           "example": "Trong toán học và vật lý, ký hiệu tau thường được dùng để biểu thị các hằng số hoặc thời gian.",
//           "pos": "Danh từ",
//           "sub_pos": "Danh từ chỉ vật, hiện tượng",
//           "source": "Tiếng Việt Thông Dụng"
//         },
//         {
//           "definition": "North Central Vietnam form of tao (“I/me”)",
//           "definition_lang": "en",
//           "example": null,
//           "pos": "Đại từ",
//           "sub_pos": null,
//           "source": "Wiktionary EN"
//         }
//       ],
//       "pronunciations": [
//         {
//           "ipa": "[ta(ː)w˧˧]",
//           "region": "Saigon"
//         },
//         {
//           "ipa": "[taw˧˥]",
//           "region": "Vinh"
//         },
//         {
//           "ipa": "[taw˧˧]",
//           "region": "Huế"
//         },
//         {
//           "ipa": "[taw˧˧]",
//           "region": "Hà-Nội"
//         }
//       ],
//       "translations": [],
//       "relations": []
//     },
//     {
//       "lang_code": "bnn",
//       "lang_name": "Tiếng Bunun",
//       "audio": "/api/dictionary/tts?word=tau&lang=bnn",
//       "meanings": [
//         {
//           "definition": "ba.",
//           "definition_lang": "vi",
//           "example": null,
//           "pos": "Lượng từ",
//           "sub_pos": null,
//           "source": "Wiktionary"
//         },
//         {
//           "definition": "đau.",
//           "definition_lang": "vi",
//           "example": null,
//           "pos": "Tính từ",
//           "sub_pos": null,
//           "source": "Wiktionary"
//         }
//       ],
//       "pronunciations": [],
//       "translations": [],
//       "relations": []
//     },
//     {
//       "lang_code": "fr",
//       "lang_name": "Tiếng Pháp",
//       "audio": "/api/dictionary/tts?word=tau&lang=fr",
//       "meanings": [
//         {
//           "definition": "Tô (chữ cái Hy Lạp).",
//           "definition_lang": "vi",
//           "example": null,
//           "pos": "Danh từ",
//           "sub_pos": null,
//           "source": "Wiktionary"
//         },
//         {
//           "definition": "Hình chữ T (ở huy hiệu).",
//           "definition_lang": "vi",
//           "example": null,
//           "pos": "Danh từ",
//           "sub_pos": null,
//           "source": "Wiktionary"
//         }
//       ],
//       "pronunciations": [
//         {
//           "ipa": "/tɔ/",
//           "region": null
//         }
//       ],
//       "translations": [],
//       "relations": []
//     },
//     {
//       "lang_code": "mng",
//       "lang_name": "Tiếng M'Nông Đông",
//       "audio": "/api/dictionary/tts?word=tau&lang=mng",
//       "meanings": [
//         {
//           "definition": "da.",
//           "definition_lang": "vi",
//           "example": null,
//           "pos": "Danh từ",
//           "sub_pos": null,
//           "source": "Wiktionary"
//         }
//       ],
//       "pronunciations": [],
//       "translations": [],
//       "relations": []
//     },
//     {
//       "lang_code": "tea",
//       "lang_name": "Tiếng Temiar",
//       "audio": "/api/dictionary/tts?word=tau&lang=tea",
//       "meanings": [
//         {
//           "definition": "chồng.",
//           "definition_lang": "vi",
//           "example": null,
//           "pos": "Danh từ",
//           "sub_pos": null,
//           "source": "Wiktionary"
//         }
//       ],
//       "pronunciations": [
//         {
//           "ipa": "/tau/",
//           "region": null
//         }
//       ],
//       "translations": [],
//       "relations": []
//     }
//   ]
// }
// demo data response if error: {
//     "exists": false,
// }
