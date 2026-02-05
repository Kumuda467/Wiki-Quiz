import { useMemo, useState } from "react";
import { Calendar, ExternalLink, Search, SquareArrowOutUpRight } from "lucide-react";
import { Link } from "wouter";
import Seo from "@/components/Seo";
import AppShell from "@/components/AppShell";
import { useWikiHistory, useWikiQuiz } from "@/hooks/use-wiki";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import WikiQuizDetails from "@/components/WikiQuizDetails";
import QuizRenderer from "@/components/QuizRenderer";

function formatEpoch(epoch: number) {
  return new Date(epoch * 1000).toLocaleString();
}

export default function HistoryPage() {
  const [q, setQ] = useState("");
  const history = useWikiHistory(q.trim() || undefined);

  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const details = useWikiQuiz(selectedId ?? undefined);

  const items = useMemo(() => history.data ?? [], [history.data]);

  return (
    <AppShell>
      <Seo
        title="Past Quizzes — DeepKlarity Wiki Quiz"
        description="Browse previously generated quizzes. Search by title, open details, and revisit the quiz."
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl text-balance">Past quizzes</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Search your history and open any quiz in a read-only details modal.
          </p>
        </div>

        <div className="w-full md:w-[420px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title…"
              className="h-12 rounded-xl pl-10 bg-background/60 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
              data-testid="history-search"
            />
          </div>
        </div>
      </div>

      <Card className="mt-6 rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]">
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">History</div>
            <div className="text-xs text-muted-foreground font-semibold">
              {history.isFetching ? "Refreshing…" : `${items.length} items`}
            </div>
          </div>

          <Separator className="my-4" />

          {history.isError ? (
            <div className="text-sm text-[hsl(0_84%_52%)]">
              {(history.error as Error)?.message ?? "Failed to load history."}
            </div>
          ) : history.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-muted/25 shimmer" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-border/60 bg-muted/15 p-5 text-sm text-muted-foreground">
              No quizzes yet. Head to{" "}
              <Link href="/" className="text-foreground font-semibold hover:underline">
                Generate
              </Link>{" "}
              to create your first one.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/60">
              <div className="grid grid-cols-12 bg-muted/25 px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                <div className="col-span-6 md:col-span-6">Title</div>
                <div className="hidden md:block md:col-span-4">URL</div>
                <div className="col-span-6 md:col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y divide-border/60">
                {items.map((row, idx) => (
                  <div
                    key={row.id}
                    className={cn(
                      "grid grid-cols-12 items-center gap-3 px-4 py-3",
                      "bg-card/70 hover:bg-muted/20 transition-colors",
                    )}
                    data-testid={`history-row-${idx}`}
                  >
                    <div className="col-span-8 md:col-span-6 min-w-0">
                      <div className="text-sm font-semibold truncate">{row.title}</div>
                      <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatEpoch(row.createdAt)}
                      </div>
                    </div>

                    <div className="hidden md:block md:col-span-4 min-w-0">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
                        title={row.url}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="truncate">{row.url}</span>
                      </a>
                    </div>

                    <div className="col-span-4 md:col-span-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => {
                          setSelectedId(row.id);
                          setOpen(true);
                        }}
                        data-testid={`history-details-${idx}`}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => window.open(row.url, "_blank", "noopener,noreferrer")}
                        title="Open article"
                      >
                        <SquareArrowOutUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[calc(100vw-2rem)] sm:w-full rounded-2xl border border-border/60 bg-card/90 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl">Quiz details</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {details.isLoading ? (
              <div className="space-y-3">
                <div className="h-4 w-2/3 rounded bg-muted/40 shimmer" />
                <div className="h-4 w-full rounded bg-muted/30 shimmer" />
                <div className="h-64 w-full rounded-xl bg-muted/20 shimmer" />
              </div>
            ) : details.isError ? (
              <div className="rounded-xl border border-[hsl(0_84%_56%/0.25)] bg-[hsl(0_84%_56%/0.06)] p-4 text-sm">
                {(details.error as Error)?.message ?? "Failed to load quiz."}
              </div>
            ) : details.data ? (
              <div className="space-y-6 max-h-[72vh] overflow-auto pr-1">
                <WikiQuizDetails quiz={details.data} variant="compact" />
                <QuizRenderer
                  quiz={details.data}
                  mode="study"
                  onModeChange={() => {}}
                  data-testid="history-details-quiz"
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No quiz selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
