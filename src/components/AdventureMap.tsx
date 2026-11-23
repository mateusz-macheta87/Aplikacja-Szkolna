"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Lock, Star, Sparkles } from "lucide-react";
import type { VisualSpec } from "@/types/content";
import type { StationId } from "@/lib/progressStore";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { MascotAvatar } from "@/components/ui/MascotAvatar";
import { audioManager } from "@/lib/audioManager";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export interface MapStation {
  id: StationId;
  num: number;
  titleEn: string;
  titlePl: string;
  stickerId: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  ringBg: string;
  badgeBg: string;
  visual: VisualSpec;
}

export const UNIT1_MAP_STATIONS: MapStation[] = [
  {
    id: "s1-clothes",
    num: 1,
    titleEn: "Clothes",
    titlePl: "Ubrania",
    stickerId: "stk-clothes",
    x: 11,
    y: 20,
    ringBg: "#FFE4E6",
    badgeBg: "#16A34A",
    visual: { kind: "t-shirt", color: "red" },
  },
  {
    id: "s2-colours",
    num: 2,
    titleEn: "Colours",
    titlePl: "Kolory",
    stickerId: "stk-colours",
    x: 31,
    y: 14,
    ringBg: "#FEF3C7",
    badgeBg: "#16A34A",
    visual: { kind: "color-swatch", color: "purple" },
  },
  {
    id: "s3-wearing",
    num: 3,
    titleEn: "I'm wearing",
    titlePl: "Zdania",
    stickerId: "stk-wearing",
    x: 51,
    y: 22,
    ringBg: "#DBEAFE",
    badgeBg: "#16A34A",
    visual: { kind: "coat", color: "red" },
  },
  {
    id: "s4-dressup",
    num: 4,
    titleEn: "Dress up",
    titlePl: "Ubieranka",
    stickerId: "stk-dressup",
    x: 72,
    y: 15,
    ringBg: "#F3E8FF",
    badgeBg: "#16A34A",
    visual: { kind: "shorts", color: "purple" },
  },
  {
    id: "s5-seasons",
    num: 5,
    titleEn: "Seasons",
    titlePl: "Pory roku",
    stickerId: "stk-seasons",
    x: 88,
    y: 40,
    ringBg: "#FFEDD5",
    badgeBg: "#16A34A",
    visual: { kind: "autumn" },
  },
  {
    id: "s6-weather",
    num: 6,
    titleEn: "Weather",
    titlePl: "Pogoda",
    stickerId: "stk-weather",
    x: 69,
    y: 55,
    ringBg: "#FEF9C3",
    badgeBg: "#16A34A",
    visual: { kind: "sunny" },
  },
  {
    id: "s7-listen",
    num: 7,
    titleEn: "Bzyczek says",
    titlePl: "Słuchanie",
    stickerId: "stk-listen",
    x: 49,
    y: 50,
    ringBg: "#FCE7F3",
    badgeBg: "#16A34A",
    visual: { kind: "jumper", color: "yellow" },
  },
  {
    id: "s8-write",
    num: 8,
    titleEn: "Listen & write",
    titlePl: "Dyktando",
    stickerId: "stk-write",
    x: 28,
    y: 58,
    ringBg: "#E0F2FE",
    badgeBg: "#16A34A",
    visual: { kind: "trousers", color: "blue" },
  },
  {
    id: "s9-test",
    num: 9,
    titleEn: "Test",
    titlePl: "Sprawdzian",
    stickerId: "stk-test",
    x: 12,
    y: 78,
    ringBg: "#FFE4E6",
    badgeBg: "#DB2777",
    visual: { kind: "shoes", color: "yellow" },
  },
];

const TREASURE_POS = { x: 40, y: 82 };
const REQUIRED_STATIONS_FOR_TREASURE = 5;

interface AdventureMapProps {
  stationStars: Partial<Record<StationId, number>>;
  treasureOpened: boolean;
  onSelectStation: (station: MapStation) => void;
  onOpenTreasure: () => void;
}

export function AdventureMap({
  stationStars,
  treasureOpened,
  onSelectStation,
  onOpenTreasure,
}: AdventureMapProps) {
  const [treasureTip, setTreasureTip] = useState<string | null>(null);

  const completedCount = UNIT1_MAP_STATIONS.filter(
    (s) => (stationStars[s.id] ?? 0) > 0
  ).length;
  const treasureUnlocked = completedCount >= REQUIRED_STATIONS_FOR_TREASURE;

  // Find next station for Bzyczek to stand beside
  const currentStation =
    UNIT1_MAP_STATIONS.find((s) => (stationStars[s.id] ?? 0) === 0) ??
    UNIT1_MAP_STATIONS[UNIT1_MAP_STATIONS.length - 1];

  const pathPoints = [
    ...UNIT1_MAP_STATIONS.map((s) => `${s.x},${s.y}`),
    `${TREASURE_POS.x},${TREASURE_POS.y}`,
  ].join(" ");

  const handleTreasureClick = () => {
    if (!treasureUnlocked) {
      audioManager.playGentleTryAgain();
      setTreasureTip(
        `Zdobądź gwiazdki na ${REQUIRED_STATIONS_FOR_TREASURE} przystankach, aby otworzyć Skarb! (Masz ${completedCount}/${REQUIRED_STATIONS_FOR_TREASURE})`
      );
      return;
    }
    audioManager.playFanfare();
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#22C55E", "#F43F5E", "#3B82F6", "#FACC15"],
    });
    if (!treasureOpened) {
      onOpenTreasure();
      setTreasureTip("Hurra!! Otworzyłaś Skarb Bzyczka! +10 gwiazdek do Garderoby i złota naklejka!");
    } else {
      setTreasureTip("Skarb już otwarty! Twoje +10 gwiazdek czeka w Garderobie Bzyczka!");
    }
  };

  return (
    <section className="adventure-map-frame" aria-label="Mapa przygody przez cztery pory roku">
      {/* Watercolor Four Seasons Backdrop */}
      <img
        src={`${BASE_PATH}/art/map-seasons.webp`}
        alt=""
        aria-hidden="true"
        className="adventure-map-bg"
      />
      <div className="adventure-map-veil" aria-hidden="true" />

      {/* Winding Dotted Trail SVG */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="adventure-map-trail"
        aria-hidden="true"
      >
        <polyline
          points={pathPoints}
          fill="none"
          stroke="rgba(255, 251, 242, 0.85)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={pathPoints}
          fill="none"
          stroke="#C89B5B"
          strokeWidth="1.25"
          strokeDasharray="1.8 1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Station Nodes 1..9 */}
      {UNIT1_MAP_STATIONS.map((station) => {
        const stars = stationStars[station.id] ?? 0;
        const isCurrent = currentStation.id === station.id;

        return (
          <div
            key={station.id}
            className="map-node-anchor"
            style={{ left: `${station.x}%`, top: `${station.y}%` }}
          >
            {/* Mascot hopping beside active station */}
            {isCurrent && (
              <div className="map-mascot-buddy" aria-hidden="true">
                <MascotAvatar size={56} />
              </div>
            )}

            <button
              type="button"
              id={`map-station-${station.id}`}
              className={`map-node-btn ${isCurrent ? "is-current" : ""} ${
                stars > 0 ? "is-done" : ""
              }`}
              onClick={() => {
                audioManager.unlock();
                audioManager.playClick();
                onSelectStation(station);
              }}
            >
              <span
                className="map-node-num"
                style={{ backgroundColor: station.badgeBg }}
              >
                {station.num}
              </span>

              <span
                className="map-node-circle"
                style={{ backgroundColor: station.ringBg }}
              >
                <StoryVisual visual={station.visual} size={50} />
              </span>

              <span className="map-node-label">
                <strong className="map-node-en">{station.titleEn}</strong>
                <span className="map-node-pl">{station.titlePl}</span>
                <span className="map-node-stars" aria-label={`${stars} z 3 gwiazdek`}>
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={12}
                      fill={n <= stars ? "#F59E0B" : "#EDE3D2"}
                      color={n <= stars ? "#D97706" : "#C9B99F"}
                    />
                  ))}
                </span>
              </span>
            </button>
          </div>
        );
      })}

      {/* Treasure Chest Node */}
      <div
        className="map-node-anchor"
        style={{ left: `${TREASURE_POS.x}%`, top: `${TREASURE_POS.y}%` }}
      >
        <button
          type="button"
          id="map-station-treasure"
          className={`map-node-btn ${treasureUnlocked && !treasureOpened ? "is-current" : ""}`}
          onClick={handleTreasureClick}
        >
          <span
            className="map-node-circle"
            style={{
              backgroundColor: treasureUnlocked ? "#FEF3C7" : "#F3EDE2",
              overflow: "hidden",
              padding: 4,
            }}
          >
            <img
              src={`${BASE_PATH}/art/treasure-chest.webp`}
              alt="Skarb Bzyczka"
              width={60}
              height={60}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                filter: treasureUnlocked ? "none" : "grayscale(65%) opacity(0.75)",
              }}
            />
          </span>

          <span className="map-node-label">
            <strong className="map-node-en" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
              {treasureOpened ? <Sparkles size={12} color="#D97706" /> : !treasureUnlocked && <Lock size={11} />}
              Skarb
            </strong>
            <span className="map-node-pl">
              {treasureOpened
                ? "otwarty!"
                : treasureUnlocked
                ? "kliknij!"
                : `${completedCount}/${REQUIRED_STATIONS_FOR_TREASURE}`}
            </span>
          </span>
        </button>
      </div>

      {/* Floating Treasure Toast */}
      {treasureTip && (
        <div
          className="map-toast"
          onClick={() => setTreasureTip(null)}
          role="status"
        >
          <span>{treasureTip}</span>
        </div>
      )}
    </section>
  );
}
