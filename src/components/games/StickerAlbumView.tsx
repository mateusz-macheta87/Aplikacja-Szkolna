"use client";

import React from "react";
import { Lock, Volume2 } from "lucide-react";
import { STICKERS } from "@/content/rewards";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { GameHeader } from "@/components/ui/GameHeader";
import { audioManager } from "@/lib/audioManager";
import { useProgress } from "@/lib/progressStore";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface StickerAlbumViewProps {
  onBack: () => void;
}

export function StickerAlbumView({ onBack }: StickerAlbumViewProps) {
  const { state } = useProgress();
  const unlockedSet = new Set(state.unlockedStickers);

  return (
    <div className="game-stage">
      <GameHeader
        title={`Album naklejek (${unlockedSet.size} z ${STICKERS.length})`}
        onBack={onBack}
      />

      <div
        className="card"
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
          background: "linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%)",
        }}
      >
        <img
          src={`${BASE_PATH}/art/sticker-album.webp`}
          alt="Album naklejek"
          width={116}
          height={116}
          style={{ borderRadius: 22, border: "3px solid #fff", boxShadow: "0 6px 14px rgba(82,58,28,0.12)" }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: 6 }}>Twoja kolekcja naklejek</h2>
          <p style={{ margin: 0, color: "var(--ink-secondary)", fontWeight: 700 }}>
            Za każdy przystanek na mapie i dodatkowe gry zdobywasz kolorową naklejkę! Stuknij zdobytą
            naklejkę, aby usłyszeć angielskie zdanie.
          </p>
        </div>
      </div>

      <div className="grid-4">
        {STICKERS.map((stk) => {
          const isUnlocked = unlockedSet.has(stk.id);
          return (
            <button
              key={stk.id}
              type="button"
              className={`card ${isUnlocked ? "card-interactive" : ""}`}
              onClick={() => {
                if (!isUnlocked) return;
                audioManager.playFlip();
                void audioManager.speak(stk.phraseEn, {
                  audioKey: stk.audioKey,
                  lang: "en-GB",
                });
              }}
              style={{
                textAlign: "center",
                padding: "18px 14px",
                background: isUnlocked ? stk.bg : "#F7F3EA",
                borderStyle: isUnlocked ? "solid" : "dashed",
                opacity: isUnlocked ? 1 : 0.72,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isUnlocked ? (
                <>
                  <StoryVisual visual={stk.visual} size={86} />
                  <div style={{ fontWeight: 800, fontSize: "1rem" }}>{stk.namePl}</div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      color: "var(--blue-dark)",
                    }}
                  >
                    <Volume2 size={14} />
                    <span>Posłuchaj</span>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 78,
                      height: 78,
                      borderRadius: "50%",
                      background: "#EDE6D8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--ink-muted)",
                    }}
                  >
                    <Lock size={28} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "0.94rem", color: "var(--ink-muted)" }}>
                    {stk.namePl}
                  </div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--ink-muted)" }}>
                    {stk.unlockHint}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
