"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Calculator,
  Flame,
  Landmark,
  Languages,
  Leaf,
  Play,
  Settings,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { BUILTIN_MODULES, SUBJECTS, getModulesForSubject } from "@/content/registry";
import type { GameModeId, LearningModule, SubjectDefinition } from "@/types/content";
import { useProgress } from "@/lib/progressStore";
import { audioManager } from "@/lib/audioManager";
import { ModuleHub } from "@/components/ModuleHub";
import { ParentZoneView } from "@/components/ParentZoneModal";
import { FlashcardsGame } from "@/components/games/FlashcardsGame";
import { GrammarGuideView } from "@/components/games/GrammarGuideView";
import { QuizGame } from "@/components/games/QuizGame";
import { DressUpCrayonGame } from "@/components/games/DressUpCrayonGame";
import { SentenceBuilderGame } from "@/components/games/SentenceBuilderGame";
import { CategorySorterGame } from "@/components/games/CategorySorterGame";
import { MemoryAudioGame } from "@/components/games/MemoryAudioGame";
import { SpellingBeeGame } from "@/components/games/SpellingBeeGame";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type ScreenState =
  | { view: "home" }
  | { view: "module"; moduleId: string }
  | { view: "game"; moduleId: string; mode: GameModeId }
  | { view: "parent" };

function SubjectIcon({ icon }: { icon: SubjectDefinition["icon"] }) {
  switch (icon) {
    case "languages":
      return <Languages size={30} />;
    case "calculator":
      return <Calculator size={30} />;
    case "book-open":
      return <BookOpen size={30} />;
    case "leaf":
      return <Leaf size={30} />;
    default:
      return <Landmark size={30} />;
  }
}

const THEME_STYLES: Record<SubjectDefinition["theme"], { bg: string; color: string }> = {
  amber: { bg: "#FEF3C7", color: "#B45309" },
  blue: { bg: "#DBEAFE", color: "#1D4ED8" },
  coral: { bg: "#FFE4E6", color: "#BE123C" },
  green: { bg: "#DCFCE7", color: "#15803D" },
  plum: { bg: "#EDE9FE", color: "#6D28D9" },
};

export function AppWorkspace() {
  const { state, getReadinessPercent, toggleMuted } = useProgress();
  const [screen, setScreen] = useState<ScreenState>({ view: "home" });

  const allModules: LearningModule[] = [...BUILTIN_MODULES, ...state.customModules];
  const primaryModule = allModules[0];

  const openModule = (moduleId: string) => {
    audioManager.unlock();
    audioManager.playClick();
    setScreen({ view: "module", moduleId });
  };

  if (screen.view === "parent") {
    return (
      <main className="app-shell">
        <ParentZoneView onBack={() => setScreen({ view: "home" })} />
      </main>
    );
  }

  if (screen.view === "module") {
    const activeMod = allModules.find((m) => m.id === screen.moduleId) ?? primaryModule;
    return (
      <main className="app-shell">
        <ModuleHub
          module={activeMod}
          onSelectMode={(mode) => setScreen({ view: "game", moduleId: activeMod.id, mode })}
          onBack={() => setScreen({ view: "home" })}
        />
      </main>
    );
  }

  if (screen.view === "game") {
    const activeMod = allModules.find((m) => m.id === screen.moduleId) ?? primaryModule;
    const goBackToModule = () => setScreen({ view: "module", moduleId: activeMod.id });

    return (
      <main className="app-shell">
        {screen.mode === "flashcards" && (
          <FlashcardsGame module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "grammar" && (
          <GrammarGuideView module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "audio-quiz" && (
          <QuizGame
            module={activeMod}
            mode="audio-quiz"
            title="Audio Quiz — Posłuchaj i wybierz"
            questions={activeMod.audioQuiz}
            onBack={goBackToModule}
          />
        )}
        {screen.mode === "dress-up" && (
          <DressUpCrayonGame module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "sentences" && (
          <SentenceBuilderGame module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "sorter" && (
          <CategorySorterGame module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "memory" && (
          <MemoryAudioGame module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "spelling" && (
          <SpellingBeeGame module={activeMod} onBack={goBackToModule} />
        )}
        {screen.mode === "exam" && (
          <QuizGame
            module={activeMod}
            mode="exam"
            title="Próbny Sprawdzian"
            questions={activeMod.examQuestions}
            onBack={goBackToModule}
          />
        )}
      </main>
    );
  }

  // Home View
  const primaryReadiness = primaryModule
    ? getReadinessPercent(primaryModule.id, primaryModule.vocab.length)
    : 0;

  return (
    <main className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <img
            src={`${BASE_PATH}/icons/mascot.png`}
            alt="Logo Bzyczek"
            width={48}
            height={48}
            className="mascot-avatar"
            style={{ borderRadius: 14 }}
          />
          <div>
            <div className="font-display" style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.1 }}>
              Bzyczek
            </div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--ink-secondary)" }}>
              Szkolne Przygody na iPada
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="stat-pill stat-pill-amber" aria-label="Zdobyte gwiazdki">
            <Star size={19} fill="#F59E0B" color="#D97706" />
            <span>{state.totalStars}</span>
          </div>

          <div className="stat-pill stat-pill-green" aria-label="Dni nauki">
            <Flame size={19} color="#15803D" />
            <span>{state.streakDays} dz.</span>
          </div>

          <button
            type="button"
            className="btn btn-icon btn-soft"
            onClick={toggleMuted}
            aria-label={state.muted ? "Włącz dźwięk" : "Wycisz dźwięk"}
          >
            {state.muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
          </button>

          <button
            type="button"
            className="btn btn-soft"
            id="btn-open-parent-zone"
            onClick={() => {
              audioManager.playClick();
              setScreen({ view: "parent" });
            }}
          >
            <Settings size={19} />
            <span>Rodzic</span>
          </button>
        </div>
      </header>

      {/* Welcome Hero for Active Exam */}
      {primaryModule && (
        <section className="hero-card">
          <img
            src={`${BASE_PATH}/icons/mascot.png`}
            alt="Pan Żuczek z książeczką"
            width={156}
            height={156}
            className="mascot-avatar"
          />

          <div>
            <h1 style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.35rem)", marginBottom: 8 }}>
              Cześć, {state.childName}! Gotowa na zabawę?
            </h1>
            <p
              style={{
                margin: "0 0 16px",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--ink-secondary)",
                lineHeight: 1.45,
              }}
            >
              Ćwiczymy do sprawdzianu z angielskiego: <strong>{primaryModule.title}</strong>{" "}
              (ubrania, kredki, kolory, pogoda i pory roku!).
            </p>

            <div style={{ maxWidth: 420, marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  marginBottom: 6,
                  color: "#92400E",
                }}
              >
                <span>Twoja gotowość do sprawdzianu</span>
                <span>{primaryReadiness}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.max(5, primaryReadiness)}%` }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                id="btn-start-primary-module"
                className="btn btn-primary"
                style={{ minHeight: 60, padding: "14px 28px", fontSize: "1.16rem" }}
                onClick={() => openModule(primaryModule.id)}
              >
                <Play size={22} fill="#FFFFFF" />
                <span>Zaczynamy sprawdzian!</span>
              </button>

              <button
                type="button"
                className="btn btn-blue"
                style={{ minHeight: 60, padding: "14px 22px" }}
                onClick={() => {
                  audioManager.unlock();
                  audioManager.playClick();
                  setScreen({ view: "game", moduleId: primaryModule.id, mode: "dress-up" });
                }}
              >
                <span>Kredki i Garderoba</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Modular Subjects Section */}
      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: "1.55rem" }}>Przedmioty i Sprawdziany</h2>
          <span style={{ color: "var(--ink-secondary)", fontWeight: 700, fontSize: "0.95rem" }}>
            Gotowe na kolejne działy i przedmioty
          </span>
        </div>

        <div className="grid-2">
          {SUBJECTS.map((subj) => {
            const mods = getModulesForSubject(subj.id, state.customModules);
            const theme = THEME_STYLES[subj.theme];
            const hasModules = mods.length > 0;

            return (
              <div
                key={subj.id}
                className="card"
                style={{
                  opacity: hasModules ? 1 : 0.78,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 18,
                      background: theme.bg,
                      color: theme.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <SubjectIcon icon={subj.icon} />
                  </div>

                  <div>
                    <h3 style={{ fontSize: "1.35rem", marginBottom: 4 }}>{subj.name}</h3>
                    <p style={{ margin: 0, color: "var(--ink-secondary)", fontWeight: 600 }}>
                      {subj.description}
                    </p>
                  </div>
                </div>

                {hasModules ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {mods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="btn"
                        style={{ justifyContent: "space-between", width: "100%" }}
                        onClick={() => openModule(m.id)}
                      >
                        <span style={{ textAlign: "left" }}>{m.title}</span>
                        <span style={{ color: "var(--amber-dark)" }}>Otwórz →</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: 14,
                      background: "var(--surface-soft)",
                      border: "2px dashed var(--border-warm)",
                      color: "var(--ink-muted)",
                      fontWeight: 700,
                      fontSize: "0.94rem",
                    }}
                  >
                    Miejsce na przyszłe sprawdziany — dodasz paczkę w Strefie Rodzica lub kodzie.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
