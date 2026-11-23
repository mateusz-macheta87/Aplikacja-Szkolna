"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { ArrowRight, Crown, RotateCcw, Users } from "lucide-react";
import type { LearningModule, QuizQuestion } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { audioManager } from "@/lib/audioManager";
import { shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface FamilyDuelGameProps {
  module: LearningModule;
  onBack: () => void;
}

export function FamilyDuelGame({ module, onBack }: FamilyDuelGameProps) {
  const { state, recordBonusActivity } = useProgress();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    shuffleArray([...module.audioQuiz, ...module.examQuestions]).slice(0, 10)
  );
  const [idx, setIdx] = useState(0);
  const [childScore, setChildScore] = useState(0);
  const [parentScore, setParentScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const isChildTurn = idx % 2 === 0;
  const current = questions[idx];
  const childLabel = state.childName || "Córka";

  const startDuel = () => {
    audioManager.unlock();
    audioManager.playClick();
    setQuestions(shuffleArray([...module.audioQuiz, ...module.examQuestions]).slice(0, 10));
    setIdx(0);
    setChildScore(0);
    setParentScore(0);
    setSelectedId(null);
    setFinished(false);
    setStarted(true);
  };

  const handlePick = (optId: string) => {
    if (selectedId || !current) return;
    setSelectedId(optId);
    const ok = optId === current.correctOptionId;
    if (ok) {
      audioManager.playSuccess();
      if (isChildTurn) setChildScore((s) => s + 1);
      else setParentScore((s) => s + 1);
    } else {
      audioManager.playGentleTryAgain();
    }
  };

  const handleNext = () => {
    if (idx + 1 >= questions.length) {
      setFinished(true);
      recordBonusActivity(module.id, 3, "stk-duel");
      audioManager.playFanfare();
      confetti({
        particleCount: 95,
        spread: 80,
        origin: { y: 0.55 },
      });
    } else {
      setIdx((i) => i + 1);
      setSelectedId(null);
    }
  };

  if (!started) {
    return (
      <div className="game-stage">
        <GameHeader title="Pojedynek — Zagraj z rodzicem!" onBack={onBack} />
        <div className="card" style={{ textAlign: "center", padding: "32px 26px" }}>
          <img
            src={`${BASE_PATH}/art/duel-parent.webp`}
            alt="Pojedynek rodzinny"
            width={220}
            height={220}
            style={{ borderRadius: 28, marginBottom: 16, boxShadow: "0 8px 20px rgba(82,58,28,0.12)" }}
          />
          <h2 style={{ fontSize: "1.9rem", marginBottom: 8 }}>
            {childLabel} kontra Rodzic!
          </h2>
          <p style={{ color: "var(--ink-secondary)", fontWeight: 700, fontSize: "1.08rem", maxWidth: 540, margin: "0 auto 24px" }}>
            10 pytań na zmianę na jednym iPadzie (po 5 dla każdego). Kto zdobędzie złoty puchar Bzyczka?
            Za wspólną zabawę czekają 3 gwiazdki i rodzinna naklejka!
          </p>
          <button
            type="button"
            className="btn btn-primary btn-pill"
            style={{ minHeight: 62, padding: "14px 34px", fontSize: "1.2rem" }}
            onClick={startDuel}
          >
            <Users size={22} />
            <span>Zaczynamy pojedynek!</span>
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const winnerText =
      childScore > parentScore
        ? `Wygrywa ${childLabel}! Brawo Mistrzyni!`
        : childScore < parentScore
        ? "Tym razem wygrywa Rodzic — czas na rewanż!"
        : "Idealny remis! Oboje jesteście super!";

    return (
      <div className="game-stage">
        <GameHeader title="Wynik Pojedynku" onBack={onBack} />
        <div className="card" style={{ textAlign: "center", padding: "34px 26px" }}>
          <img
            src={`${BASE_PATH}/art/duel-parent.webp`}
            alt="Zwycięzcy pojedynku"
            width={180}
            height={180}
            style={{ borderRadius: 26, marginBottom: 14 }}
          />
          <h2 style={{ fontSize: "1.9rem", marginBottom: 18 }}>{winnerText}</h2>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 18,
              flexWrap: "wrap",
              marginBottom: 26,
            }}
          >
            <div className="stat-pill stat-pill-amber" style={{ fontSize: "1.25rem", padding: "12px 24px" }}>
              <Crown size={22} />
              <span>
                {childLabel}: {childScore} pkt
              </span>
            </div>
            <div className="stat-pill stat-pill-blue" style={{ fontSize: "1.25rem", padding: "12px 24px" }}>
              <span>Rodzic: {parentScore} pkt</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button type="button" className="btn btn-primary btn-pill" onClick={startDuel}>
              <RotateCcw size={20} />
              <span>Rewanż!</span>
            </button>
            <button type="button" className="btn btn-pill" onClick={onBack}>
              <span>Wróć na mapę</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="game-stage">
      <GameHeader
        title="Pojedynek"
        onBack={onBack}
        currentStep={idx + 1}
        totalSteps={questions.length}
      />

      {/* Scoreboard & Active Player Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          className="stat-pill"
          style={{
            background: isChildTurn ? "#FEF3C7" : "#FFFFFF",
            borderColor: isChildTurn ? "#F59E0B" : "var(--border-warm)",
            fontSize: "1.08rem",
          }}
        >
          <span>
            {isChildTurn ? "👉 Kolej: " : ""}
            {childLabel}: {childScore}
          </span>
        </div>

        <div
          className="stat-pill"
          style={{
            background: !isChildTurn ? "#DBEAFE" : "#FFFFFF",
            borderColor: !isChildTurn ? "#3B82F6" : "var(--border-warm)",
            fontSize: "1.08rem",
          }}
        >
          <span>
            {!isChildTurn ? "👉 Kolej: " : ""}Rodzic: {parentScore}
          </span>
        </div>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: 14 }}>{current.promptPl}</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          {current.promptVisual && <StoryVisual visual={current.promptVisual} size={112} />}
          {current.audioText && (
            <AudioButton
              text={current.audioText}
              audioKey={current.audioKey}
              lang={module.speechLang}
              label="Posłuchaj"
            />
          )}
        </div>

        <div className="grid-2">
          {current.options.map((opt) => {
            let cls = "";
            if (selectedId) {
              if (opt.id === current.correctOptionId) cls = "correct";
              else if (opt.id === selectedId) cls = "wrong";
            }
            return (
              <button
                key={opt.id}
                type="button"
                className={`option-tile ${cls}`}
                disabled={Boolean(selectedId)}
                onClick={() => handlePick(opt.id)}
              >
                {opt.visual && <StoryVisual visual={opt.visual} size={86} />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {selectedId && (
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <button type="button" className="btn btn-primary btn-pill" onClick={handleNext}>
              <span>{idx + 1 >= questions.length ? "Zobacz wynik!" : "Następna kolejka"}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
