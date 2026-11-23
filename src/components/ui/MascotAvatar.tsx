"use client";

import React from "react";
import { useProgress } from "@/lib/progressStore";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface MascotAvatarProps {
  size?: number;
  cheering?: boolean;
  className?: string;
  showAccessories?: boolean;
}

export function MascotAvatar({
  size = 96,
  cheering = false,
  className = "",
  showAccessories = true,
}: MascotAvatarProps) {
  const { state } = useProgress();
  const equipped = showAccessories ? state.equippedAccessories : [];
  const src = cheering
    ? `${BASE_PATH}/art/mascot-cheering.webp`
    : `${BASE_PATH}/art/mascot-main.webp`;

  const badgeSize = Math.max(18, Math.round(size * 0.28));

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
        src={src}
        alt="Bzyczek"
        width={size}
        height={size}
        className="mascot-avatar"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
      />

      {equipped.includes("acc-crown") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -Math.round(badgeSize * 0.35),
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: badgeSize,
            lineHeight: 1,
            filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
          }}
        >
          👑
        </span>
      )}

      {equipped.includes("acc-flower") && !equipped.includes("acc-crown") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -Math.round(badgeSize * 0.2),
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: badgeSize,
            lineHeight: 1,
          }}
        >
          🌸
        </span>
      )}

      {equipped.includes("acc-wings") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -Math.round(badgeSize * 0.35),
            top: "14%",
            fontSize: badgeSize,
            lineHeight: 1,
          }}
        >
          🦋
        </span>
      )}

      {equipped.includes("acc-wand") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -Math.round(badgeSize * 0.3),
            bottom: "10%",
            fontSize: badgeSize,
            lineHeight: 1,
          }}
        >
          🪄
        </span>
      )}

      {equipped.includes("acc-scarf") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -Math.round(badgeSize * 0.2),
            bottom: -Math.round(badgeSize * 0.15),
            fontSize: Math.round(badgeSize * 0.9),
            lineHeight: 1,
          }}
        >
          🧣
        </span>
      )}

      {equipped.includes("acc-glasses") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: -Math.round(badgeSize * 0.2),
            top: "10%",
            fontSize: Math.round(badgeSize * 0.85),
            lineHeight: 1,
          }}
        >
          🕶️
        </span>
      )}

      {equipped.includes("acc-pin") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -Math.round(badgeSize * 0.28),
            transform: "translateX(-50%)",
            fontSize: Math.round(badgeSize * 0.82),
            lineHeight: 1,
          }}
        >
          ⭐
        </span>
      )}

      {equipped.includes("acc-pom") && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -Math.round(badgeSize * 0.15),
            top: -Math.round(badgeSize * 0.15),
            fontSize: Math.round(badgeSize * 0.82),
            lineHeight: 1,
          }}
        >
          ❄️
        </span>
      )}
    </div>
  );
}
