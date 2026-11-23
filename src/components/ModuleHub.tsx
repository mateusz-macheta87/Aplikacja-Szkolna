"use client";

import React from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Headphones,
  Layers,
  Palette,
  Puzzle,
  Sparkles,
  SpellCheck,
  Star,
  FolderKanban,
} from "lucide-react";
import type { GameModeId, LearningModule } from "@/types/content";
import { useProgress } from "@/lib/progressStore";
import { audioManager } from "@/lib/audioManager";

interface ModuleHubProps {
  module: LearningModule;
  onSelectMode: (mode: GameModeId) => void;
  onBack: () => void;
}

interface ActivityCardConfig {
  id: GameModeId;
  title: string;
  subtitle: string;
  badge: string;
  bg: string;
  iconColor: string;
  icon: React.ReactNode;
  available: boolean;
}

export function ModuleHub({ module, onSelectMode, onBack }: ModuleHubProps) {
  const { getModuleProgress, getReadinessPercent } = useProgress();
  const mp = getModuleProgress(module.id);
  const readiness = getReadinessPercent(module.id, module.vocab.length);

  const allActivities: ActivityCardConfig[] = [
    {
      id: "flashcards",
      title: "Słowniczek i Fiszki",
      subtitle: `${module.vocab.length} słówek z obrazkami i lektorem`,
      badge: "Krok 1 • Nauka",
      bg: "#FEF3C7",
      iconColor: "#D97706",
      icon: <Layers size={30} />,
      available: module.vocab.length > 0,
    },
    {
      id: "grammar",
      title: "Ściągawka Gramatyczna",
      subtitle: "I'm wearing (a), pogoda i Bug Twister",
      badge: "Zasady + Audio",
      bg: "#DBEAFE",
      iconColor: "#1D4ED8",
      icon: <BookOpen size={30} />,
      available: module.grammarRules.length > 0,
    },
    {
      id: "audio-quiz",
      title: "Audio Quiz",
      subtitle: "Posłuchaj po angielsku i wskaż obrazek",
      badge: "Słuchanie",
      bg: "#E0F2FE",
      iconColor: "#0284C7",
      icon: <Headphones size={30} />,
      available: module.audioQuiz.length > 0,
    },
    {
      id: "dress-up",
      title: "Kredki i Garderoba",
      subtitle: "Pokoloruj ubrania dokładnie jak w zdaniu!",
      badge: "Kredki na sprawdzian!",
      bg: "#FFE4E6",
      iconColor: "#BE123C",
      icon: <Palette size={30} />,
      available: module.dressUpTasks.length > 0,
    },
    {
      id: "sentences",
      title: "Budowniczy Zdań",
      subtitle: "Ułóż zdania z kolorowych klocków",
      badge: "Gramatyka",
      bg: "#DCFCE7",
      iconColor: "#15803D",
      icon: <Puzzle size={30} />,
      available: module.sentenceTasks.length > 0,
    },
    {
      id: "sorter",
      title: "Sortownia: „a” czy bez „a”?",
      subtitle: "Koszyki gramatyczne, Lato/Zima i Pogoda",
      badge: "3 rundy",
      bg: "#EDE9FE",
      iconColor: "#6D28D9",
      icon: <FolderKanban size={30} />,
      available: module.sortRounds.length > 0,
    },
    {
      id: "memory",
      title: "Memory Audio",
      subtitle: "Odkrywaj pary obrazek + słówko z dźwiękiem",
      badge: "Zabawa",
      bg: "#FEF9C3",
      iconColor: "#A16207",
      icon: <Sparkles size={30} />,
      available: module.vocab.length >= 6,
    },
    {
      id: "spelling",
      title: "Mistrz Pisowni",
      subtitle: "Ułóż słówko z liter lub wpisz na klawiaturze",
      badge: "Dyktando",
      bg: "#FFEDD5",
      iconColor: "#C2410C",
      icon: <SpellCheck size={30} />,
      available: module.spellingTasks.length > 0,
    },
    {
      id: "exam",
      title: "Próbny Sprawdzian",
      subtitle: `${module.examQuestions.length} pytań jak w szkole + powtórka błędów`,
      badge: "Finał • Test!",
      bg: "#DCFCE7",
      iconColor: "#166534",
      icon: <ClipboardCheck size={30} />,
      available: module.examQuestions.length > 0,
    },
  ];
  const activities = allActivities.filter((a) => a.available);

  return (
    <div>
      <div className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              audioManager.playClick();
              onBack();
            }}
          >
            <ArrowLeft size={20} />
            <span>Przedmioty</span>
          </button>
        </div>

        <div className="topbar-right">
          <div className="stat-pill stat-pill-green">
            <span>Gotowość do sprawdzianu: {readiness}%</span>
          </div>
        </div>
      </div>

      {/* Module Banner */}
      <div className="card" style={{ marginBottom: 24, padding: "24px 26px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                color: "var(--amber-dark)",
                fontSize: "0.95rem",
                marginBottom: 4,
              }}
            >
              {module.grade} • {module.sourceNote}
            </div>
            <h1 style={{ fontSize: "clamp(1.55rem, 3vw, 2.15rem)", marginBottom: 4 }}>
              {module.title}
            </h1>
            <p style={{ margin: 0, color: "var(--ink-secondary)", fontWeight: 700, fontSize: "1.05rem" }}>
              {module.subtitle}
            </p>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${Math.max(4, readiness)}%` }} />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid-3">
        {activities.map((act) => {
          const stars = mp.modeStars[act.id] ?? 0;
          return (
            <button
              key={act.id}
              type="button"
              id={`game-card-${act.id}`}
              className="card card-interactive"
              onClick={() => {
                audioManager.unlock();
                audioManager.playClick();
                onSelectMode(act.id);
              }}
              style={{
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 14,
                padding: 20,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 18,
                      background: act.bg,
                      color: act.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {act.icon}
                  </div>

                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      padding: "5px 11px",
                      borderRadius: 999,
                      background: "var(--surface-soft)",
                      border: "1.5px solid var(--border-warm)",
                      color: "var(--ink-secondary)",
                    }}
                  >
                    {act.badge}
                  </span>
                </div>

                <h2 style={{ fontSize: "1.3rem", marginBottom: 6 }}>{act.title}</h2>
                <p
                  style={{
                    margin: 0,
                    color: "var(--ink-secondary)",
                    fontWeight: 600,
                    fontSize: "0.96rem",
                    lineHeight: 1.4,
                  }}
                >
                  {act.subtitle}
                </p>
              </div>

              {act.id !== "grammar" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={22}
                      fill={n <= stars ? "#FACC15" : "#EFE5D3"}
                      color={n <= stars ? "#D97706" : "#D6C3A3"}
                    />
                  ))}
                  <span style={{ marginLeft: 8, fontSize: "0.88rem", fontWeight: 800, color: "var(--ink-muted)" }}>
                    {stars > 0 ? `${stars}/3 gwiazdki` : "Zagraj!"}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--blue-dark)" }}>
                  Otwórz karty zasad →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
