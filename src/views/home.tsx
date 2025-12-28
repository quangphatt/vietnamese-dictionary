"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/Logo";

interface Meaning {
  definition: string;
  example?: string;
  pos: string;
  sub_pos?: string;
}

interface DictionaryResponse {
  data: {
    exists: boolean;
    word?: string;
    meanings?: Meaning[];
  };
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryResponse["data"] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const performSearch = async (word: string) => {
    if (!word.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/dictionary?word=${encodeURIComponent(word.trim())}`
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
            Từ Điển Tiếng Việt
          </h1>
          <p className="text-muted-foreground">
            Tra cứu từ điển tiếng Việt trực tuyến
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
              <p className="text-destructive">{error}</p>
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
        {result && result.exists && result.word && result.meanings && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{result.word}</CardTitle>
              </CardHeader>
            </Card>

            {(() => {
              // Group meanings by pos
              const groupedMeanings = result.meanings.reduce(
                (acc, meaning) => {
                  const pos = meaning.pos || "Khác";
                  if (!acc[pos]) {
                    acc[pos] = [];
                  }
                  acc[pos].push(meaning);
                  return acc;
                },
                {} as Record<string, typeof result.meanings>
              );

              return Object.entries(groupedMeanings).map(([pos, meanings]) => (
                <Card key={pos}>
                  <CardHeader>
                    <CardTitle className="text-xl">{pos}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {meanings.map((meaning, index) => (
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
                              <span className="font-medium">Ví dụ: </span>
                              {meaning.example}
                            </p>
                          </div>
                        )}
                        {index < meanings.length - 1 && (
                          <div className="border-t border-border pt-4" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ));
            })()}
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
