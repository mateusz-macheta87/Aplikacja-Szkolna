"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lightbulb, Palette, RotateCcw } from "lucide-react";
import type { ClothingVisualType, ColourName, DressUpTask, LearningModule } from "@/types/content";
import { COLOUR_PALETTE, StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { computeStars } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

const WARDROBE_ITEMS: Array<{ kind: ClothingVisualType; label: string }> = [
  { kind: "coat", label: "coat" },
  { kind: "jumper", label: "jumper" },
  { kind: "t-shirt", label: "T-shirt" },
  { kind: "skirt", label: "skirt" },
  { kind: "trousers", label: "trousers" },
  { kind: "shorts", label: "shorts" },
  { kind: "cap", label: "cap" },
  { kind: "shoes", label: "shoes" },
];

const CRAYONS: ColourName[] = [
  "red",
  "blue",
  "yellow",
  "green",
  "purple",
  "pink",
  "orange",
  "brown",
  "black",
];

interface DressUpCrayonGameProps {
  module: LearningModule;
  onBack: () => void;
  onComplete?: (stars: number) => void;
}

export function DressUpCrayonGame({ module, onBack, onComplete }: DressUpCrayonGameProps) {
  const { recordGameCompletion, recordItemResult } = useProgress();
  const [tasks, setTasks] = useState<DressUpTask[]>(module.dressUpTasks);
  const [idx, setIdx] = useState(0);
  const [selectedCrayon, setSelectedCrayon] = useState<ColourName>("red");
  const [painted, setPainted] = useState<Partial<Record<ClothingVisualType, ColourName>>>({});
  const [hideText, setHideText] = useState(false);
  const [status, setStatus] = useState<"playing" | "correct" | "wrong">("playing");
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<DressUpTask[]>([]);
  const [finished, setFinished] = useState(false);

  const current = tasks[idx];

  useEffect(() => {
    if (!finished && current) {
      const t = setTimeout(() => {
        void audioManager.speak(current.sentence, {
          audioKey: current.audioKey,
          lang: module.speechLang,
        });
      }, 260);
      return () => clearTimeout(t);
    }
  }, [idx, finished, current, module.speechLang]);

  const handleTapClothing = (kind: ClothingVisualType) => {
    if (status === "correct") return;
    audioManager.playClick();
    setStatus("playing");
    setPainted((prev) => {
      if (prev[kind] === selectedCrayon) {
        const copy = { ...prev };
        delete copy[kind];
        return copy;
      }
      return { ...prev, [kind]: selectedCrayon };
    });
  };

  const handleCheck = () => {
    if (!current) return;
    const paintedKeys = Object.keys(painted) as ClothingVisualType[];
    const matchesAll =
      paintedKeys.length === current.targets.length &&
      current.targets.every((t) => painted[t.item] === t.color);

    if (matchesAll) {
      audioManager.playSuccess();
      setStatus("correct");
      if (!hadWrongAttempt) {
        setCorrectCount((c) => c + 1);
        recordItemResult(module.id, current.id, true);
      }
    } else {
      audioManager.playGentleTryAgain();
      setStatus("wrong");
      setHadWrongAttempt(true);
      recordItemResult(module.id, current.id, false);
      setMistakes((m) => (m.some((x) => x.id === current.id) ? m : [...m, current]));
    }
  };

  const handleNext = () => {
    audioManager.stopSpeech();
    if (idx + 1 >= tasks.length) {
      const stars = computeStars(correctCount, tasks.length);
      if (onComplete) onComplete(stars);
      else recordGameCompletion(module.id, "dress-up", stars);
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setPainted({});
      setStatus("playing");
      setHadWrongAttempt(false);
    }
  };

  const restart = (nextList: DressUpTask[]) => {
    setTasks(nextList);
    setIdx(0);
    setPainted({});
    setStatus("playing");
    setHadWrongAttempt(false);
    setCorrectCount(0);
    setMistakes([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <RoundSummary
        title="Garderoba pokolorowana na medal!"
        correctCount={correctCount}
        totalCount={tasks.length}
        stars={computeStars(correctCount, tasks.length)}
        mistakesCount={mistakes.length}
        onPracticeMistakes={mistakes.length > 0 ? () => restart(mistakes) : undefined}
        onReplay={() => restart(module.dressUpTasks)}
        onBack={onBack}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="game-stage">
      <GameHeader
        title="Dress up — Ubieranka"
        onBack={onBack}
        currentStep={idx + 1}
        totalSteps={tasks.length}
        score={correctCount}
        moduleForCheatSheet={module}
      />

      <div className="card" style={{ padding: "18px 22px" }}>
        {/* Prompt Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Palette size={22} color="#D97706" />
            <span style={{ fontWeight: 800, color: "var(--ink-secondary)" }}>
              Wybierz kredkę i pokoloruj właściwe ubranie ({current.targets.length}{" "}
              {current.targets.length === 1 ? "rzecz" : "rzeczy"}):
            </span>
          </div>

          <button
            type="button"
            className="btn btn-soft"
            style={{ minHeight: 42, padding: "6px 14px" }}
            onClick={() => setHideText((h) => !h)}
          >
            {hideText ? <Eye size={18} /> : <EyeOff size={18} />}
            <span>{hideText ? "Pokaż zdanie" : "Tylko ze słuchu"}</span>
          </button>
        </div>

        {/* Audio & Sentence Box */}
        <div
          style={{
            background: "var(--surface-soft)",
            border: "2px solid var(--border-warm)",
            borderRadius: 18,
            padding: "12px 18px",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            {hideText ? (
              <div className="font-display" style={{ fontSize: "1.3rem", color: "var(--blue-dark)" }}>
                Posłuchaj uważnie nagrania! (Tryb sprawdzianowy)
              </div>
            ) : (
              <>
                <div className="font-display" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                  „{current.sentence}”
                </div>
                <div style={{ color: "var(--ink-secondary)", fontWeight: 700, fontSize: "0.95rem" }}>
                  {current.translation}
                </div>
              </>
            )}
          </div>

          <AudioButton
            text={current.sentence}
            audioKey={current.audioKey}
            lang={module.speechLang}
            label="Posłuchaj"
          />
        </div>

        {/* Crayon Box */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: "0.92rem", color: "var(--ink-secondary)" }}>
            1. Wybierz kredkę (kliknij, aby usłyszeć kolor):
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CRAYONS.map((col) => {
              const info = COLOUR_PALETTE[col];
              const isSelected = selectedCrayon === col;
              return (
                <button
                  key={col}
                  type="button"
                  className={`crayon-btn ${isSelected ? "selected" : ""}`}
                  style={{ minWidth: 72, minHeight: 66, padding: "8px 10px" }}
                  onClick={() => {
                    setSelectedCrayon(col);
                    void audioManager.speak(info.labelEn, {
                      audioKey: `w-${col}`,
                      lang: module.speechLang,
                    });
                  }}
                >
                  <span
                    className="crayon-dot"
                    style={{ backgroundColor: info.fill, width: 28, height: 28 }}
                  />
                  <span>{info.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wardrobe Clothes Grid */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, fontSize: "0.92rem", color: "var(--ink-secondary)" }}>
            2. Kliknij ubranie, aby je pokolorować (drugie kliknięcie zdejmuje kolor):
          </div>
          <div className="grid-4" style={{ gap: 12 }}>
            {WARDROBE_ITEMS.map((w) => {
              const chosenColor = painted[w.kind];
              return (
                <button
                  key={w.kind}
                  type="button"
                  className="option-tile"
                  style={{
                    minHeight: 106,
                    padding: "10px 10px",
                    gap: 4,
                    borderColor: chosenColor ? COLOUR_PALETTE[chosenColor].shade : undefined,
                    background: chosenColor ? "#FFFDF7" : undefined,
                  }}
                  onClick={() => handleTapClothing(w.kind)}
                >
                  <StoryVisual
                    visual={{ kind: w.kind, color: chosenColor }}
                    uncolored={!chosenColor}
                    size={72}
                  />
                  <span style={{ fontSize: "0.94rem" }}>
                    {chosenColor ? `${chosenColor} ${w.label}` : w.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              audioManager.playClick();
              setPainted({});
              setStatus("playing");
            }}
          >
            <RotateCcw size={18} />
            <span>Wyczyść kredki</span>
          </button>

          {status !== "correct" ? (
            <button
              type="button"
              className="btn btn-green"
              disabled={Object.keys(painted).length === 0}
              onClick={handleCheck}
              id="btn-dressup-check"
            >
              <CheckCircle2 size={22} />
              <span>Sprawdź!</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              id="btn-dressup-next"
            >
              <span>{idx + 1 >= tasks.length ? "Zobacz wynik" : "Następne zadanie"}</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        {status === "correct" && (
          <div className="feedback-banner success">
            <CheckCircle2 size={28} />
            <div style={{ fontWeight: 800, fontSize: "1.08rem" }}>
              Idealnie! {current.sentence} ({current.translation})
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="feedback-banner hint">
            <Lightbulb size={28} />
            <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>
              Spróbuj jeszcze raz! {current.hint}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
