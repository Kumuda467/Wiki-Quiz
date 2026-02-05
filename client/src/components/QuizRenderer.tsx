import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Circle, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuizQuestion, WikiQuizResponse } from "@shared/routes";
import DifficultyBadge from "@/components/DifficultyBadge";
import StatPill from "@/components/StatPill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

type Mode = "study" | "take";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function QuizRenderer({
  quiz,
  mode,
  onModeChange,
  "data-testid": testId,
}: {
  quiz: WikiQuizResponse;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  "data-testid"?: string;
}) {
  const questions = quiz.quiz;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (normalize(answers[idx] ?? "") === normalize(q.answer)) correct += 1;
    });
    return { correct, total: questions.length };
  }, [answers, questions]);

  const canSubmit = useMemo(() => {
    if (mode !== "take") return false;
    return questions.length > 0 && questions.every((_q, idx) => !!answers[idx]);
  }, [answers, mode, questions]);

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <section className="mt-6" data-testid={testId}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl text-balance">Quiz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Study mode shows answers & explanations. Take mode hides them until you submit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatPill label="Questions" value={questions.length} />
          {mode === "take" && submitted && (
            <StatPill
              label="Score"
              value={`${score.correct}/${score.total}`}
              tone={score.correct === score.total ? "success" : "primary"}
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant={mode === "study" ? "default" : "outline"}
              className={cn(
                "rounded-xl",
                mode === "study" &&
                  "bg-foreground text-background hover:bg-foreground/90",
              )}
              onClick={() => {
                onModeChange("study");
                reset();
              }}
              data-testid="take-quiz-study"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Study
            </Button>
            <Button
              variant={mode === "take" ? "default" : "outline"}
              className={cn(
                "rounded-xl",
                mode === "take" &&
                  "bg-gradient-to-r from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25",
              )}
              onClick={() => {
                onModeChange("take");
                reset();
              }}
              data-testid="take-quiz-take"
            >
              Take Quiz
            </Button>
          </div>

          {mode === "take" && (
            <>
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={!canSubmit || submitted}
                onClick={() => setSubmitted(true)}
                data-testid="take-quiz-submit"
              >
                Submit
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={reset}
                data-testid="take-quiz-reset"
              >
                Reset
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {questions.map((q: QuizQuestion, idx: number) => {
          const selected = answers[idx];
          const isCorrect = normalize(selected ?? "") === normalize(q.answer);

          return (
            <Card
              key={idx}
              className={cn(
                "rounded-2xl border border-card-border bg-card/80 backdrop-blur",
                "shadow-[0_14px_55px_rgba(15,23,42,0.07)]",
                "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_70px_rgba(15,23,42,0.10)]",
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground font-semibold tracking-wide">
                      Question {idx + 1}
                    </div>
                    <h3 className="mt-1 text-lg leading-snug">{q.question}</h3>
                  </div>
                  <DifficultyBadge difficulty={q.difficulty} />
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const chosen = selected === opt;

                    const showResult = mode === "take" && submitted;
                    const isAnswer = normalize(opt) === normalize(q.answer);

                    const tone = showResult
                      ? isAnswer
                        ? "border-[hsl(159_70%_40%/0.40)] bg-[hsl(159_70%_40%/0.10)]"
                        : chosen && !isCorrect
                          ? "border-[hsl(0_84%_56%/0.40)] bg-[hsl(0_84%_56%/0.08)]"
                          : "border-border/70 bg-muted/30"
                      : chosen
                        ? "border-primary/40 bg-primary/10"
                        : "border-border/70 bg-muted/20 hover:bg-muted/35 hover:border-border";

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={cn(
                          "group relative w-full text-left rounded-xl border px-3.5 py-3",
                          "transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/15",
                          tone,
                          mode === "take" && submitted && "cursor-default",
                        )}
                        onClick={() => {
                          if (mode === "take" && submitted) return;
                          setAnswers((prev) => ({ ...prev, [idx]: opt }));
                          if (mode === "study") return;
                        }}
                        data-testid={`quiz-q${idx}-opt${optIdx}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {chosen ? (
                              <Circle className="h-4 w-4 text-primary fill-primary/30" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground/50" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="text-sm font-semibold leading-snug">{opt}</div>

                            {mode === "study" && normalize(opt) === normalize(q.answer) && (
                              <div className="mt-1 text-xs font-semibold text-[hsl(159_70%_35%)]">
                                Correct answer
                              </div>
                            )}

                            {mode === "take" && submitted && (
                              <div className="mt-1 flex items-center gap-2 text-xs">
                                {isAnswer ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[hsl(159_70%_35%)]">
                                    <Check className="h-3.5 w-3.5" /> Correct
                                  </span>
                                ) : chosen ? (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[hsl(0_84%_52%)]">
                                    <X className="h-3.5 w-3.5" /> Your pick
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <Collapsible defaultOpen={mode === "study"}>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "w-full inline-flex items-center justify-between gap-2 rounded-xl",
                          "bg-muted/25 hover:bg-muted/40 border border-border/60 px-3.5 py-2.5",
                          "transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-ring/15",
                        )}
                        data-testid={`quiz-q${idx}-explain-toggle`}
                      >
                        <span className="text-sm font-semibold">
                          Explanation{mode === "take" && !submitted ? " (hidden)" : ""}
                        </span>
                        <span className="text-muted-foreground">
                          <ChevronDown className="h-4 w-4 data-[state=open]:hidden" />
                          <ChevronUp className="h-4 w-4 hidden data-[state=open]:block" />
                        </span>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-3 rounded-xl border border-border/60 bg-card/70 px-3.5 py-3 text-sm leading-relaxed text-foreground/90">
                        {mode === "take" && !submitted ? (
                          <span className="text-muted-foreground">
                            Submit to reveal the explanation.
                          </span>
                        ) : (
                          q.explanation
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
