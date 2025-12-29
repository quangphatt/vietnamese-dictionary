"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, X, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

interface Meaning {
  definition: string;
  example?: string;
  pos: string;
  sub_pos?: string;
  definition_lang?: string;
}

interface Pronunciation {
  ipa: string;
  region?: string;
}

interface Translation {
  lang_code: string;
  translation: string;
  lang_name: string;
  definition_lang?: string;
}

interface Relation {
  related_word: string;
  relation_type: string;
}

interface DictionaryResult {
  lang_code: string;
  lang_name: string;
  audio?: string;
  meanings: Meaning[] | Record<string, Meaning[]>;
  pronunciations?: Pronunciation[];
  translations?: Translation[];
  relations?: Relation[];
}

interface DictionaryResponse {
  data: {
    exists: boolean;
    word?: string;
    results?: DictionaryResult[];
  };
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showOtherPronunciations, setShowOtherPronunciations] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<number>(0);
  const resultRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const performSearch = async (word: string) => {
    if (!word.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/dictionary/search?word=${encodeURIComponent(word.trim())}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dictionary data");
      }

      const data: DictionaryResponse = await response.json();
      setResult(data.data);
    } catch (err) {
      setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    const trimmedWord = searchTerm.trim();
    const encodedWord = encodeURIComponent(trimmedWord);
    const currentSearchParam = searchParams.get("search");

    // Only make API request if the new value is different from the current one
    if (currentSearchParam !== encodedWord) {
      // Update URL with search query
      const params = new URLSearchParams(searchParams.toString());
      params.set("search", encodedWord);
      router.push(`?${params.toString()}`);

      // Only call API if value is different
      await performSearch(trimmedWord);
    }
  };

  // Initialize from URL search param
  useEffect(() => {
    if (initialized) return;

    const searchParam = searchParams.get("search");
    if (searchParam) {
      const decodedWord = decodeURIComponent(searchParam);
      setSearchTerm(decodedWord);
      performSearch(decodedWord);
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Logo size={120} className="mb-2" />
          <h1 className="text-4xl font-bold text-foreground">
            Từ Điển Tiếng Việt, Anh - Việt
          </h1>
          <p className="text-muted-foreground">
            Tra cứu từ điển trực tuyến
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Nhập từ cần tra cứu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-10 w-full pr-10 text-base sm:text-lg"
              disabled={loading}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setResult(null);
                  setError(null);
                  // Clear URL search parameter
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("search");
                  const newUrl = params.toString()
                    ? `?${params.toString()}`
                    : window.location.pathname;
                  router.push(newUrl);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                disabled={loading}
                aria-label="Clear input"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !searchTerm.trim()}
            size="lg"
            className="h-10 w-full px-6 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                <span className="hidden sm:inline">Đang tìm...</span>
                <span className="sm:hidden">Đang tìm</span>
              </>
            ) : (
              <>
                <Search className="mr-2 size-4" />
                Tìm kiếm
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <p className="text-destructive text-center">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Not Found Message */}
        {result && !result.exists && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Không tìm thấy từ &quot;{searchTerm}&quot; trong từ điển.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && result.exists && result.word && result.results && (
          <div className="space-y-4">
            {/* Tabs for multiple results */}
            {result.results.length > 1 && (
              <div className="sticky top-0 z-10 bg-background border-b border-border pb-1">
                <div className="flex gap-1 overflow-x-auto py-2">
                  {result.results.map((activeResult, resultIndex) => (
                    <button
                      key={resultIndex}
                      onClick={() => {
                        setActiveTab(resultIndex);
                        const element = resultRefs.current[resultIndex];
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        activeTab === resultIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {activeResult.lang_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {result.results.map((activeResult, resultIndex) => (
              <div
                key={resultIndex}
                ref={(el) => {
                  resultRefs.current[resultIndex] = el;
                }}
                className="space-y-4 scroll-mt-20"
              >
                <Card>
                  <CardHeader className="relative">
                    {activeResult.audio && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const audio = new Audio(activeResult.audio!);
                          audio.play().catch((err) => {
                            console.error("Error playing audio", err);
                          });
                        }}
                        aria-label="Phát âm"
                        className="absolute right-6 top-6"
                      >
                        <Volume2 className="size-5" />
                      </Button>
                    )}
                    <div className="pr-12">
                      <CardTitle className="text-3xl">
                        {resultIndex === 0 ? result.word : `${result.word} (${activeResult.lang_name})`}
                      </CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeResult.lang_name}
                      </p>
                        {(() => {
                          const pronunciations = activeResult.pronunciations || [];
                          if (pronunciations.length === 0) return null;

                          // Tìm phiên âm ưu tiên (Hà-Nội hoặc UK)
                          const priorityRegions = ["Hà-Nội", "UK"];
                          const mainPronunciation =
                            pronunciations.find((p) =>
                              priorityRegions.some((region) =>
                                p.region?.includes(region)
                              )
                            ) || pronunciations[0];
                          const otherPronunciations = pronunciations.filter(
                            (p) => p !== mainPronunciation
                          );

                          return (
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-muted-foreground">
                                  /{mainPronunciation.ipa}/
                                </span>
                                {mainPronunciation.region && (
                                  <span className="text-xs text-muted-foreground">
                                    ({mainPronunciation.region})
                                  </span>
                                )}
                              </div>
                              {otherPronunciations.length > 0 && (
                                <div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setShowOtherPronunciations((prev) => ({
                                        ...prev,
                                        [resultIndex]: !prev[resultIndex],
                                      }))
                                    }
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {showOtherPronunciations[resultIndex] ? (
                                      <>
                                        <ChevronUp className="size-3" />
                                        Ẩn phiên âm khác
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="size-3" />
                                        Phiên âm khác ({otherPronunciations.length})
                                      </>
                                    )}
                                  </button>
                                  {showOtherPronunciations[resultIndex] && (
                                    <div className="mt-2 space-y-1 pl-4">
                                      {otherPronunciations.map((p, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-2 text-xs"
                                        >
                                          <span className="font-mono text-muted-foreground">
                                            /{p.ipa}/
                                          </span>
                                          {p.region && (
                                            <span className="text-muted-foreground">
                                              ({p.region})
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </CardHeader>
                  </Card>

                {/* Meanings grouped by definition_lang, then by pos */}
                {(() => {
                  // Handle both array (legacy) and object (grouped by definition_lang) formats
                  const meaningsArray = Array.isArray(activeResult.meanings)
                    ? activeResult.meanings
                    : Object.values(activeResult.meanings).flat();

                  const langNameMap: Record<string, string> = {
                    vi: "Tiếng Việt",
                    en: "Tiếng Anh",
                  };

                  // First group by definition_lang
                  const groupedByLang = meaningsArray.reduce(
                    (acc, meaning) => {
                      const definitionLang = meaning.definition_lang || "";
                      const lang = definitionLang
                        ? langNameMap[definitionLang] || definitionLang
                        : "Khác";
                      if (!acc[lang]) {
                        acc[lang] = [];
                      }
                      acc[lang].push(meaning);
                      return acc;
                    },
                    {} as Record<string, Meaning[]>
                  );

                  // Then group each lang group by pos
                  return Object.entries(groupedByLang).map(([lang, meanings]) => {
                    const groupedMeanings = meanings.reduce(
                      (acc, meaning) => {
                        const pos = meaning.pos || "Khác";
                        if (!acc[pos]) {
                          acc[pos] = [];
                        }
                        acc[pos].push(meaning);
                        return acc;
                      },
                      {} as Record<string, Meaning[]>
                    );

                    return (
                      <Card key={lang}>
                        <CardHeader>
                          <CardTitle className="text-xl">Nghĩa {lang}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {Object.entries(groupedMeanings).map(
                            ([pos, posMeanings]) => (
                              <div key={`${lang}-${pos}`} className="space-y-4">
                                <div>
                                  <CardTitle className="text-lg">{pos}</CardTitle>
                                </div>
                                <div className="space-y-4">
                                  {posMeanings.map((meaning, index) => (
                                    <div key={index} className="space-y-3">
                                      {meaning.sub_pos && (
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                                            {meaning.sub_pos}
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-base leading-relaxed">
                                          {meaning.definition}
                                        </p>
                                      </div>
                                      {meaning.example && (
                                        <div className="rounded-md bg-muted p-3">
                                          <p className="text-sm text-muted-foreground">
                                            <span className="font-medium">
                                              Ví dụ:{" "}
                                            </span>
                                            {meaning.example}
                                          </p>
                                        </div>
                                      )}
                                      {index < posMeanings.length - 1 && (
                                        <div className="border-t border-border pt-4" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                {Object.keys(groupedMeanings).indexOf(pos) < Object.keys(groupedMeanings).length - 1 && (
                                  <div className="border-t border-border pt-4" />
                                )}
                              </div>
                            )
                          )}
                        </CardContent>
                      </Card>
                    );
                  });
                })()}

                {/* Translations */}
                {activeResult.translations &&
                  activeResult.translations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          Dịch nghĩa
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {activeResult.translations.map((t, idx) => (
                          <div
                            key={idx}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-sm"
                          >
                            <span className="font-medium">
                              {t.translation}
                            </span>
                            <span className="text-muted-foreground">
                              {t.lang_name}
                            </span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                {/* Related words grouped by relation_type */}
                {activeResult.relations &&
                  activeResult.relations.length > 0 && (
                    <>
                      {(() => {
                        const groupedRelations = activeResult.relations.reduce(
                          (acc, relation) => {
                            const type = relation.relation_type || "Khác";
                            if (!acc[type]) {
                              acc[type] = [];
                            }
                            acc[type].push(relation);
                            return acc;
                          },
                          {} as Record<string, typeof activeResult.relations>
                        );

                        return Object.entries(groupedRelations).map(
                          ([type, relations]) => (
                            <Card key={type}>
                              <CardHeader>
                                <CardTitle className="text-xl">{type}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {relations.map((r, idx) => (
                                    <a
                                      key={idx}
                                      href={`?search=${encodeURIComponent(r.related_word)}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSearchTerm(r.related_word);
                                        const params = new URLSearchParams();
                                        params.set(
                                          "search",
                                          encodeURIComponent(r.related_word)
                                        );
                                        router.push(`?${params.toString()}`);
                                        performSearch(r.related_word);
                                      }}
                                      className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                      {r.related_word}
                                    </a>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        );
                      })()}
                    </>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nhập từ cần tra cứu vào ô tìm kiếm ở trên.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
