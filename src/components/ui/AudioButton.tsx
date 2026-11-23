"use client";

import React, { useState } from "react";
import { Volume2, Turtle } from "lucide-react";
import { audioManager } from "@/lib/audioManager";
import type { SpeechLang } from "@/types/content";

interface AudioButtonProps {
  text: string;
  audioKey?: string;
  lang?: SpeechLang;
  label?: string;
  showSlowOption?: boolean;
  size?: "md" | "lg";
  pulse?: boolean;
}

export function AudioButton({
  text,
  audioKey,
  lang = "en-GB",
  label = "Posłuchaj",
  showSlowOption = true,
  size = "md",
  pulse = false,
}: AudioButtonProps) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = async (slow: boolean) => {
    setPlaying(true);
    try {
      await audioManager.speak(text, { audioKey, lang, slow });
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <button
        type="button"
        className={`btn btn-blue ${pulse || playing ? "sound-pulse" : ""}`}
        style={
          size === "lg"
            ? { minHeight: 62, padding: "14px 28px", fontSize: "1.18rem" }
            : undefined
        }
        onClick={(e) => {
          e.stopPropagation();
          void handlePlay(false);
        }}
        aria-label={`Posłuchaj: ${text}`}
      >
        <Volume2 size={size === "lg" ? 26 : 22} />
        <span>{label}</span>
      </button>

      {showSlowOption && (
        <button
          type="button"
          className="btn btn-soft"
          onClick={(e) => {
            e.stopPropagation();
            void handlePlay(true);
          }}
          title="Posłuchaj wolniej (tryb żółwia)"
          aria-label={`Posłuchaj wolniej: ${text}`}
        >
          <Turtle size={20} />
          <span>Wolniej</span>
        </button>
      )}
    </div>
  );
}
