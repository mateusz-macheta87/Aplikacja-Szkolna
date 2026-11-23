"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { RotateCcw, ArrowLeft, Star, Sparkles } from "lucide-react";
import { audioManager } from "@/lib/audioManager";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface RoundSummaryProps {
  title: string;
  correctCount: number;
  totalCount: number;
  stars: 0 | 1 | 2 | 3;
  mistakesCount?: number;
  onPracticeMistakes?: () => void;
  onReplay: () => void;
  onBack: () => void;
}

export function RoundSummary({
  title,
  correctCount,
  totalCount,
  stars,
  mistakesCount = 0,
  onPracticeMistakes,
  onReplay,
  onBack,
}: RoundSummaryProps) {
  const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 100;

  useEffect(() => {
    audioManager.playFanfare();
    if (stars >= 2) {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.55 },
        colors: ["#F59E0B", "#22C55E", "#3B82F6", "#F43F5E", "#FACC15"],
      });
    }
  }, [stars]);

  const praise =
    stars === 3
      ? "Rewelacja! Sprawdzian masz w małym palcu!"
      : stars === 2
      ? "Świetna robota! Jeszcze chwila i będzie 100%!"
      : "Super początek! Poćwicz jeszcze raz, idzie Ci coraz lepiej!";

  return (
    <div className="game-stage">
      <div className="card" style={{ textAlign: "center", padding: "36px 28px" }}>
        <img
          src={`${BASE_PATH}/icons/mascot.png`}
          alt="Bzyczek gratuluje"
          width={126}
          height={126}
          className="mascot-avatar"
          style={{ margin: "0 auto 18px" }}
        />

        <h2 style={{ fontSize: "2rem", marginBottom: 8 }}>{title}</h2>
        <p style={{ fontSize: "1.15rem", color: "var(--ink-secondary)", margin: "0 0 22px" }}>
          {praise}
        </p>

        {/* Stars */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 14,
            marginBottom: 22,
          }}
          aria-label={`Zdobyto ${stars} z 3 gwiazdek`}
        >
          {[1, 2, 3].map((idx) => (
            <Star
              key={idx}
              size={54}
              fill={idx <= stars ? "#FACC15" : "#EFE5D3"}
              color={idx <= stars ? "#D97706" : "#D6C3A3"}
              strokeWidth={2.2}
            />
          ))}
        </div>

        <div
          className="stat-pill stat-pill-green"
          style={{ fontSize: "1.2rem", padding: "12px 24px", marginBottom: 28 }}
        >
          <span>
            Wynik: {correctCount} / {totalCount} ({pct}%)
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            justifyContent: "center",
          }}
        >
          {mistakesCount > 0 && onPracticeMistakes && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPracticeMistakes}
              id="btn-practice-mistakes"
            >
              <Sparkles size={22} />
              <span>Poćwicz tylko błędy ({mistakesCount})</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-blue"
            onClick={onReplay}
            id="btn-replay-game"
          >
            <RotateCcw size={20} />
            <span>Zagraj jeszcze raz</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={onBack}
            id="btn-summary-back"
          >
            <ArrowLeft size={20} />
            <span>Wróć do gier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
