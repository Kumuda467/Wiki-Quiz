import { ExternalLink, Hash, Link as LinkIcon, Users, Building2, MapPin } from "lucide-react";
import type { WikiQuizResponse } from "@shared/routes";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import StatPill from "@/components/StatPill";

function epochToDate(epochSeconds: number) {
  const d = new Date(epochSeconds * 1000);
  return d;
}

export default function WikiQuizDetails({
  quiz,
  variant = "full",
}: {
  quiz: WikiQuizResponse;
  variant?: "full" | "compact";
}) {
  const created = epochToDate(quiz.createdAt);

  const entityCards = [
    { label: "People", items: quiz.keyEntities.people, icon: Users },
    { label: "Organizations", items: quiz.keyEntities.organizations, icon: Building2 },
    { label: "Locations", items: quiz.keyEntities.locations, icon: MapPin },
  ] as const;

  return (
    <div className={cn("animate-float-in", variant === "compact" ? "space-y-4" : "space-y-6")}>
      <Card className="rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]">
        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl text-balance">{quiz.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatPill label="Created" value={created.toLocaleString()} />
                <StatPill label="Questions" value={quiz.quiz.length} tone="primary" />
                <StatPill label="Hash" value={quiz.contentHash.slice(0, 10)} tone="neutral" />
              </div>
              <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                {quiz.summary}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <a
                href={quiz.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                  "border border-border/60 bg-muted/25 hover:bg-muted/40 transition-all",
                  "focus:outline-none focus:ring-4 focus:ring-ring/15",
                )}
              >
                <ExternalLink className="h-4 w-4" />
                Open article
              </a>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                  "border border-border/60 bg-card hover:bg-muted/25 transition-all",
                  "focus:outline-none focus:ring-4 focus:ring-ring/15",
                )}
                onClick={async () => {
                  await navigator.clipboard.writeText(quiz.url);
                }}
                title="Copy URL"
              >
                <LinkIcon className="h-4 w-4" />
                Copy URL
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
                  "border border-border/60 bg-card hover:bg-muted/25 transition-all",
                  "focus:outline-none focus:ring-4 focus:ring-ring/15",
                )}
                onClick={async () => {
                  await navigator.clipboard.writeText(quiz.contentHash);
                }}
                title="Copy content hash"
              >
                <Hash className="h-4 w-4" />
                Copy hash
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {entityCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card
              key={c.label}
              className="rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="grid place-items-center h-10 w-10 rounded-2xl bg-muted/40 border border-border/60">
                      <Icon className="h-5 w-5 text-foreground/80" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.items.length} found</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {c.items.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No entities detected.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {c.items.slice(0, 14).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                    {c.items.length > 14 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{c.items.length - 14} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]">
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-2xl">Sections</h2>
            <StatPill label="Count" value={quiz.sections.length} />
          </div>
          <Separator className="my-4" />
          {quiz.sections.length === 0 ? (
            <div className="text-sm text-muted-foreground">No sections were returned.</div>
          ) : (
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {quiz.sections.map((s, i) => (
                <li
                  key={`${s}-${i}`}
                  className={cn(
                    "rounded-xl border border-border/60 bg-muted/15 px-3.5 py-3",
                    "text-sm font-semibold",
                  )}
                >
                  <span className="text-muted-foreground mr-2">{String(i + 1).padStart(2, "0")}.</span>
                  {s}
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>

      <Card className="rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]">
        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-2xl">Related topics</h2>
            <StatPill label="Count" value={quiz.relatedTopics.length} tone="accent" />
          </div>
          <Separator className="my-4" />

          {quiz.relatedTopics.length === 0 ? (
            <div className="text-sm text-muted-foreground">No related topics were returned.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {quiz.relatedTopics.map((t) => {
                const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(t.replaceAll(" ", "_"))}`;
                const searchUrl = `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(t)}`;
                return (
                  <div key={t} className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5">
                    <span className="text-xs font-semibold">{t}</span>
                    <a
                      href={wikiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Open article"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Search Wikipedia"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
