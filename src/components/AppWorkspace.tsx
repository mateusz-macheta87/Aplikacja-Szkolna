"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  BookOpen,
  Check,
  Layers,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { BUILTIN_MODULES, SUBJECTS, getModulesForSubject } from "@/content/registry";
import { STICKERS } from "@/content/rewards";
import type { LearningModule, QuizQuestion } from "@/types/content";
import { useProgress, todayDateKey, type StationId } from "@/lib/progressStore";
import { audioManager } from "@/lib/audioManager";
import { shuffleArray } from "@/lib/answerMatcher";
import { AdventureMap, type MapStation } from "@/components/AdventureMap";
import { MascotAvatar } from "@/components/ui/MascotAvatar";
import { ParentZoneView } from "@/components/ParentZoneModal";
import { FlashcardsGame } from "@/components/games/FlashcardsGame";
import { GrammarGuideView } from "@/components/games/GrammarGuideView";
import { QuizGame } from "@/components/games/QuizGame";
import { ColoursPencilGame } from "@/components/games/ColoursPencilGame";
import { DressUpCrayonGame } from "@/components/games/DressUpCrayonGame";
import { SentenceBuilderGame } from "@/components/games/SentenceBuilderGame";
import { CategorySorterGame } from "@/components/games/CategorySorterGame";
import { SpellingBeeGame } from "@/components/games/SpellingBeeGame";
import { LightningBlitzGame } from "@/components/games/LightningBlitzGame";
import { FamilyDuelGame } from "@/components/games/FamilyDuelGame";
import { StickerAlbumView } from "@/components/games/StickerAlbumView";
import { MascotWardrobeView } from "@/components/games/MascotWardrobeView";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type ScreenState =
  | { view: "map" }
  | { view: "station"; station: MapStation }
  | { view: "dictionary" }
  | { view: "grammar" }
  | { view: "daily" }
  | { view: "blitz" }
  | { view: "mistakes" }
  | { view: "duel" }
  | { view: "stickers" }
  | { view: "wardrobe" }
  | { view: "parent"; preUnlocked?: boolean };

const WEEKDAYS_PL = ["nd", "pn", "wt", "śr", "czw", "pt", "sob"];

function getLast7Days() {
  const days: Array<{ key: string; weekday: string; dayNum: number; isToday: boolean }> = [];
  const today = new Date();
  for (let offset = -6; offset <= 0; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push({
      key: `${y}-${m}-${day}`,
      weekday: WEEKDAYS_PL[d.getDay()],
      dayNum: d.getDate(),
      isToday: offset === 0,
    });
  }
  return days;
}

function buildClothesQuestions(mod: LearningModule): QuizQuestion[] {
  const clothes = mod.vocab.filter(
    (v) => v.category === "clothes-core" || v.category === "clothes-extra"
  );
  return clothes.slice(0, 8).map((target, idx) => {
    const distractors = shuffleArray(clothes.filter((c) => c.id !== target.id)).slice(0, 3);
    const opts = shuffleArray([target, ...distractors]).map((v) => ({
      id: v.id,
      label: v.term,
      sublabel: v.translation,
      visual: v.visual,
    }));
    return {
      id: `st1-q-${idx}`,
      promptPl: "Posłuchaj nazwy ubrania i kliknij właściwy obrazek:",
      audioText: target.term,
      audioKey: target.audioKey,
      options: opts,
      correctOptionId: target.id,
      hint: `„${target.term}” oznacza po polsku „${target.translation}”!`,
      topicTag: "Clothes • Ubrania",
    };
  });
}

function buildWeatherQuestions(mod: LearningModule): QuizQuestion[] {
  const weatherVocab = mod.vocab.filter((v) => v.category === "weather");
  return weatherVocab.map((target, idx) => {
    const distractors = shuffleArray(weatherVocab.filter((w) => w.id !== target.id)).slice(0, 3);
    const opts = shuffleArray([target, ...distractors]).map((v) => ({
      id: v.id,
      label: `It's ${v.term}.`,
      sublabel: v.translation,
      visual: v.visual,
    }));
    return {
      id: `st6-q-${idx}`,
      promptPl: "What's the weather like today? Spójrz na pogodę i wybierz odpowiedź:",
      promptEn: "What's the weather like today?",
      audioText: target.exampleSentence,
      audioKey: target.exampleAudioKey,
      promptVisual: target.visual,
      options: opts,
      correctOptionId: target.id,
      hint: `„It's ${target.term}.” znaczy „Jest ${target.translation}”.`,
      topicTag: "Weather • Pogoda",
    };
  });
}

function HoldParentButton({ onUnlock }: { onUnlock: () => void }) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = () => {
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      audioManager.playClick();
      onUnlock();
    }, 1800);
  };

  const cancelHold = () => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <button
      type="button"
      id="btn-hold-parent"
      className={`hold-parent-btn ${holding ? "holding" : ""}`}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="hold-parent-fill" aria-hidden="true" />
      <span style={{ position: "relative", zIndex: 1 }}>
        {holding ? "Trzymaj jeszcze chwilkę..." : "Panel rodzica: przytrzymaj 2 sekundy"}
      </span>
    </button>
  );
}

export function AppWorkspace() {
  const {
    state,
    getModuleProgress,
    recordStationCompletion,
    recordBonusActivity,
    openTreasureChest,
    toggleMuted,
  } = useProgress();

  const allModules: LearningModule[] = useMemo(
    () => [...BUILTIN_MODULES, ...state.customModules],
    [state.customModules]
  );

  const [activeModuleId, setActiveModuleId] = useState<string>(BUILTIN_MODULES[0].id);
  const [screen, setScreen] = useState<ScreenState>({ view: "map" });
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  const activeModule =
    allModules.find((m) => m.id === activeModuleId) ?? BUILTIN_MODULES[0];
  const mp = getModuleProgress(activeModule.id);

  const last7Days = useMemo(() => getLast7Days(), []);
  const todayKey = todayDateKey();
  const doneToday = state.activeDates.includes(todayKey);

  // Build dynamic mistake questions if any exist
  const mistakeQuestions: QuizQuestion[] = useMemo(() => {
    const trickySet = new Set(mp.trickyItemIds);
    const allQ = [...activeModule.audioQuiz, ...activeModule.examQuestions];
    return allQ.filter((q) => trickySet.has(q.id));
  }, [mp.trickyItemIds, activeModule]);

  const dailyQuestions: QuizQuestion[] = useMemo(
    () =>
      shuffleArray([
        ...activeModule.audioQuiz,
        ...activeModule.examQuestions,
      ]).slice(0, 5),
    [activeModule]
  );

  const clothesQuestions = useMemo(
    () => buildClothesQuestions(activeModule),
    [activeModule]
  );

  const weatherQuestions = useMemo(
    () => buildWeatherQuestions(activeModule),
    [activeModule]
  );

  const goToMap = () => {
    audioManager.stopSpeech();
    setScreen({ view: "map" });
  };

  // --- Active Subviews ---
  if (screen.view === "parent") {
    return (
      <main className="app-shell">
        <ParentZoneView onBack={goToMap} preUnlocked={screen.preUnlocked} />
      </main>
    );
  }

  if (screen.view === "dictionary") {
    return (
      <main className="app-shell">
        <FlashcardsGame module={activeModule} onBack={goToMap} />
      </main>
    );
  }

  if (screen.view === "grammar") {
    return (
      <main className="app-shell">
        <GrammarGuideView module={activeModule} onBack={goToMap} />
      </main>
    );
  }

  if (screen.view === "daily") {
    return (
      <main className="app-shell">
        <QuizGame
          module={activeModule}
          mode="audio-quiz"
          title="Zadanie dnia (5 szybkich zadań)"
          questions={dailyQuestions}
          onBack={goToMap}
          onComplete={(stars) => recordBonusActivity(activeModule.id, Math.max(2, stars), "stk-daily")}
        />
      </main>
    );
  }

  if (screen.view === "blitz") {
    return (
      <main className="app-shell">
        <LightningBlitzGame module={activeModule} onBack={goToMap} />
      </main>
    );
  }

  if (screen.view === "mistakes") {
    return (
      <main className="app-shell">
        <QuizGame
          module={activeModule}
          mode="audio-quiz"
          title="Powtórka błędów"
          questions={mistakeQuestions.length > 0 ? mistakeQuestions : dailyQuestions}
          onBack={goToMap}
          onComplete={(stars) => recordBonusActivity(activeModule.id, Math.max(1, stars))}
        />
      </main>
    );
  }

  if (screen.view === "duel") {
    return (
      <main className="app-shell">
        <FamilyDuelGame module={activeModule} onBack={goToMap} />
      </main>
    );
  }

  if (screen.view === "stickers") {
    return (
      <main className="app-shell">
        <StickerAlbumView onBack={goToMap} />
      </main>
    );
  }

  if (screen.view === "wardrobe") {
    return (
      <main className="app-shell">
        <MascotWardrobeView onBack={goToMap} />
      </main>
    );
  }

  if (screen.view === "station") {
    const st = screen.station;
    const finishStation = (
      stars: number,
      examScore?: { correct: number; total: number }
    ) => {
      recordStationCompletion(activeModule.id, st.id as StationId, stars, st.stickerId, examScore);
    };

    return (
      <main className="app-shell">
        {st.id === "s1-clothes" && (
          <QuizGame
            module={activeModule}
            mode="audio-quiz"
            title="1. Clothes — Ubrania"
            questions={clothesQuestions}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s2-colours" && (
          <ColoursPencilGame
            module={activeModule}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s3-wearing" && (
          <SentenceBuilderGame
            module={activeModule}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s4-dressup" && (
          <DressUpCrayonGame
            module={activeModule}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s5-seasons" && (
          <CategorySorterGame
            module={activeModule}
            initialRoundIdx={1}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s6-weather" && (
          <QuizGame
            module={activeModule}
            mode="audio-quiz"
            title="6. Weather — Pogoda"
            questions={weatherQuestions}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s7-listen" && (
          <QuizGame
            module={activeModule}
            mode="audio-quiz"
            title="7. Bzyczek says — Słuchanie"
            questions={activeModule.audioQuiz}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s8-write" && (
          <SpellingBeeGame
            module={activeModule}
            onBack={goToMap}
            onComplete={(stars) => finishStation(stars)}
          />
        )}
        {st.id === "s9-test" && (
          <QuizGame
            module={activeModule}
            mode="exam"
            title="9. Test — Sprawdzian próbny"
            questions={activeModule.examQuestions}
            onBack={goToMap}
            onComplete={(stars, examScore) => finishStation(stars, examScore)}
          />
        )}
      </main>
    );
  }

  // --- Main Storybook Game Home (Map + Calendar + Gry i nagrody + Dla rodzica) ---
  return (
    <main className="app-shell">
      {/* Top Header matching cozy storybook vibe */}
      <header className="topbar" style={{ marginBottom: 16 }}>
        <div className="topbar-left">
          <MascotAvatar size={56} />
          <div>
            <h1 style={{ fontSize: "clamp(1.45rem, 2.8vw, 1.95rem)", lineHeight: 1.1 }}>
              English with Bzyczek
            </h1>
            <div style={{ fontSize: "0.94rem", fontWeight: 700, color: "var(--ink-secondary)" }}>
              {activeModule.grade} • {activeModule.title}
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <button
            type="button"
            className="btn btn-soft btn-pill"
            style={{ minHeight: 46, padding: "8px 16px", fontSize: "0.94rem" }}
            onClick={() => {
              audioManager.playClick();
              setSubjectsOpen(true);
            }}
            id="btn-subjects-switcher"
          >
            <Layers size={18} color="#D97706" />
            <span>Przedmioty</span>
          </button>

          <button
            type="button"
            className="stat-pill stat-pill-amber"
            style={{ cursor: "pointer" }}
            onClick={() => {
              audioManager.playClick();
              setScreen({ view: "wardrobe" });
            }}
            aria-label="Gwiazdki do wydania w garderobie"
          >
            <Star size={19} fill="#F59E0B" color="#D97706" />
            <span>{state.spendableStars} do wydania</span>
          </button>

          <button
            type="button"
            className="btn btn-icon btn-soft"
            style={{ borderRadius: "50%" }}
            onClick={toggleMuted}
            aria-label={state.muted ? "Włącz dźwięk" : "Wycisz dźwięk"}
          >
            {state.muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
          </button>
        </div>
      </header>

      {/* Companion Dashed Welcome Bubble */}
      <section className="welcome-bubble">
        <MascotAvatar size={64} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: "1.03rem", lineHeight: 1.48, color: "var(--ink-primary)" }}>
          <strong>Hello, {state.childName}!</strong> Bzyczek uczy się angielskiego razem z Tobą. Idź
          ścieżką przez cztery pory roku — za każdy przystanek dostajesz gwiazdki i kolorową
          naklejkę. Przycisk z głośnikiem czyta słowa pięknym brytyjskim głosem!
        </p>
      </section>

      {/* 7-Day Streak Calendar ("Mój kalendarz") */}
      <section className="calendar-card" aria-label="Mój kalendarz nauki">
        <div className="calendar-header">
          <strong className="font-display" style={{ fontSize: "1.2rem" }}>
            Mój kalendarz
          </strong>
          <span style={{ color: "var(--ink-secondary)", fontWeight: 700, fontSize: "0.95rem" }}>
            {doneToday
              ? `Świetnie! Dzisiejsze ćwiczenie zaliczone (seria: ${Math.max(1, state.streakDays)} dz.)!`
              : "Zrób zadanie dnia i zacznij serię!"}
          </span>
        </div>

        <div className="calendar-days">
          {last7Days.map((day) => {
            const active = state.activeDates.includes(day.key);
            return (
              <div
                key={day.key}
                className={`calendar-day ${day.isToday ? "is-today" : ""} ${
                  active ? "is-done" : ""
                }`}
              >
                <span className="calendar-weekday">{day.weekday}</span>
                <strong className="calendar-num">{day.dayNum}</strong>
                {active && (
                  <span className="calendar-check" aria-label="Zaliczone">
                    <Check size={12} strokeWidth={3.2} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Winding Four-Seasons Adventure Map */}
      <AdventureMap
        stationStars={mp.stationStars}
        treasureOpened={mp.treasureOpened}
        onSelectStation={(station) => setScreen({ view: "station", station })}
        onOpenTreasure={() => openTreasureChest(activeModule.id)}
      />

      {/* Gry i nagrody (7 Watercolor Illustrated Cards) */}
      <section style={{ marginTop: 28 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h2 style={{ fontSize: "1.55rem" }}>Gry i nagrody</h2>
          <button
            type="button"
            className="btn btn-soft btn-pill"
            style={{ minHeight: 42, padding: "6px 16px", fontSize: "0.92rem" }}
            onClick={() => {
              audioManager.playClick();
              setScreen({ view: "grammar" });
            }}
          >
            <BookOpen size={17} color="#1D4ED8" />
            <span>Ściągawka gramatyczna + Bug Twister</span>
          </button>
        </div>

        <div className="rewards-grid">
          <button
            type="button"
            id="card-dictionary"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "dictionary" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/dictionary-book.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Słowniczek obrazkowy</strong>
              <span>Picture dictionary: posłuchaj słówek</span>
            </div>
          </button>

          <button
            type="button"
            id="card-daily"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "daily" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/daily-quest.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Zadanie dnia</strong>
              <span>{doneToday ? "Zrobione! Zagraj ponownie" : "5 szybkich zadań"}</span>
            </div>
          </button>

          <button
            type="button"
            id="card-blitz"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "blitz" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/lightning-blitz.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Błyskawica</strong>
              <span>
                {mp.bestBlitzScore > 0
                  ? `Ile zrobisz w minutę? (rekord: ${mp.bestBlitzScore})`
                  : "Ile zrobisz w minutę?"}
              </span>
            </div>
          </button>

          <button
            type="button"
            id="card-mistakes"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "mistakes" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/umbrella-review.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Powtórka błędów</strong>
              <span>
                {mistakeQuestions.length > 0
                  ? `Do poprawy: ${mistakeQuestions.length} zad.`
                  : "Brak błędów. Super!"}
              </span>
            </div>
          </button>

          <button
            type="button"
            id="card-duel"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "duel" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/duel-parent.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Pojedynek</strong>
              <span>Zagraj z rodzicem na 1 iPadzie</span>
            </div>
          </button>

          <button
            type="button"
            id="card-stickers"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "stickers" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/sticker-album.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Album naklejek</strong>
              <span>
                {state.unlockedStickers.length} z {STICKERS.length}
              </span>
            </div>
          </button>

          <button
            type="button"
            id="card-wardrobe"
            className="reward-card"
            onClick={() => {
              audioManager.unlock();
              audioManager.playClick();
              setScreen({ view: "wardrobe" });
            }}
          >
            <img
              src={`${BASE_PATH}/art/wardrobe-closet.webp`}
              alt=""
              width={74}
              height={74}
              className="reward-art"
            />
            <div className="reward-copy">
              <strong>Garderoba Bzyczka</strong>
              <span>{state.spendableStars} gwiazdek do wydania</span>
            </div>
          </button>
        </div>
      </section>

      {/* Cozy "Dla rodzica" Footer Card with Hold-for-2-Seconds Parent Panel */}
      <section className="parent-footer-card">
        <h3 style={{ fontSize: "1.2rem", marginBottom: 8 }}>Dla rodzica</h3>
        <p style={{ margin: "0 0 8px", color: "var(--ink-secondary)", fontWeight: 600, lineHeight: 1.5 }}>
          <strong>Zakres:</strong> podręcznik str. 8–16 i słowniczek ze str. 80. Ubrania, kolory i
          kredki, zdania „I&apos;m wearing a coat / purple shorts”, pory roku, „I like / I don&apos;t
          like”, pogoda „What&apos;s the weather like today? It&apos;s sunny.”
        </p>
        <p style={{ margin: "0 0 16px", color: "var(--ink-secondary)", fontWeight: 600, lineHeight: 1.5 }}>
          Nagrania lektora (brytyjski angielski) są wbudowane w aplikację i działają także offline na
          iPadzie. W trybie klawiatury w Dyktandzie można pisać również rysikiem Apple Pencil (Bazgroły).
          Postępy i naklejki zapisują się bezpiecznie lokalnie na tym iPadzie.
        </p>

        <HoldParentButton onUnlock={() => setScreen({ view: "parent", preUnlocked: true })} />
      </section>

      {/* Multi-Subject & Module Switcher Modal */}
      {subjectsOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Przedmioty i moduły"
          onClick={() => setSubjectsOpen(false)}
        >
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h2 style={{ fontSize: "1.5rem" }}>Przedmioty i sprawdziany</h2>
              <button
                type="button"
                className="btn btn-icon btn-soft"
                onClick={() => setSubjectsOpen(false)}
                aria-label="Zamknij"
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ color: "var(--ink-secondary)", fontWeight: 600, margin: "0 0 16px" }}>
              Aplikacja jest gotowa na kolejne rozdziały i inne przedmioty szkolne. Nowe paczki
              dodasz w Panelu rodzica (JSON) lub w repozytorium.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SUBJECTS.map((subj) => {
                const mods = getModulesForSubject(subj.id, state.customModules);
                return (
                  <div
                    key={subj.id}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      background: "var(--surface-soft)",
                      border: "2px solid var(--border-warm)",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 4 }}>
                      {subj.name}
                    </div>
                    <div style={{ color: "var(--ink-secondary)", fontSize: "0.92rem", marginBottom: 10 }}>
                      {subj.description}
                    </div>
                    {mods.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {mods.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`btn btn-pill ${
                              m.id === activeModule.id ? "btn-primary" : "btn-soft"
                            }`}
                            style={{ justifyContent: "space-between", width: "100%" }}
                            onClick={() => {
                              setActiveModuleId(m.id);
                              setSubjectsOpen(false);
                            }}
                          >
                            <span>{m.title}</span>
                            <span>{m.id === activeModule.id ? "Aktywny ✓" : "Wybierz"}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.88rem", color: "var(--ink-muted)", fontWeight: 700 }}>
                        Gotowe miejsce na przyszłe sprawdziany z tego przedmiotu.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
