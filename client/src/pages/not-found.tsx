import { Link } from "wouter";
import { ArrowLeft, FileX2 } from "lucide-react";
import AppShell from "@/components/AppShell";
import Seo from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppShell>
      <Seo title="Not found — DeepKlarity Wiki Quiz" description="The page you requested does not exist." />

      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-[0_14px_55px_rgba(15,23,42,0.07)]">
          <div className="p-8">
            <div className="grid place-items-center h-14 w-14 rounded-2xl border border-border/60 bg-muted/20">
              <FileX2 className="h-7 w-7 text-foreground/80" />
            </div>

            <h1 className="mt-5 text-3xl">Page not found</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
              The link might be outdated, or the page may have moved.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto rounded-xl bg-foreground text-background hover:bg-foreground/90">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Generate
                </Button>
              </Link>

              <Link href="/history" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto rounded-xl">
                  View past quizzes
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
