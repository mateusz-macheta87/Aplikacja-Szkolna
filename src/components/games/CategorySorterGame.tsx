"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import type { LearningModule, SortItem, SortRound } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { computeStars, shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface CategorySorterGameProps {
  module: LearningModule;
  initialRoundIdx?: number;
  onBack: () => void;
  onComplete?: (stars: number) => void;
}

export function CategorySorterGame({
  module,
  initialRoundIdx = 0,
  onBack,
  onComplete,
}: CategorySorterGameProps) {
  const { recordGameCompletion, recordItemResult } = useProgress();
  const [roundIdx, setRoundIdx] = useState(initialRoundIdx);
  const round: SortRound | undefined = module.sortRounds[roundIdx];

  const [items, setItems] = useState<SortItem[]>(() =>
    round ? shuffleArray(round.items) : []
  );
  const [itemIdx, setItemIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<SortItem[]>([]);
  const [finished, setFinished] = useState(false);

  const current = items[itemIdx];

  const switchRound = (newRoundIdx: number) => {
    const nextRound = module.sortRounds[newRoundIdx];
    if (!nextRound) return;
    setRoundIdx(newRoundIdx);
    setItems(shuffleArray(nextRound.items));
    setItemIdx(0);
    setFeedback(null);
    setCorrectCount(0);
    setMistakes([]);
    setFinished(false);
  };

  useEffect(() => {
    if (!finished && current) {
      const t = setTimeout(() => {
        void audioManager.speak(current.audioText, {
          audioKey: current.audioKey,
          lang: module.speechLang,
        });
      }, 220);
      return () => clearTimeout(t);
    }
  }, [itemIdx, roundIdx, finished, current, module.speechLang]);

  const handleChooseBucket = (bucketId: string) => {
    if (!current || feedback) return;
    const isCorrect = current.bucketId === bucketId;
    recordItemResult(module.id, current.id, isCorrect);

    if (isCorrect) {
      audioManager.playSuccess();
      setCorrectCount((c) => c + 1);
      setFeedback({ correct: true, text: current.explanation });
    } else {
      audioManager.playGentleTryAgain();
      setMistakes((m) => (m.some((x) => x.id === current.id) ? m : [...m, current]));
      setFeedback({ correct: false, text: current.explanation });
    }
  };

  const handleNext = () => {
    if (itemIdx + 1 >= items.length) {
      const stars = computeStars(correctCount, items.length);
      if (onComplete) onComplete(stars);
      else recordGameCompletion(module.id, "sorter", stars);
      setFinished(true);
    } else {
      setItemIdx((i) => i + 1);
      setFeedback(null);
    }
  };

  if (!round) return null;

  if (finished) {
    return (
      <RoundSummary
        title={`Sortownia: „${round.title}” ukończona!`}
        correctCount={correctCount}
        totalCount={items.length}
        stars={computeStars(correctCount, items.length)}
        mistakesCount={mistakes.length}
        onPracticeMistakes={
          mistakes.length > 0
            ? () => {
                setItems(shuffleArray(mistakes));
                setItemIdx(0);
                setFeedback(null);
                setCorrectCount(0);
                setMistakes([]);
                setFinished(false);
              }
            : undefined
        }
        onReplay={() => switchRound(roundIdx)}
        onBack={onBack}
      />
    );
  }

  if (!current) return null;

  const toneBg: Record<string, string> = {
    amber: "var(--amber-soft)",
    blue: "var(--blue-soft)",
    green: "var(--green-soft)",
    coral: "var(--coral-soft)",
  };

  const toneBorder: Record<string, string> = {
    amber: "#F59E0B",
    blue: "#3B82F6",
    green: "#22C55E",
    coral: "#F43F5E",
  };

  return (
    <div className="game-stage">
      <GameHeader
        title="Seasons — Pory roku i Sortownia"
        onBack={onBack}
        currentStep={itemIdx + 1}
        totalSteps={items.length}
        score={correctCount}
        moduleForCheatSheet={module}
      />

      {/* Round Switcher */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        {module.sortRounds.map((r, i) => (
          <button
            key={r.id}
            type="button"
            className={`btn btn-soft ${i === roundIdx ? "btn-active-pill" : ""}`}
            onClick={() => switchRound(i)}
          >
            {r.title}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "var(--ink-secondary)", fontWeight: 700, margin: "0 0 20px", fontSize: "1.06rem" }}>
          {round.instruction}
        </p>

        {/* Active Item Card */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 36px",
            borderRadius: 24,
            background: "var(--surface-soft)",
            border: "3px solid var(--border-warm)",
            marginBottom: 24,
            minWidth: 260,
          }}
        >
          {current.visual && <StoryVisual visual={current.visual} size={118} />}
          <div className="font-display" style={{ fontSize: "2rem", fontWeight: 700, marginTop: 6 }}>
            {current.label}
          </div>
          {current.sublabel && (
            <div style={{ color: "var(--ink-secondary)", fontWeight: 700, marginBottom: 12 }}>
              ({current.sublabel})
            </div>
          )}
          <AudioButton
            text={current.audioText}
            audioKey={current.audioKey}
            lang={module.speechLang}
            label="Posłuchaj"
            showSlowOption={false}
          />
        </div>

        {/* Two Big Buckets */}
        <div className="grid-2">
          {round.buckets.map((bucket) => (
            <button
              key={bucket.id}
              type="button"
              className="option-tile"
              disabled={Boolean(feedback)}
              onClick={() => handleChooseBucket(bucket.id)}
              style={{
                background: toneBg[bucket.tone],
                borderColor: toneBorder[bucket.tone],
                minHeight: 126,
              }}
            >
              <span className="font-display" style={{ fontSize: "1.45rem" }}>
                {bucket.label}
              </span>
              <span style={{ fontSize: "0.96rem", color: "var(--ink-secondary)", fontWeight: 700 }}>
                {bucket.description}
              </span>
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`feedback-banner ${feedback.correct ? "success" : "hint"}`}
            style={{ textAlign: "left" }}
          >
            {feedback.correct ? <CheckCircle2 size={28} /> : <Lightbulb size={28} />}
            <div style={{ flex: 1, fontWeight: 800, fontSize: "1.06rem" }}>{feedback.text}</div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              id="btn-sorter-next"
            >
              <span>{itemIdx + 1 >= items.length ? "Zobacz wynik" : "Dalej"}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
