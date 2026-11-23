"use client";

import React, { useState, useMemo } from "react";
import { Check, RotateCw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { LearningModule } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";
import { audioManager } from "@/lib/audioManager";
import { useProgress } from "@/lib/progressStore";

interface FlashcardsGameProps {
  module: LearningModule;
  onBack: () => void;
}

export function FlashcardsGame({ module, onBack }: FlashcardsGameProps) {
  const { getModuleProgress, markVocabMastered, recordGameCompletion } = useProgress();
  const mp = getModuleProgress(module.id);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    module.vocab.forEach((v) => map.set(v.category, v.categoryLabel));
    return Array.from(map.entries());
  }, [module.vocab]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const items = useMemo(() => {
    if (selectedCategory === "all") return module.vocab;
    if (selectedCategory === "tricky") {
      const trickySet = new Set(mp.trickyItemIds);
      const filtered = module.vocab.filter((v) => trickySet.has(v.id));
      return filtered.length > 0 ? filtered : module.vocab;
    }
    return module.vocab.filter((v) => v.category === selectedCategory);
  }, [module.vocab, selectedCategory, mp.trickyItemIds]);

  const safeIndex = Math.min(index, Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const isMastered = current ? mp.masteredVocabIds.includes(current.id) : false;

  const goNext = () => {
    audioManager.playClick();
    setFlipped(false);
    setIndex((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    audioManager.playClick();
    setFlipped(false);
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleMark = (mastered: boolean) => {
    if (!current) return;
    markVocabMastered(module.id, current.id, mastered);
    if (mastered) {
      audioManager.playSuccess();
      const nextCount = mp.masteredVocabIds.includes(current.id)
        ? mp.masteredVocabIds.length
        : mp.masteredVocabIds.length + 1;
      const pct = nextCount / module.vocab.length;
      const stars = pct >= 0.85 ? 3 : pct >= 0.5 ? 2 : 1;
      recordGameCompletion(module.id, "flashcards", stars);
    } else {
      audioManager.playClick();
    }
    setFlipped(false);
    setIndex((prev) => (prev + 1) % items.length);
  };

  if (!current) return null;

  return (
    <div className="game-stage">
      <GameHeader
        title="Słowniczek i Fiszki"
        onBack={onBack}
        currentStep={safeIndex + 1}
        totalSteps={items.length}
        score={mp.masteredVocabIds.length}
      />

      {/* Category Pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 22,
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          className={`btn btn-soft ${selectedCategory === "all" ? "btn-active-pill" : ""}`}
          onClick={() => {
            setSelectedCategory("all");
            setIndex(0);
            setFlipped(false);
          }}
        >
          Wszystkie ({module.vocab.length})
        </button>

        {categories.map(([catKey, catLabel]) => (
          <button
            key={catKey}
            type="button"
            className={`btn btn-soft ${selectedCategory === catKey ? "btn-active-pill" : ""}`}
            onClick={() => {
              setSelectedCategory(catKey);
              setIndex(0);
              setFlipped(false);
            }}
          >
            {catLabel}
          </button>
        ))}

        {mp.trickyItemIds.some((id) => module.vocab.some((v) => v.id === id)) && (
          <button
            type="button"
            className={`btn btn-soft ${selectedCategory === "tricky" ? "btn-active-pill" : ""}`}
            onClick={() => {
              setSelectedCategory("tricky");
              setIndex(0);
              setFlipped(false);
            }}
          >
            Do powtórki
          </button>
        )}
      </div>

      {/* 3D Flip Flashcard */}
      <div className="flashcard-scene">
        <div
          className={`flashcard-inner ${flipped ? "flipped" : ""}`}
          onClick={() => {
            audioManager.playFlip();
            setFlipped((f) => !f);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              audioManager.playFlip();
              setFlipped((f) => !f);
            }
          }}
          aria-label="Kliknij kartę, aby ją obrócić"
        >
          {/* Front: Illustration + English word */}
          <div className="flashcard-face">
            <div style={{ marginBottom: 8 }}>
              <StoryVisual visual={current.visual} size={134} />
            </div>

            <div
              className="font-display"
              style={{
                fontSize: "2.35rem",
                fontWeight: 700,
                marginBottom: 6,
                color: "var(--ink-primary)",
              }}
            >
              {current.needsArticleA === true ? (
                <>
                  <span style={{ color: "var(--coral-dark)" }}>a </span>
                  {current.term}
                </>
              ) : (
                current.term
              )}
            </div>

            {current.needsArticleA === false && (
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: "var(--blue-dark)",
                  marginBottom: 10,
                }}
              >
                (liczba mnoga — bez „a”!)
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <AudioButton
                text={current.term}
                audioKey={current.audioKey}
                lang={module.speechLang}
                label="Posłuchaj"
              />
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: "0.92rem",
                color: "var(--ink-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RotateCw size={15} />
              <span>Dotknij karty, aby zobaczyć tłumaczenie i zdanie</span>
            </div>
          </div>

          {/* Back: Translation + Example sentence + Tip */}
          <div className="flashcard-face flashcard-back">
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: "var(--amber-dark)",
                marginBottom: 6,
              }}
            >
              {current.categoryLabel}
            </div>

            <div
              className="font-display"
              style={{
                fontSize: "2.1rem",
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {current.translation}
            </div>

            <div
              style={{
                background: "#FFFFFF",
                border: "2px solid var(--border-warm)",
                borderRadius: 18,
                padding: "14px 18px",
                width: "100%",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 4 }}>
                {current.exampleSentence}
              </div>
              <div style={{ fontSize: "0.98rem", color: "var(--ink-secondary)", marginBottom: 12 }}>
                {current.exampleTranslation}
              </div>
              <AudioButton
                text={current.exampleSentence}
                audioKey={current.exampleAudioKey}
                lang={module.speechLang}
                label="Posłuchaj zdania"
              />
            </div>

            {current.tip && (
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#92400E",
                  background: "var(--amber-soft)",
                  padding: "8px 14px",
                  borderRadius: 12,
                }}
              >
                Wskazówka: {current.tip}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          marginTop: 24,
        }}
      >
        <button type="button" className="btn btn-icon" onClick={goPrev} aria-label="Poprzednie słówko">
          <ChevronLeft size={24} />
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => handleMark(false)}
          style={{ minWidth: 180 }}
        >
          <Sparkles size={20} color="#F59E0B" />
          <span>Powtórzę później</span>
        </button>

        <button
          type="button"
          className="btn btn-green"
          onClick={() => handleMark(true)}
          style={{ minWidth: 180 }}
        >
          <Check size={22} />
          <span>{isMastered ? "Już opanowane!" : "Już umiem!"}</span>
        </button>

        <button type="button" className="btn btn-icon" onClick={goNext} aria-label="Następne słówko">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
