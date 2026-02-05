import { Link, useLocation } from "wouter";
import { BookOpenCheck, History, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const tabs = [
  { href: "/", label: "Generate", icon: Sparkles },
  { href: "/history", label: "Past Quizzes", icon: History },
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-mesh grain">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
      </div>

      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-muted/60 transition-colors"
            >
              <div
                className={cn(
                  "grid place-items-center rounded-2xl h-11 w-11",
                  "bg-gradient-to-br from-primary/14 via-accent/10 to-transparent",
                  "border border-border/70 shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
                )}
              >
                <BookOpenCheck className="h-5 w-5 text-foreground/90" />
              </div>
              <div className="leading-tight">
                <div className="text-base sm:text-lg font-semibold tracking-tight">
                  DeepKlarity Wiki Quiz
                </div>
                <div className="text-xs text-muted-foreground">
                  Minimal, fast, and surprisingly smart.
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="outline"
                className="hidden sm:inline-flex rounded-xl"
                onClick={() => window.open("https://en.wikipedia.org", "_blank", "noopener,noreferrer")}
              >
                Open Wikipedia
              </Button>
            </div>
          </div>

          <nav className="mt-5 flex items-center gap-2">
            {tabs.map((t) => {
              const active = location === t.href;
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold",
                    "transition-all duration-200",
                    active
                      ? "bg-foreground text-background shadow-[0_16px_55px_rgba(15,23,42,0.18)]"
                      : "bg-card/70 backdrop-blur border border-border/60 text-foreground hover:bg-card hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(15,23,42,0.10)]",
                  )}
                >
                  <Icon className={cn("h-4 w-4", active ? "opacity-95" : "opacity-70")} />
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </header>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {children}
        </div>
      </main>

      <footer className="relative z-10 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur px-5 py-4 text-sm text-muted-foreground">
            Tip: paste any Wikipedia article URL (not a search page). Generate, then switch to{" "}
            <span className="text-foreground/90 font-semibold">Take Quiz</span> to test yourself.
          </div>
        </div>
      </footer>
    </div>
  );
}
