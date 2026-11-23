"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Volume2 } from "lucide-react";
import type { LearningModule, VocabItem } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { GameHeader } from "@/components/ui/GameHeader";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { shuffleArray } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface MemoryCard {
  uid: string;
  pairId: string;
  kind: "visual" | "word";
  item: VocabItem;
}

interface MemoryAudioGameProps {
  module: LearningModule;
  onBack: () => void;
}

export function MemoryAudioGame({ module, onBack }: MemoryAudioGameProps) {
  const { recordGameCompletion } = useProgress();
  const [deckMode, setDeckMode] = useState<"clothes" | "weather-seasons">("clothes");

  const pairItems = useMemo(() => {
    if (deckMode === "clothes") {
      return module.vocab.filter((v) => v.category === "clothes-core").slice(0, 6);
    }
    return module.vocab
      .filter((v) => v.category === "seasons" || v.category === "weather")
      .slice(0, 6);
  }, [module.vocab, deckMode]);

  const buildDeck = (source: VocabItem[]): MemoryCard[] =>
    shuffleArray(
      source.flatMap((item) => [
        { uid: `${item.id}-vis`, pairId: item.id, kind: "visual" as const, item },
        { uid: `${item.id}-word`, pairId: item.id, kind: "word" as const, item },
      ])
    );

  const [cards, setCards] = useState<MemoryCard[]>(() => buildDeck(pairItems));
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const resetDeck = (nextMode: "clothes" | "weather-seasons") => {
    const source =
      nextMode === "clothes"
        ? module.vocab.filter((v) => v.category === "clothes-core").slice(0, 6)
        : module.vocab
            .filter((v) => v.category === "seasons" || v.category === "weather")
            .slice(0, 6);
    setDeckMode(nextMode);
    setCards(buildDeck(source));
    setFlippedIds([]);
    setMatchedPairIds([]);
    setMoves(0);
    setLocked(false);
  };

  const handleCardTap = (card: MemoryCard) => {
    if (locked) return;
    if (flippedIds.includes(card.uid) || matchedPairIds.includes(card.pairId)) return;

    audioManager.playFlip();
    void audioManager.speak(card.item.term, {
      audioKey: card.item.audioKey,
      lang: module.speechLang,
    });

    const nextFlipped = [...flippedIds, card.uid];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const first = cards.find((c) => c.uid === nextFlipped[0]);
      const second = card;

      if (first && first.pairId === second.pairId) {
        audioManager.playSuccess();
        const nextMatched = [...matchedPairIds, second.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedIds([]);

        if (nextMatched.length === pairItems.length) {
          const stars = moves + 1 <= 10 ? 3 : moves + 1 <= 15 ? 2 : 1;
          recordGameCompletion(module.id, "memory", stars);
        }
      } else {
        setLocked(true);
        setTimeout(() => {
          setFlippedIds([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const allMatched = pairItems.length > 0 && matchedPairIds.length === pairItems.length;

  if (allMatched) {
    const stars = moves <= 10 ? 3 : moves <= 15 ? 2 : 1;
    return (
      <RoundSummary
        title={`Super pamięć! Wszystkie pary w ${moves} ruchach!`}
        correctCount={pairItems.length}
        totalCount={pairItems.length}
        stars={stars}
        onReplay={() => resetDeck(deckMode)}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="game-stage">
      <GameHeader
        title="Memory Audio"
        onBack={onBack}
        currentStep={matchedPairIds.length}
        totalSteps={pairItems.length}
        score={matchedPairIds.length}
      />

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <button
          type="button"
          className={`btn btn-soft ${deckMode === "clothes" ? "btn-active-pill" : ""}`}
          onClick={() => resetDeck("clothes")}
        >
          Ubrania (6 par)
        </button>
        <button
          type="button"
          className={`btn btn-soft ${deckMode === "weather-seasons" ? "btn-active-pill" : ""}`}
          onClick={() => resetDeck("weather-seasons")}
        >
          Pogoda i Pory roku (6 par)
        </button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <p
          style={{
            textAlign: "center",
            color: "var(--ink-secondary)",
            fontWeight: 700,
            margin: "0 0 16px",
          }}
        >
          Połącz obrazek ze słówkiem po angielsku! Każda karta mówi na głos. Ruchy: {moves}
        </p>

        <div className="memory-grid">
          {cards.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId);
            const isOpen = isMatched || flippedIds.includes(card.uid);

            return (
              <button
                key={card.uid}
                type="button"
                className={`memory-card ${!isOpen ? "face-down" : ""} ${
                  isMatched ? "matched" : ""
                }`}
                onClick={() => handleCardTap(card)}
                aria-label={isOpen ? card.item.term : "Zakryta karta Memory"}
              >
                {!isOpen ? (
                  <Sparkles size={34} />
                ) : card.kind === "visual" ? (
                  <>
                    <StoryVisual visual={card.item.visual} size={84} />
                    <Volume2 size={16} color="#3B82F6" />
                  </>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div
                      className="font-display"
                      style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: 4 }}
                    >
                      {card.item.term}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--ink-secondary)", fontWeight: 700 }}>
                      {card.item.translation}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
