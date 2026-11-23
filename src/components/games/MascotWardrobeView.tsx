"use client";

import React, { useState } from "react";
import { Check, Sparkles, Star } from "lucide-react";
import { WARDROBE_ACCESSORIES } from "@/content/rewards";
import { GameHeader } from "@/components/ui/GameHeader";
import { MascotAvatar } from "@/components/ui/MascotAvatar";
import { audioManager } from "@/lib/audioManager";
import { useProgress } from "@/lib/progressStore";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface MascotWardrobeViewProps {
  onBack: () => void;
}

export function MascotWardrobeView({ onBack }: MascotWardrobeViewProps) {
  const { state, buyAccessory, toggleAccessory } = useProgress();
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="game-stage">
      <GameHeader title="Garderoba Bzyczka" onBack={onBack} score={state.spendableStars} />

      {/* Stage with Dressed-up Bzyczek + Wooden Wardrobe Art */}
      <div
        className="card"
        style={{
          marginBottom: 22,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 24,
          background: "linear-gradient(135deg, #FFFDF7 0%, #FEF3C7 100%)",
        }}
      >
        <div style={{ padding: 10 }}>
          <MascotAvatar size={138} cheering={state.equippedAccessories.length > 0} />
        </div>

        <div>
          <h2 style={{ fontSize: "1.55rem", marginBottom: 6 }}>Wystrój swojego Bzyczka!</h2>
          <p style={{ margin: "0 0 12px", color: "var(--ink-secondary)", fontWeight: 700 }}>
            Wydawaj zdobyte gwiazdki na magiczne dodatki! Wybrane ozdoby Bzyczek będzie nosił na
            mapie i we wszystkich grach.
          </p>
          <div className="stat-pill stat-pill-amber" style={{ fontSize: "1.1rem" }}>
            <Star size={20} fill="#F59E0B" color="#D97706" />
            <span>{state.spendableStars} gwiazdek do wydania</span>
          </div>
          {notice && (
            <div style={{ marginTop: 10, fontWeight: 800, color: "var(--green-dark)" }}>
              {notice}
            </div>
          )}
        </div>

        <img
          src={`${BASE_PATH}/art/wardrobe-closet.webp`}
          alt="Drewniana szafa Bzyczka"
          width={126}
          height={126}
          style={{ borderRadius: 22, border: "3px solid #fff" }}
          className="hide-mobile"
        />
      </div>

      {/* Accessories Grid */}
      <div className="grid-4">
        {WARDROBE_ACCESSORIES.map((acc) => {
          const owned = state.ownedAccessories.includes(acc.id);
          const equipped = state.equippedAccessories.includes(acc.id);
          const canAfford = state.spendableStars >= acc.cost;

          return (
            <div
              key={acc.id}
              className="card"
              style={{
                padding: 18,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 10,
                borderColor: equipped ? "#F59E0B" : undefined,
                background: equipped ? "#FFFBEB" : "#FFFFFF",
              }}
            >
              <div>
                <div style={{ fontSize: "2.8rem", lineHeight: 1.15, marginBottom: 8 }}>
                  {acc.badgeEmoji}
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.06rem", marginBottom: 4 }}>
                  {acc.namePl}
                </div>
                <div style={{ fontSize: "0.86rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
                  {acc.description}
                </div>
              </div>

              {owned ? (
                <button
                  type="button"
                  className={`btn btn-pill ${equipped ? "btn-green" : "btn-soft"}`}
                  style={{ minHeight: 44, fontSize: "0.94rem", width: "100%" }}
                  onClick={() => {
                    audioManager.playClick();
                    toggleAccessory(acc.id);
                  }}
                >
                  {equipped ? (
                    <>
                      <Check size={17} />
                      <span>Założone</span>
                    </>
                  ) : (
                    <span>Załóż</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className={`btn btn-pill ${canAfford ? "btn-primary" : "btn-soft"}`}
                  disabled={!canAfford}
                  style={{ minHeight: 44, fontSize: "0.94rem", width: "100%" }}
                  onClick={() => {
                    if (buyAccessory(acc.id, acc.cost)) {
                      audioManager.playSuccess();
                      setNotice(`Kupiono i założono: ${acc.namePl}!`);
                    }
                  }}
                >
                  <Sparkles size={16} />
                  <span>Kup za {acc.cost} ★</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
