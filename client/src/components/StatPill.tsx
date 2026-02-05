import { cn } from "@/lib/utils";

export default function StatPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "primary" | "accent" | "success";
}) {
  const tones: Record<string, string> = {
    neutral:
      "bg-muted/70 text-foreground border-border/60",
    primary:
      "bg-primary/10 text-foreground border-primary/25",
    accent:
      "bg-accent/10 text-foreground border-accent/25",
    success:
      "bg-[hsl(159_70%_40%/0.12)] text-foreground border-[hsl(159_70%_40%/0.28)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        "shadow-sm",
        tones[tone],
      )}
    >
      <span className="text-muted-foreground font-semibold">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
