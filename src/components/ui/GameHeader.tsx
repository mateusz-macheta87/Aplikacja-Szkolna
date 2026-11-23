"use client";

import React from "react";
import { ArrowLeft, Volume2, VolumeX, Turtle, Star } from "lucide-react";
import { useProgress } from "@/lib/progressStore";
import { audioManager } from "@/lib/audioManager";

interface GameHeaderProps {
  title: string;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
  score?: number;
}

export function GameHeader({
  title,
  onBack,
  currentStep,
  totalSteps,
  score,
}: GameHeaderProps) {
  const { state, toggleMuted, toggleSlowAudio } = useProgress();
  const pct =
    currentStep !== undefined && totalSteps && totalSteps > 0
      ? Math.min(100, Math.round((currentStep / totalSteps) * 100))
      : null;

  return (
    <header style={{ marginBottom: 20 }}>
      <div className="topbar" style={{ marginBottom: pct !== null ? 14 : 0 }}>
        <div className="topbar-left">
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              audioManager.stopSpeech();
              audioManager.playClick();
              onBack();
            }}
            id="btn-game-back"
          >
            <ArrowLeft size={22} />
            <span>Wróć</span>
          </button>
          <h1 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)" }}>{title}</h1>
        </div>

        <div className="topbar-right">
          {score !== undefined && (
            <div className="stat-pill stat-pill-amber" aria-label="Punkty">
              <Star size={19} fill="#F59E0B" color="#D97706" />
              <span>{score}</span>
            </div>
          )}

          <button
            type="button"
            className={`btn btn-icon ${state.slowAudio ? "btn-active-pill" : "btn-soft"}`}
            onClick={() => {
              audioManager.playClick();
              toggleSlowAudio();
            }}
            title={state.slowAudio ? "Tryb wolnego lektora WŁĄCZONY" : "Włącz wolniejszy głos lektora"}
            aria-label="Przełącz wolny tryb lektora"
          >
            <Turtle size={22} />
          </button>

          <button
            type="button"
            className={`btn btn-icon ${state.muted ? "btn-active-pill" : "btn-soft"}`}
            onClick={toggleMuted}
            title={state.muted ? "Włącz dźwięki" : "Wycisz efekty"}
            aria-label="Wycisz lub włącz dźwięki"
          >
            {state.muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
        </div>
      </div>

      {pct !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span
            style={{
              fontWeight: 800,
              color: "var(--ink-secondary)",
              whiteSpace: "nowrap",
              minWidth: 56,
              textAlign: "right",
            }}
          >
            {currentStep} / {totalSteps}
          </span>
        </div>
      )}
    </header>
  );
}
