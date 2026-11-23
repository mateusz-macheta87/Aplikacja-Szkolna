"use client";

import React, { useState } from "react";
import { ArrowLeft, Volume2, VolumeX, Turtle, Star, BookOpen } from "lucide-react";
import type { LearningModule } from "@/types/content";
import { useProgress } from "@/lib/progressStore";
import { audioManager } from "@/lib/audioManager";
import { CheatSheetDrawer } from "@/components/ui/CheatSheetDrawer";

interface GameHeaderProps {
  title: string;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
  score?: number;
  moduleForCheatSheet?: LearningModule;
}

export function GameHeader({
  title,
  onBack,
  currentStep,
  totalSteps,
  score,
  moduleForCheatSheet,
}: GameHeaderProps) {
  const { state, toggleMuted, toggleSlowAudio } = useProgress();
  const [cheatOpen, setCheatOpen] = useState(false);

  const showDots =
    currentStep !== undefined && totalSteps !== undefined && totalSteps > 0 && totalSteps <= 16;

  return (
    <header style={{ marginBottom: 18 }}>
      <div className="topbar" style={{ marginBottom: 10 }}>
        <div className="topbar-left">
          <button
            type="button"
            className="btn btn-soft btn-pill"
            onClick={() => {
              audioManager.stopSpeech();
              audioManager.playClick();
              onBack();
            }}
            id="btn-game-back"
          >
            <ArrowLeft size={20} />
            <span>Mapa</span>
          </button>
          <h1 style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)" }}>{title}</h1>
        </div>

        <div className="topbar-right">
          {moduleForCheatSheet && (
            <button
              type="button"
              className="btn btn-pill"
              style={{
                background: "#FEF3C7",
                borderColor: "#F5D08A",
                color: "#92400E",
                minHeight: 46,
                padding: "8px 18px",
                fontSize: "0.95rem",
              }}
              onClick={() => {
                audioManager.playClick();
                setCheatOpen(true);
              }}
              id="btn-open-cheatsheet"
            >
              <BookOpen size={18} />
              <span>Ściągawka</span>
            </button>
          )}

          {showDots && (
            <div className="progress-dots" aria-label={`Zadanie ${currentStep} z ${totalSteps}`}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <span
                  key={i}
                  className={`progress-dot ${
                    i + 1 < currentStep
                      ? "done"
                      : i + 1 === currentStep
                      ? "active"
                      : ""
                  }`}
                />
              ))}
            </div>
          )}

          {score !== undefined && (
            <div className="stat-pill stat-pill-amber" aria-label="Punkty">
              <Star size={18} fill="#F59E0B" color="#D97706" />
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
            <Turtle size={21} />
          </button>

          <button
            type="button"
            className={`btn btn-icon ${state.muted ? "btn-active-pill" : "btn-soft"}`}
            onClick={toggleMuted}
            title={state.muted ? "Włącz dźwięki" : "Wycisz efekty"}
            aria-label="Wycisz lub włącz dźwięki"
          >
            {state.muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
          </button>
        </div>
      </div>

      {!showDots && currentStep !== undefined && totalSteps && totalSteps > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.round((currentStep / totalSteps) * 100))}%` }}
            />
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

      {moduleForCheatSheet && (
        <CheatSheetDrawer
          open={cheatOpen}
          module={moduleForCheatSheet}
          onClose={() => setCheatOpen(false)}
        />
      )}
    </header>
  );
}
