"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Delete,
  Keyboard,
  LayoutGrid,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import type { LearningModule, SpellingTask } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { computeStars, isSpellingMatch, shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface LetterTile {
  id: string;
  char: string;
}

interface SpellingBeeGameProps {
  module: LearningModule;
  onBack: () => void;
  onComplete?: (stars: number) => void;
}

export function SpellingBeeGame({ module, onBack, onComplete }: SpellingBeeGameProps) {
  const { recordGameCompletion, recordItemResult } = useProgress();
  const [tasks, setTasks] = useState<SpellingTask[]>(module.spellingTasks);
  const [idx, setIdx] = useState(0);
  const [inputMode, setInputMode] = useState<"tiles" | "keyboard">("tiles");
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"playing" | "correct" | "wrong">("playing");
  const [hadWrong, setHadWrong] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<SpellingTask[]>([]);
  const [finished, setFinished] = useState(false);

  const current = tasks[idx];

  const tiles: LetterTile[] = useMemo(() => {
    if (!current) return [];
    const chars = current.word.split("");
    return shuffleArray(chars.map((char, i) => ({ id: `${current.id}-${i}`, char })));
  }, [current]);

  useEffect(() => {
    if (!finished && current) {
      const t = setTimeout(() => {
        void audioManager.speak(current.word, {
          audioKey: current.audioKey,
          lang: module.speechLang,
        });
      }, 240);
      return () => clearTimeout(t);
    }
  }, [idx, finished, current, module.speechLang]);

  const currentAttempt =
    inputMode === "tiles"
      ? pickedIds
          .map((id) => tiles.find((t) => t.id === id)?.char ?? "")
          .join("")
      : typed;

  const handleCheck = () => {
    if (!current) return;
    if (isSpellingMatch(currentAttempt, current.word)) {
      audioManager.playSuccess();
      setStatus("correct");
      if (!hadWrong) {
        setCorrectCount((c) => c + 1);
        recordItemResult(module.id, current.id, true);
      }
    } else {
      audioManager.playGentleTryAgain();
      setStatus("wrong");
      setHadWrong(true);
      recordItemResult(module.id, current.id, false);
      setMistakes((m) => (m.some((x) => x.id === current.id) ? m : [...m, current]));
    }
  };

  const handleRevealNextLetter = () => {
    if (!current || status === "correct") return;
    audioManager.playClick();
    if (inputMode === "tiles") {
      const expectedChars = current.word.split("");
      const nextPos = pickedIds.length;
      if (nextPos >= expectedChars.length) return;
      const neededChar = expectedChars[nextPos];
      const matchTile = tiles.find(
        (t) => t.char === neededChar && !pickedIds.includes(t.id)
      );
      if (matchTile) {
        setPickedIds((prev) => [...prev, matchTile.id]);
        setStatus("playing");
      }
    } else {
      const nextLen = Math.min(current.word.length, typed.length + 1);
      setTyped(current.word.slice(0, nextLen));
      setStatus("playing");
    }
  };

  const handleNext = () => {
    audioManager.stopSpeech();
    if (idx + 1 >= tasks.length) {
      const stars = computeStars(correctCount, tasks.length);
      if (onComplete) onComplete(stars);
      else recordGameCompletion(module.id, "spelling", stars);
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setPickedIds([]);
      setTyped("");
      setStatus("playing");
      setHadWrong(false);
    }
  };

  const restart = (list: SpellingTask[]) => {
    setTasks(list);
    setIdx(0);
    setPickedIds([]);
    setTyped("");
    setStatus("playing");
    setHadWrong(false);
    setCorrectCount(0);
    setMistakes([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <RoundSummary
        title="Mistrz Pisowni! Super robota!"
        correctCount={correctCount}
        totalCount={tasks.length}
        stars={computeStars(correctCount, tasks.length)}
        mistakesCount={mistakes.length}
        onPracticeMistakes={mistakes.length > 0 ? () => restart(mistakes) : undefined}
        onReplay={() => restart(module.spellingTasks)}
        onBack={onBack}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="game-stage">
      <GameHeader
        title="Listen & write — Dyktando"
        onBack={onBack}
        currentStep={idx + 1}
        totalSteps={tasks.length}
        score={correctCount}
        moduleForCheatSheet={module}
      />

      {/* Input Mode Switcher */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 18 }}>
        <button
          type="button"
          className={`btn btn-soft ${inputMode === "tiles" ? "btn-active-pill" : ""}`}
          onClick={() => {
            setInputMode("tiles");
            setPickedIds([]);
            setStatus("playing");
          }}
        >
          <LayoutGrid size={18} />
          <span>Kafelki z literami (łatwiejszy)</span>
        </button>
        <button
          type="button"
          className={`btn btn-soft ${inputMode === "keyboard" ? "btn-active-pill" : ""}`}
          onClick={() => {
            setInputMode("keyboard");
            setTyped("");
            setStatus("playing");
          }}
        >
          <Keyboard size={18} />
          <span>Klawiatura (tryb mistrza)</span>
        </button>
      </div>

      <div className="card" style={{ padding: "26px 24px", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <StoryVisual visual={current.visual} size={120} />
          <h2 style={{ fontSize: "1.65rem" }}>{current.translation}</h2>
          <AudioButton
            text={current.word}
            audioKey={current.audioKey}
            lang={module.speechLang}
            label="Posłuchaj słówka"
            size="lg"
          />
        </div>

        {inputMode === "tiles" ? (
          <>
            {/* Placed letters */}
            <div className="word-slot-zone" style={{ marginBottom: 18 }}>
              {pickedIds.length === 0 ? (
                <span style={{ color: "var(--ink-muted)", fontWeight: 700 }}>
                  Ułóż słówko z liter poniżej ({current.word.length} zn.)
                </span>
              ) : (
                pickedIds.map((id) => {
                  const tile = tiles.find((t) => t.id === id);
                  if (!tile) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      className="word-chip word-chip-placed word-chip-letter"
                      onClick={() => {
                        if (status === "correct") return;
                        audioManager.playClick();
                        setPickedIds((prev) => prev.filter((x) => x !== id));
                        setStatus("playing");
                      }}
                    >
                      {tile.char}
                    </button>
                  );
                })
              )}
            </div>

            {/* Scrambled letter bank */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                justifyContent: "center",
                minHeight: 68,
                marginBottom: 22,
              }}
            >
              {tiles
                .filter((t) => !pickedIds.includes(t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="word-chip word-chip-letter"
                    onClick={() => {
                      if (status === "correct") return;
                      audioManager.playClick();
                      setPickedIds((prev) => [...prev, t.id]);
                      setStatus("playing");
                    }}
                  >
                    {t.char}
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div style={{ maxWidth: 420, margin: "0 auto 22px" }}>
            <input
              type="text"
              value={typed}
              disabled={status === "correct"}
              onChange={(e) => {
                setTyped(e.target.value);
                setStatus("playing");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && typed.trim()) handleCheck();
              }}
              placeholder="Wpisz słówko po angielsku..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              style={{
                width: "100%",
                padding: "16px 20px",
                fontSize: "1.6rem",
                fontWeight: 800,
                textAlign: "center",
                borderRadius: 18,
                border: "3px solid var(--border-warm)",
                background: "var(--surface-soft)",
                color: "var(--ink-primary)",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-soft"
            disabled={status === "correct"}
            onClick={handleRevealNextLetter}
          >
            <Sparkles size={18} color="#F59E0B" />
            <span>Podpowiedz literkę</span>
          </button>

          {inputMode === "tiles" && pickedIds.length > 0 && status !== "correct" && (
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                audioManager.playClick();
                setPickedIds((p) => p.slice(0, -1));
                setStatus("playing");
              }}
            >
              <Delete size={18} />
              <span>Cofnij</span>
            </button>
          )}

          {status !== "correct" ? (
            <button
              type="button"
              className="btn btn-green"
              disabled={!currentAttempt.trim()}
              onClick={handleCheck}
              id="btn-spelling-check"
            >
              <CheckCircle2 size={22} />
              <span>Sprawdź</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              id="btn-spelling-next"
            >
              <span>{idx + 1 >= tasks.length ? "Zobacz wynik" : "Następne słówko"}</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        {status === "correct" && (
          <div className="feedback-banner success" style={{ textAlign: "left" }}>
            <CheckCircle2 size={28} />
            <div style={{ fontWeight: 800, fontSize: "1.12rem" }}>
              Bez błędu! Poprawna pisownia: „{current.word}” ({current.translation}).
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="feedback-banner hint" style={{ textAlign: "left" }}>
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
