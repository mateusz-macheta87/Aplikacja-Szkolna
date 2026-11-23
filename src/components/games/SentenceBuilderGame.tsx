"use client";

import React, { useState, useMemo } from "react";
import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Volume2 } from "lucide-react";
import type { LearningModule, SentenceTask } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { computeStars, isSentenceMatch, shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface Token {
  id: string;
  word: string;
}

interface SentenceBuilderGameProps {
  module: LearningModule;
  onBack: () => void;
  onComplete?: (stars: number) => void;
}

export function SentenceBuilderGame({ module, onBack, onComplete }: SentenceBuilderGameProps) {
  const { recordGameCompletion, recordItemResult } = useProgress();
  const [tasks, setTasks] = useState<SentenceTask[]>(module.sentenceTasks);
  const [idx, setIdx] = useState(0);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"playing" | "correct" | "wrong">("playing");
  const [hadMistake, setHadMistake] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<SentenceTask[]>([]);
  const [finished, setFinished] = useState(false);

  const current = tasks[idx];

  const pool: Token[] = useMemo(() => {
    if (!current) return [];
    const allWords = [...current.words, ...(current.distractorWords ?? [])];
    return shuffleArray(allWords.map((word, i) => ({ id: `${current.id}-${i}`, word })));
  }, [current]);

  const placedTokens = placedIds
    .map((id) => pool.find((t) => t.id === id))
    .filter((t): t is Token => Boolean(t));
  const availableTokens = pool.filter((t) => !placedIds.includes(t.id));

  const addToken = (id: string) => {
    if (status === "correct") return;
    audioManager.playClick();
    setStatus("playing");
    setPlacedIds((prev) => [...prev, id]);
  };

  const removeToken = (id: string) => {
    if (status === "correct") return;
    audioManager.playClick();
    setStatus("playing");
    setPlacedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleCheck = () => {
    if (!current) return;
    const attemptWords = placedTokens.map((t) => t.word);
    if (isSentenceMatch(attemptWords, current.targetSentence)) {
      audioManager.playSuccess();
      setStatus("correct");
      if (!hadMistake) {
        setCorrectCount((c) => c + 1);
        recordItemResult(module.id, current.id, true);
      }
      setTimeout(() => {
        void audioManager.speak(current.targetSentence, {
          audioKey: current.audioKey,
          lang: module.speechLang,
        });
      }, 320);
    } else {
      audioManager.playGentleTryAgain();
      setStatus("wrong");
      setHadMistake(true);
      recordItemResult(module.id, current.id, false);
      setMistakes((m) => (m.some((x) => x.id === current.id) ? m : [...m, current]));
    }
  };

  const handleNext = () => {
    audioManager.stopSpeech();
    if (idx + 1 >= tasks.length) {
      const stars = computeStars(correctCount, tasks.length);
      if (onComplete) onComplete(stars);
      else recordGameCompletion(module.id, "sentences", stars);
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setPlacedIds([]);
      setStatus("playing");
      setHadMistake(false);
    }
  };

  const restart = (list: SentenceTask[]) => {
    setTasks(list);
    setIdx(0);
    setPlacedIds([]);
    setStatus("playing");
    setHadMistake(false);
    setCorrectCount(0);
    setMistakes([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <RoundSummary
        title="Mistrzyni Budowania Zdań!"
        correctCount={correctCount}
        totalCount={tasks.length}
        stars={computeStars(correctCount, tasks.length)}
        mistakesCount={mistakes.length}
        onPracticeMistakes={mistakes.length > 0 ? () => restart(mistakes) : undefined}
        onReplay={() => restart(module.sentenceTasks)}
        onBack={onBack}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="game-stage">
      <GameHeader
        title="I'm wearing — Zdania"
        onBack={onBack}
        currentStep={idx + 1}
        totalSteps={tasks.length}
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
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <span className="stat-pill stat-pill-amber" style={{ fontSize: "0.88rem" }}>
            {current.topicTag}
          </span>
          {current.distractorWords && current.distractorWords.length > 0 && (
            <span style={{ fontWeight: 800, color: "var(--coral-dark)", fontSize: "0.94rem" }}>
              Uwaga: jeden klocek jest zmyłką!
            </span>
          )}
        </div>

        {/* Prompt */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 22,
          }}
        >
          {current.visual && (
            <div
              style={{
                padding: 12,
                borderRadius: 22,
                background: "var(--surface-soft)",
                border: "2px solid var(--border-warm)",
              }}
            >
              <StoryVisual visual={current.visual} size={96} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ color: "var(--ink-secondary)", fontWeight: 700, marginBottom: 4 }}>
              Ułóż po angielsku zdanie:
            </div>
            <h2 style={{ fontSize: "clamp(1.35rem, 2.6vw, 1.8rem)", marginBottom: 10 }}>
              „{current.promptPl}”
            </h2>
            <AudioButton
              text={current.targetSentence}
              audioKey={current.audioKey}
              lang={module.speechLang}
              label="Podpowiedź audio"
              showSlowOption={false}
            />
          </div>
        </div>

        {/* Sentence Slot Zone */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: "0.94rem", color: "var(--ink-secondary)", marginBottom: 8 }}>
            Twoje zdanie (kliknij klocek, aby go zdjąć):
          </div>
          <div className="word-slot-zone">
            {placedTokens.length === 0 ? (
              <span style={{ color: "var(--ink-muted)", fontWeight: 700 }}>
                Kliknij klocki poniżej, aby ułożyć zdanie...
              </span>
            ) : (
              placedTokens.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="word-chip word-chip-placed"
                  onClick={() => removeToken(t.id)}
                >
                  {t.word}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Word Bank */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            minHeight: 74,
            marginBottom: 22,
          }}
        >
          {availableTokens.map((t) => (
            <button
              key={t.id}
              type="button"
              className="word-chip"
              onClick={() => addToken(t.id)}
            >
              {t.word}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-soft"
            disabled={placedIds.length === 0 || status === "correct"}
            onClick={() => {
              audioManager.playClick();
              setPlacedIds([]);
              setStatus("playing");
            }}
          >
            <RotateCcw size={18} />
            <span>Od nowa</span>
          </button>

          {status !== "correct" ? (
            <button
              type="button"
              className="btn btn-green"
              disabled={placedIds.length === 0}
              onClick={handleCheck}
              id="btn-sentence-check"
            >
              <CheckCircle2 size={22} />
              <span>Sprawdź zdanie</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              id="btn-sentence-next"
            >
              <span>{idx + 1 >= tasks.length ? "Zobacz wynik" : "Następne zdanie"}</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        {status === "correct" && (
          <div className="feedback-banner success">
            <Volume2 size={28} />
            <div style={{ fontWeight: 800, fontSize: "1.12rem" }}>
              Brawo! „{current.targetSentence}” — brzmi idealnie!
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="feedback-banner hint">
            <Lightbulb size={28} />
            <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>
              Jeszcze chwilka! Podpowiedź: {current.hint}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
