"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import type { GameModeId, LearningModule, QuizQuestion } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { computeStars, shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface QuizGameProps {
  module: LearningModule;
  mode: Extract<GameModeId, "audio-quiz" | "exam">;
  title: string;
  questions: QuizQuestion[];
  onBack: () => void;
  onComplete?: (stars: number, examScore?: { correct: number; total: number }) => void;
}

export function QuizGame({
  module,
  mode,
  title,
  questions,
  onBack,
  onComplete,
}: QuizGameProps) {
  const { recordGameCompletion, recordItemResult } = useProgress();

  const [queue, setQueue] = useState<QuizQuestion[]>(() => shuffleArray(questions));
  const [idx, setIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<QuizQuestion[]>([]);
  const [finished, setFinished] = useState(false);

  const current = queue[idx];

  const speakCurrent = useCallback(() => {
    if (!current?.audioText) return;
    void audioManager.speak(current.audioText, {
      audioKey: current.audioKey,
      lang: module.speechLang,
    });
  }, [current, module.speechLang]);

  useEffect(() => {
    if (!finished && current?.audioText) {
      const timer = setTimeout(() => {
        speakCurrent();
      }, 240);
      return () => clearTimeout(timer);
    }
  }, [idx, finished, current, speakCurrent]);

  const handleSelect = (optionId: string) => {
    if (answered || !current) return;
    setSelectedId(optionId);
    setAnswered(true);

    const isCorrect = optionId === current.correctOptionId;
    recordItemResult(module.id, current.id, isCorrect);

    if (isCorrect) {
      audioManager.playSuccess();
      setCorrectCount((c) => c + 1);
    } else {
      audioManager.playGentleTryAgain();
      setMistakes((m) => (m.some((q) => q.id === current.id) ? m : [...m, current]));
    }
  };

  const handleNext = () => {
    audioManager.stopSpeech();
    if (idx + 1 >= queue.length) {
      const stars = computeStars(correctCount, queue.length);
      const examScore =
        mode === "exam" ? { correct: correctCount, total: queue.length } : undefined;
      if (onComplete) {
        onComplete(stars, examScore);
      } else {
        recordGameCompletion(module.id, mode, stars, examScore);
      }
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setSelectedId(null);
      setAnswered(false);
    }
  };

  const startRound = (nextQuestions: QuizQuestion[]) => {
    setQueue(shuffleArray(nextQuestions));
    setIdx(0);
    setSelectedId(null);
    setAnswered(false);
    setCorrectCount(0);
    setMistakes([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <RoundSummary
        title={mode === "exam" ? "Próbny Sprawdzian ukończony!" : "Brawo! Zadanie ukończone!"}
        correctCount={correctCount}
        totalCount={queue.length}
        stars={computeStars(correctCount, queue.length)}
        mistakesCount={mistakes.length}
        onPracticeMistakes={mistakes.length > 0 ? () => startRound(mistakes) : undefined}
        onReplay={() => startRound(questions)}
        onBack={onBack}
      />
    );
  }

  if (!current) return null;

  const isCorrectSelection = selectedId === current.correctOptionId;

  return (
    <div className="game-stage">
      <GameHeader
        title={title}
        onBack={onBack}
        currentStep={idx + 1}
        totalSteps={queue.length}
        score={correctCount}
        moduleForCheatSheet={module}
      />

      <div className="card" style={{ padding: "26px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <span className="stat-pill stat-pill-blue" style={{ fontSize: "0.88rem" }}>
            {current.topicTag}
          </span>
          {mode === "exam" && (
            <span style={{ fontWeight: 700, color: "var(--ink-muted)", fontSize: "0.92rem" }}>
              Pytanie sprawdzianowe
            </span>
          )}
        </div>

        <h2 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.6rem)", marginBottom: 16 }}>
          {current.promptPl}
        </h2>

        {current.promptEn && (
          <div
            className="font-display"
            style={{
              fontSize: "1.45rem",
              fontWeight: 700,
              color: "var(--blue-dark)",
              marginBottom: 14,
            }}
          >
            „{current.promptEn}”
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          {current.promptVisual && (
            <div
              style={{
                padding: 14,
                borderRadius: 24,
                background: "var(--surface-soft)",
                border: "2px solid var(--border-warm)",
              }}
            >
              <StoryVisual visual={current.promptVisual} size={136} />
            </div>
          )}

          {current.audioText && (
            <AudioButton
              text={current.audioText}
              audioKey={current.audioKey}
              lang={module.speechLang}
              label="Odtwórz nagranie"
              size="lg"
              pulse={!answered}
            />
          )}
        </div>

        {/* Options Grid */}
        <div className="grid-2">
          {current.options.map((opt) => {
            let stateClass = "";
            if (answered) {
              if (opt.id === current.correctOptionId) stateClass = "correct";
              else if (opt.id === selectedId) stateClass = "wrong";
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={`option-tile ${stateClass}`}
                disabled={answered}
                onClick={() => handleSelect(opt.id)}
              >
                {opt.visual && <StoryVisual visual={opt.visual} size={98} />}
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span style={{ fontSize: "0.9rem", color: "var(--ink-secondary)", fontWeight: 700 }}>
                    {opt.sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Next */}
        {answered && (
          <div className={`feedback-banner ${isCorrectSelection ? "success" : "hint"}`}>
            {isCorrectSelection ? (
              <CheckCircle2 size={30} style={{ flexShrink: 0 }} />
            ) : (
              <Lightbulb size={30} style={{ flexShrink: 0 }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "1.12rem", marginBottom: 2 }}>
                {isCorrectSelection ? "Świetnie! Poprawna odpowiedź!" : "Prawie! Podpowiedź Bzyczka:"}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {isCorrectSelection
                  ? current.audioText
                    ? `Zdanie: „${current.audioText}”`
                    : current.hint
                  : current.hint}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              id="btn-quiz-next"
            >
              <span>{idx + 1 >= queue.length ? "Zobacz wynik" : "Dalej"}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
