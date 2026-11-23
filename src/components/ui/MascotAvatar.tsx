"use client";

import React from "react";
import { FRAME_CHARMS, HERO_OUTFITS } from "@/content/rewards";
import { useProgress } from "@/lib/progressStore";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface MascotAvatarProps {
  size?: number;
  cheering?: boolean;
  className?: string;
  showAccessories?: boolean;
  outfitOverrideId?: string;
}

export function MascotAvatar({
  size = 96,
  cheering = false,
  className = "",
  showAccessories = true,
  outfitOverrideId,
}: MascotAvatarProps) {
  const { state } = useProgress();

  const chosenOutfitId = outfitOverrideId ?? state.activeOutfitId;
  const outfit =
    HERO_OUTFITS.find((o) => o.id === chosenOutfitId) ?? HERO_OUTFITS[0];

  // If cheering and wearing the default outfit, show cheering pose;
  // if wearing a special purchased outfit (Princess / Spring / Winter), always showcase her beloved outfit!
  const artFile =
    cheering && outfit.id === "outfit-default"
      ? "mascot-cheering.webp"
      : outfit.artFile;

  const activeCharm =
    showAccessories && state.activeCharmId
      ? FRAME_CHARMS.find((c) => c.id === state.activeCharmId)
      : undefined;

  const charmSize = Math.max(24, Math.round(size * 0.34));

  return (
    <div
      className={`mascot-wrap ${className}`}
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={`${BASE_PATH}/art/${artFile}`}
        alt={`Bzyczek — ${outfit.namePl}`}
        width={size}
        height={size}
        className="mascot-avatar"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
        }}
      />

      {activeCharm && (
        <img
          src={`${BASE_PATH}/art/${activeCharm.artFile}`}
          alt={activeCharm.namePl}
          width={charmSize}
          height={charmSize}
          style={{
            position: "absolute",
            right: -Math.round(charmSize * 0.24),
            top: -Math.round(charmSize * 0.24),
            width: charmSize,
            height: charmSize,
            borderRadius: "50%",
            border: "2.5px solid #FFFFFF",
            boxShadow: "0 4px 10px rgba(120, 74, 24, 0.24)",
            objectFit: "cover",
            background: "#FFFBF2",
          }}
        />
      )}
    </div>
  );
}
