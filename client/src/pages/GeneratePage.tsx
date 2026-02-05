import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Sparkles, Wand2 } from "lucide-react";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import { useGenerateWikiQuiz, useWikiPreview } from "@/hooks/use-wiki";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import WikiQuizDetails from "@/components/WikiQuizDetails";
import QuizRenderer from "@/components/QuizRenderer";
import { useToast } from "@/hooks/use-toast";

function isWikipediaArticleUrl(url: string) {
  try {
    const u = new URL(url);
    const hostOk = u.hostname.endsWith("wikipedia.org");
    const pathOk = u.pathname.startsWith("/wiki/") && !u.pathname.includes(":");
    return hostOk && pathOk;
  } catch {
    return false;
  }
}

export default function GeneratePage() {
  const { toast } = useToast();

  const [url, setUrl] = useState("");
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [storeRawHtml, setStoreRawHtml] = useState(false);

  const normalizedUrl = useMemo(() => url.trim(), [url]);
  const urlLooksValid = useMemo(() => isWikipediaArticleUrl(normalizedUrl), [normalizedUrl]);

  const preview = useWikiPreview(urlLooksValid ? normalizedUrl : undefined);
  const generate = useGenerateWikiQuiz();

  const [result, setResult] = useState<ReturnType<typeof generate.data> | null>(null);
  const [mode, setMode] = useState<"study" | "take">("study");

  useEffect(() => {
    if (generate.isSuccess) {
      setResult(generate.data);
      setMode("study");
    }
  }, [generate.isSuccess, generate.data]);

  const onGenerate = async () => {
    setResult(null);

    if (!urlLooksValid) {
      toast({
        title: "Please paste a valid Wikipedia article URL",
        description: "Example: https://en.wikipedia.org/wiki/Alan_Turing",
        variant: "destructive",
      });
      return;
    }

    try {
      await generate.mutateAsync({ url: normalizedUrl, forceRegenerate, storeRawHtml });
      toast({
        title: "Quiz generated",
        description: "Scroll to explore sections, entities, and questions.",
      });
    } catch (e: any) {
      toast({
        title: "Generation failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <AppShell>
      <Seo
        title="AI Wiki Quiz Generator — DeepKlarity"
        description="Generate a structured quiz from any Wikipedia article. Preview key sections and entities, then test yourself in Take Quiz mode."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-7">
        <div className="lg:col-span-5">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Card className="rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]">
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl text-balance">Generate a quiz from Wikipedia</h1>
                    <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                      Paste a Wikipedia <span className="font-semibold text-foreground/90">article URL</span>. We’ll preview the article structure, then generate a quiz with difficulty,
                      options, and explanations.
                    </p>
                  </div>

                  <div className="hidden md:grid place-items-center h-11 w-11 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/15 via-accent/10 to-transparent">
                    <Wand2 className="h-5 w-5 text-foreground/85" />
                  </div>
                </div>

                <Separator className="my-5" />

                <label className="text-sm font-semibold">Wikipedia URL</label>
                <div className="mt-2">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://en.wikipedia.org/wiki/..."
                    className={cn(
                      "h-12 rounded-xl bg-background/60 border-2",
                      url.length > 0 && !urlLooksValid
                        ? "border-[hsl(0_84%_56%/0.40)] focus:border-[hsl(0_84%_56%/0.55)] focus:ring-[hsl(0_84%_56%/0.12)]"
                        : "border-border focus:border-primary focus:ring-primary/10",
                    )}
                    data-testid="url-input"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    Must be an article URL like <span className="font-semibold">/wiki/Topic</span> (not a search page).
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForceRegenerate((v) => !v)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3 text-left",
                      "hover:bg-muted/25 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/15",
                    )}
                    data-testid="force-regenerate"
                  >
                    <Checkbox checked={forceRegenerate} onCheckedChange={(v) => setForceRegenerate(Boolean(v))} />
                    <div>
                      <div className="text-sm font-semibold">Force regenerate</div>
                      <div className="text-xs text-muted-foreground">Ignore cached content if it exists.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStoreRawHtml((v) => !v)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3 text-left",
                      "hover:bg-muted/25 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/15",
                    )}
                    data-testid="store-raw-html"
                  >
                    <Checkbox checked={storeRawHtml} onCheckedChange={(v) => setStoreRawHtml(Boolean(v))} />
                    <div>
                      <div className="text-sm font-semibold">Store raw HTML</div>
                      <div className="text-xs text-muted-foreground">Useful for debugging extraction.</div>
                    </div>
                  </button>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    onClick={onGenerate}
                    disabled={generate.isPending}
                    className={cn(
                      "h-12 rounded-xl font-semibold",
                      "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20",
                      "hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5",
                      "active:translate-y-0 active:shadow-md",
                      "transition-all duration-200 ease-out",
                    )}
                    data-testid="generate-button"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {generate.isPending ? "Generating…" : "Generate Quiz"}
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 rounded-xl"
                    onClick={() => {
                      setUrl("");
                      setForceRegenerate(false);
                      setStoreRawHtml(false);
                      setResult(null);
                      toast({ title: "Cleared", description: "Ready for a new article." });
                    }}
                    data-testid="clear-button"
                  >
                    Clear
                  </Button>
                </div>

                <AnimatePresence>
                  {url.length > 0 && !urlLooksValid && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="mt-4 rounded-xl border border-[hsl(0_84%_56%/0.25)] bg-[hsl(0_84%_56%/0.06)] px-4 py-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-[hsl(0_84%_56%)]" />
                        <div className="text-sm">
                          <div className="font-semibold">URL doesn’t look like a Wikipedia article.</div>
                          <div className="text-muted-foreground text-xs mt-1">
                            Try a URL like: <span className="font-semibold">https://en.wikipedia.org/wiki/Alan_Turing</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>

            <Card className="rounded-2xl border border-card-border bg-card/70 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.06)]">
              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl">Preview</h2>
                  <div className="text-xs text-muted-foreground font-semibold">
                    {preview.isFetching ? "Fetching…" : preview.data ? "Ready" : "Paste a URL"}
                  </div>
                </div>

                <Separator className="my-4" />

                {preview.isError ? (
                  <div className="text-sm text-[hsl(0_84%_52%)]">
                    {(preview.error as Error)?.message ?? "Failed to load preview."}
                  </div>
                ) : preview.isLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 w-2/3 rounded bg-muted/40 shimmer" />
                    <div className="h-4 w-full rounded bg-muted/30 shimmer" />
                    <div className="h-4 w-5/6 rounded bg-muted/30 shimmer" />
                  </div>
                ) : preview.data ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">{preview.data.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                      {preview.data.summary}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-2">
                        <div className="text-xs text-muted-foreground font-semibold">Sections</div>
                        <div className="text-sm font-semibold">{preview.data.sections.length}</div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-2">
                        <div className="text-xs text-muted-foreground font-semibold">People</div>
                        <div className="text-sm font-semibold">{preview.data.keyEntities.people.length}</div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/15 px-3 py-2">
                        <div className="text-xs text-muted-foreground font-semibold">Orgs</div>
                        <div className="text-sm font-semibold">{preview.data.keyEntities.organizations.length}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Preview will appear here once you paste a valid Wikipedia article URL.
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="popLayout">
            {generate.isPending && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="rounded-2xl border border-card-border bg-card/70 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.06)]">
                  <div className="p-6">
                    <div className="text-sm font-semibold">Generating your quiz…</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      This may take a moment depending on the article size.
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="h-4 w-2/3 rounded bg-muted/40 shimmer" />
                      <div className="h-4 w-full rounded bg-muted/30 shimmer" />
                      <div className="h-4 w-5/6 rounded bg-muted/30 shimmer" />
                      <div className="h-40 w-full rounded-xl bg-muted/20 shimmer" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {generate.isError && !generate.isPending && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="rounded-2xl border border-[hsl(0_84%_56%/0.25)] bg-[hsl(0_84%_56%/0.06)]">
                  <div className="p-6">
                    <div className="text-base font-semibold">Generation failed</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {(generate.error as Error)?.message ?? "Unknown error"}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                className="space-y-6"
              >
                <WikiQuizDetails quiz={result} />
                <QuizRenderer quiz={result} mode={mode} onModeChange={setMode} data-testid="take-quiz-controls" />
              </motion.div>
            )}

            {!result && !generate.isPending && !generate.isError && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <Card className="rounded-2xl border border-card-border bg-card/70 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.06)]">
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-3">
                      <div className="grid place-items-center h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/18 via-accent/10 to-transparent border border-border/60">
                        <Sparkles className="h-5 w-5 text-foreground/85" />
                      </div>
                      <div>
                        <div className="text-lg md:text-xl font-semibold">Ready when you are.</div>
                        <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          Generate a quiz to see the full structured breakdown: article summary, key entities, sections, related topics, and question cards.
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
