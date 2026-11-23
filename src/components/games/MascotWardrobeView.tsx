"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Check, Sparkles, Star } from "lucide-react";
import { FRAME_CHARMS, HERO_OUTFITS } from "@/content/rewards";
import { GameHeader } from "@/components/ui/GameHeader";
import { MascotAvatar } from "@/components/ui/MascotAvatar";
import { audioManager } from "@/lib/audioManager";
import { useProgress } from "@/lib/progressStore";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface MascotWardrobeViewProps {
  onBack: () => void;
}

export function MascotWardrobeView({ onBack }: MascotWardrobeViewProps) {
  const { state, buyAccessory, equipOutfit, equipCharm } = useProgress();
  const [notice, setNotice] = useState<string | null>(null);

  const activeOutfit =
    HERO_OUTFITS.find((o) => o.id === state.activeOutfitId) ?? HERO_OUTFITS[0];

  const celebratePurchase = (label: string) => {
    audioManager.playFanfare();
    confetti({
      particleCount: 65,
      spread: 65,
      origin: { y: 0.45 },
      colors: ["#F59E0B", "#F472B6", "#22C55E", "#60A5FA"],
    });
    setNotice(`Hurra! Założono: ${label}!`);
  };

  return (
    <div className="game-stage">
      <GameHeader title="Garderoba Bohaterki" onBack={onBack} score={state.spendableStars} />

      {/* Fairytale Dressing Room Stage */}
      <div
        className="card"
        style={{
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 24,
          background: "linear-gradient(135deg, #FFFDF7 0%, #FFEFE3 55%, #FEF3C7 100%)",
          borderColor: "#F3CE94",
        }}
      >
        <div style={{ padding: 6 }}>
          <MascotAvatar size={156} />
        </div>

        <div>
          <div
            style={{
              fontSize: "0.9rem",
              fontWeight: 800,
              color: "#B45309",
              marginBottom: 4,
            }}
          >
            Aktualny strój: {activeOutfit.namePl}
          </div>
          <h2 style={{ fontSize: "1.6rem", marginBottom: 6 }}>Bajkowa Szafa Bzyczka</h2>
          <p style={{ margin: "0 0 14px", color: "var(--ink-secondary)", fontWeight: 700, lineHeight: 1.45 }}>
            Wymieniaj zdobyte gwiazdki na ręcznie malowane stroje i magicznych towarzyszy! Wybrany
            strój bohaterka nosi na mapie i we wszystkich grach.
          </p>
          <div className="stat-pill stat-pill-amber" style={{ fontSize: "1.08rem" }}>
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
          alt="Drewniana bajkowa szafa"
          width={136}
          height={136}
          style={{
            borderRadius: 24,
            border: "3px solid #fff",
            boxShadow: "0 6px 16px rgba(120, 74, 24, 0.14)",
          }}
          className="hide-mobile"
        />
      </div>

      {/* Section 1: Full Watercolor Heroine Outfits */}
      <h3 style={{ fontSize: "1.4rem", marginBottom: 14 }}>Bajkowe stroje bohaterki</h3>
      <div className="grid-3" style={{ marginBottom: 28 }}>
        {HERO_OUTFITS.map((outfit) => {
          const owned =
            outfit.cost === 0 || state.ownedAccessories.includes(outfit.id);
          const equipped = state.activeOutfitId === outfit.id;
          const canAfford = state.spendableStars >= outfit.cost;

          return (
            <div
              key={outfit.id}
              className="card"
              style={{
                padding: 16,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
                borderColor: equipped ? "#F59E0B" : undefined,
                background: equipped
                  ? "linear-gradient(180deg, #FFFDF7 0%, #FEF3C7 100%)"
                  : "#FFFFFF",
              }}
            >
              <div>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
                  <img
                    src={`${BASE_PATH}/art/${outfit.artFile}`}
                    alt={outfit.namePl}
                    width={154}
                    height={154}
                    style={{
                      borderRadius: 24,
                      border: "3px solid #FFFFFF",
                      boxShadow: "0 6px 16px rgba(112, 74, 34, 0.14)",
                      objectFit: "cover",
                      filter: owned ? "none" : "saturate(0.88)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(255, 251, 242, 0.94)",
                      border: "1.5px solid #EBD6B4",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#92400E",
                    }}
                  >
                    {outfit.badgeText}
                  </span>
                </div>

                <div className="font-display" style={{ fontWeight: 700, fontSize: "1.22rem", marginBottom: 4 }}>
                  {outfit.namePl}
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
                  {outfit.description}
                </div>
              </div>

              {owned ? (
                <button
                  type="button"
                  className={`btn btn-pill ${equipped ? "btn-green" : "btn-soft"}`}
                  style={{ minHeight: 46, fontSize: "0.96rem", width: "100%" }}
                  onClick={() => {
                    audioManager.playClick();
                    equipOutfit(outfit.id);
                    setNotice(`Założono strój: ${outfit.namePl}!`);
                  }}
                >
                  {equipped ? (
                    <>
                      <Check size={18} />
                      <span>Założony!</span>
                    </>
                  ) : (
                    <span>Przebierz się</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className={`btn btn-pill ${canAfford ? "btn-primary" : "btn-soft"}`}
                  disabled={!canAfford}
                  style={{ minHeight: 46, fontSize: "0.96rem", width: "100%" }}
                  onClick={() => {
                    if (buyAccessory(outfit.id, outfit.cost)) {
                      celebratePurchase(outfit.namePl);
                    }
                  }}
                >
                  <Sparkles size={17} />
                  <span>Odkryj za {outfit.cost} ★</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Section 2: Watercolor Companions & Frame Charms */}
      <h3 style={{ fontSize: "1.4rem", marginBottom: 14 }}>Magiczne ozdoby i towarzysze</h3>
      <div className="grid-4">
        {FRAME_CHARMS.map((charm) => {
          const owned = state.ownedAccessories.includes(charm.id);
          const equipped = state.activeCharmId === charm.id;
          const canAfford = state.spendableStars >= charm.cost;

          return (
            <div
              key={charm.id}
              className="card"
              style={{
                padding: 14,
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
                <img
                  src={`${BASE_PATH}/art/${charm.artFile}`}
                  alt={charm.namePl}
                  width={106}
                  height={106}
                  style={{
                    borderRadius: 20,
                    border: "3px solid #FFF8EB",
                    boxShadow: "0 4px 12px rgba(112, 74, 34, 0.12)",
                    objectFit: "cover",
                    marginBottom: 8,
                  }}
                />
                <div className="font-display" style={{ fontWeight: 700, fontSize: "1.08rem", marginBottom: 3 }}>
                  {charm.namePl}
                </div>
                <div style={{ fontSize: "0.84rem", color: "var(--ink-secondary)", fontWeight: 600 }}>
                  {charm.description}
                </div>
              </div>

              {owned ? (
                <button
                  type="button"
                  className={`btn btn-pill ${equipped ? "btn-green" : "btn-soft"}`}
                  style={{ minHeight: 42, fontSize: "0.9rem", width: "100%" }}
                  onClick={() => {
                    audioManager.playClick();
                    equipCharm(equipped ? null : charm.id);
                  }}
                >
                  {equipped ? (
                    <>
                      <Check size={16} />
                      <span>Wybrany</span>
                    </>
                  ) : (
                    <span>Dodaj</span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className={`btn btn-pill ${canAfford ? "btn-primary" : "btn-soft"}`}
                  disabled={!canAfford}
                  style={{ minHeight: 42, fontSize: "0.9rem", width: "100%" }}
                  onClick={() => {
                    if (buyAccessory(charm.id, charm.cost)) {
                      celebratePurchase(charm.namePl);
                    }
                  }}
                >
                  <Sparkles size={15} />
                  <span>Kup za {charm.cost} ★</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
