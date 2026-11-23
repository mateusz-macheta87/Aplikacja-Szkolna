"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Timer, Zap, Trophy } from "lucide-react";
import type { LearningModule, VocabItem } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface LightningBlitzGameProps {
  module: LearningModule;
  onBack: () => void;
}

interface BlitzRound {
  target: VocabItem;
  options: VocabItem[];
}

function makeRound(vocab: VocabItem[]): BlitzRound {
  const pool = shuffleArray(vocab);
  const target = pool[0];
  const distractors = pool.filter((v) => v.id !== target.id).slice(0, 3);
  return {
    target,
    options: shuffleArray([target, ...distractors]),
  };
}

export function LightningBlitzGame({ module, onBack }: LightningBlitzGameProps) {
  const { getModuleProgress, recordBonusActivity } = useProgress();
  const bestScore = getModuleProgress(module.id).bestBlitzScore;

  const [started, setStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const [flashWrongId, setFlashWrongId] = useState<string | null>(null);
  const [round, setRound] = useState<BlitzRound>(() => makeRound(module.vocab));

  const playableVocab = useMemo(() => module.vocab, [module.vocab]);

  useEffect(() => {
    if (!started || finished) return;
    if (secondsLeft <= 0) {
      queueMicrotask(() => {
        setFinished(true);
        const bonusStars = score >= 12 ? 3 : score >= 6 ? 2 : 1;
        recordBonusActivity(module.id, bonusStars, "stk-blitz", score);
      });
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [started, finished, secondsLeft, score, module.id, recordBonusActivity]);

  const startBlitz = () => {
    audioManager.unlock();
    audioManager.playClick();
    const first = makeRound(playableVocab);
    setRound(first);
    setScore(0);
    setStreak(0);
    setSecondsLeft(60);
    setFinished(false);
    setStarted(true);
    void audioManager.speak(first.target.term, {
      audioKey: first.target.audioKey,
      lang: module.speechLang,
    });
  };

  const handlePick = (opt: VocabItem) => {
    if (finished) return;
    if (opt.id === round.target.id) {
      audioManager.playSuccess();
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      setFlashWrongId(null);
      const next = makeRound(playableVocab);
      setRound(next);
      void audioManager.speak(next.target.term, {
        audioKey: next.target.audioKey,
        lang: module.speechLang,
      });
    } else {
      audioManager.playGentleTryAgain();
      setStreak(0);
      setFlashWrongId(opt.id);
    }
  };

  if (finished) {
    const stars = score >= 12 ? 3 : score >= 6 ? 2 : 1;
    return (
      <RoundSummary
        title={`Błyskawica! ${score} poprawnych słówek w minutę!`}
        correctCount={score}
        totalCount={Math.max(score, 10)}
        stars={stars}
        onReplay={startBlitz}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="game-stage">
      <GameHeader title="Błyskawica — 60 sekund!" onBack={onBack} score={score} />

      {!started ? (
        <div className="card" style={{ textAlign: "center", padding: "36px 26px" }}>
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/art/lightning-blitz.webp`}
            alt="Błyskawica"
            width={150}
            height={150}
            style={{ borderRadius: 28, marginBottom: 14 }}
          />
          <h2 style={{ fontSize: "1.9rem", marginBottom: 8 }}>Ile słówek złapiesz w minutę?</h2>
          <p style={{ color: "var(--ink-secondary)", fontWeight: 700, fontSize: "1.08rem", margin: "0 0 18px" }}>
            Słuchaj i jak najszybciej wskazuj właściwy obrazek! Za grę dostajesz dodatkowe gwiazdki i naklejkę.
          </p>
          {bestScore > 0 && (
            <div className="stat-pill stat-pill-amber" style={{ marginBottom: 20 }}>
              <Trophy size={18} />
              <span>Twój rekord: {bestScore} pkt</span>
            </div>
          )}
          <div>
            <button
              type="button"
              id="btn-start-blitz"
              className="btn btn-primary btn-pill"
              style={{ minHeight: 62, padding: "14px 34px", fontSize: "1.2rem" }}
              onClick={startBlitz}
            >
              <Zap size={22} />
              <span>Start! 60 sekund</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "24px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              className="stat-pill"
              style={{
                background: secondsLeft <= 10 ? "var(--coral-soft)" : "var(--blue-soft)",
                borderColor: secondsLeft <= 10 ? "var(--coral)" : "var(--blue)",
                color: secondsLeft <= 10 ? "var(--coral-dark)" : "var(--blue-dark)",
                fontSize: "1.18rem",
              }}
            >
              <Timer size={20} />
              <span>{secondsLeft} s</span>
            </div>

            {streak >= 3 && (
              <div className="stat-pill stat-pill-amber">
                <span>Seria ×{streak}!</span>
              </div>
            )}
          </div>

          <div
            className="font-display"
            style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: 6 }}
          >
            {round.target.term}
          </div>
          <div style={{ color: "var(--ink-secondary)", fontWeight: 700, marginBottom: 18 }}>
            ({round.target.translation})
          </div>

          <div className="grid-2">
            {round.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`option-tile ${flashWrongId === opt.id ? "wrong" : ""}`}
                onClick={() => handlePick(opt)}
              >
                <StoryVisual visual={opt.visual} size={96} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
