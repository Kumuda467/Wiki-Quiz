import { cn } from "@/lib/utils";

export default function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: "easy" | "medium" | "hard";
  className?: string;
}) {
  const map = {
    easy: "bg-[hsl(159_70%_40%/0.14)] border-[hsl(159_70%_40%/0.26)] text-foreground",
    medium: "bg-[hsl(39_96%_55%/0.16)] border-[hsl(39_96%_55%/0.28)] text-foreground",
    hard: "bg-[hsl(0_84%_56%/0.12)] border-[hsl(0_84%_56%/0.26)] text-foreground",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        map[difficulty],
        className,
      )}
    >
      {difficulty.toUpperCase()}
    </span>
  );
}
