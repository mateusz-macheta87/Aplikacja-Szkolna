"use client";

import React from "react";
import type { ColourName, VisualSpec } from "@/types/content";

export const COLOUR_PALETTE: Record<
  ColourName,
  { fill: string; shade: string; accent: string; labelPl: string; labelEn: string }
> = {
  red: {
    fill: "#EF4444",
    shade: "#B91C1C",
    accent: "#FCA5A5",
    labelPl: "czerwony",
    labelEn: "red",
  },
  blue: {
    fill: "#3B82F6",
    shade: "#1D4ED8",
    accent: "#93C5FD",
    labelPl: "niebieski",
    labelEn: "blue",
  },
  yellow: {
    fill: "#FACC15",
    shade: "#CA8A04",
    accent: "#FEF08A",
    labelPl: "żółty",
    labelEn: "yellow",
  },
  green: {
    fill: "#22C55E",
    shade: "#15803D",
    accent: "#86EFAC",
    labelPl: "zielony",
    labelEn: "green",
  },
  purple: {
    fill: "#9333EA",
    shade: "#6B21A8",
    accent: "#D8B4FE",
    labelPl: "fioletowy",
    labelEn: "purple",
  },
  pink: {
    fill: "#F472B6",
    shade: "#BE185D",
    accent: "#FBCFE8",
    labelPl: "różowy",
    labelEn: "pink",
  },
  orange: {
    fill: "#F97316",
    shade: "#C2410C",
    accent: "#FDBA74",
    labelPl: "pomarańczowy",
    labelEn: "orange",
  },
  brown: {
    fill: "#A16207",
    shade: "#713F12",
    accent: "#D6B28D",
    labelPl: "brązowy",
    labelEn: "brown",
  },
  black: {
    fill: "#334155",
    shade: "#0F172A",
    accent: "#94A3B8",
    labelPl: "czarny",
    labelEn: "black",
  },
  white: {
    fill: "#F8FAFC",
    shade: "#CBD5E1",
    accent: "#E2E8F0",
    labelPl: "biały",
    labelEn: "white",
  },
};

const INK = "#3A2A1E";

interface StoryVisualProps {
  visual: VisualSpec;
  size?: number;
  uncolored?: boolean;
  className?: string;
}

export function StoryVisual({
  visual,
  size = 110,
  uncolored = false,
  className = "",
}: StoryVisualProps) {
  const palette = uncolored
    ? { fill: "#FFFDF7", shade: "#DDD2C0", accent: "#F5EFE4" }
    : COLOUR_PALETTE[visual.color ?? "red"];

  const { fill, shade, accent } = palette;

  const renderGraphic = () => {
    switch (visual.kind) {
      case "coat":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Hood */}
            <path d="M40 24 Q60 8 80 24 L74 36 L46 36 Z" fill={shade} />
            {/* Sleeves & Body */}
            <path
              d="M44 30 L18 56 L28 66 L40 54 L36 102 L84 102 L80 54 L92 66 L102 56 L76 30 Z"
              fill={fill}
            />
            {/* Center lapel */}
            <line x1="60" y1="32" x2="60" y2="102" />
            {/* Collar */}
            <path d="M44 30 L60 44 L76 30" fill={accent} />
            {/* Toggle buttons */}
            <line x1="53" y1="54" x2="67" y2="54" strokeWidth="3.5" />
            <line x1="53" y1="68" x2="67" y2="68" strokeWidth="3.5" />
            <line x1="53" y1="82" x2="67" y2="82" strokeWidth="3.5" />
            {/* Pockets */}
            <rect x="42" y="74" width="12" height="14" rx="3" fill={shade} opacity="0.45" />
            <rect x="66" y="74" width="12" height="14" rx="3" fill={shade} opacity="0.45" />
          </g>
        );

      case "trousers":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M34 18 L86 18 L90 104 L67 104 L60 52 L53 104 L30 104 Z"
              fill={fill}
            />
            <line x1="34" y1="28" x2="86" y2="28" />
            <line x1="60" y1="28" x2="60" y2="48" />
            <circle cx="60" cy="23" r="2.2" fill={accent} />
            {/* Cuffs */}
            <rect x="30" y="96" width="23" height="8" rx="2" fill={accent} />
            <rect x="67" y="96" width="23" height="8" rx="2" fill={accent} />
            {/* Pockets */}
            <path d="M36 33 Q45 37 46 46" fill="none" />
            <path d="M84 33 Q75 37 74 46" fill="none" />
          </g>
        );

      case "t-shirt":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M42 22 L18 42 L30 56 L40 48 L40 100 L80 100 L80 48 L90 56 L102 42 L78 22 Q60 34 42 22 Z"
              fill={fill}
            />
            <path d="M44 23 Q60 38 76 23" fill="none" stroke={shade} strokeWidth="3" />
            {/* Star emblem */}
            <path
              d="M60 48 L63 56 L72 56 L65 61 L68 69 L60 64 L52 69 L55 61 L48 56 L57 56 Z"
              fill={accent}
              strokeWidth="2.2"
            />
          </g>
        );

      case "jumper":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M44 22 L16 50 L26 62 L38 50 L38 98 L82 98 L82 50 L94 62 L104 50 L76 22 Z"
              fill={fill}
            />
            {/* Cozy ribbed collar, cuffs, hem */}
            <rect x="44" y="18" width="32" height="10" rx="5" fill={accent} />
            <rect x="38" y="90" width="44" height="9" rx="3" fill={accent} />
            {/* Knit stripe pattern */}
            <path
              d="M40 54 L46 48 L52 54 L58 48 L64 54 L70 48 L76 54 L80 50"
              fill="none"
              stroke={accent}
              strokeWidth="4"
            />
            <line x1="40" y1="64" x2="80" y2="64" stroke={shade} strokeWidth="3" strokeDasharray="5 5" />
          </g>
        );

      case "skirt":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M38 26 L82 26 L100 94 Q60 104 20 94 Z" fill={fill} />
            <rect x="36" y="20" width="48" height="10" rx="4" fill={shade} />
            {/* Decorative stripes / pleats */}
            <path d="M29 66 Q60 74 91 66" fill="none" stroke={accent} strokeWidth="4.5" />
            <path d="M24 81 Q60 90 96 81" fill="none" stroke={shade} strokeWidth="3.5" />
            <line x1="50" y1="31" x2="42" y2="95" strokeOpacity="0.45" />
            <line x1="70" y1="31" x2="78" y2="95" strokeOpacity="0.45" />
          </g>
        );

      case "shorts":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M28 24 L92 24 L100 84 L66 84 L60 62 L54 84 L20 84 Z"
              fill={fill}
            />
            <line x1="28" y1="34" x2="92" y2="34" />
            <circle cx="60" cy="29" r="2.4" fill={accent} />
            <line x1="60" y1="34" x2="60" y2="54" />
            <rect x="20" y="76" width="34" height="8" rx="2" fill={accent} />
            <rect x="66" y="76" width="34" height="8" rx="2" fill={accent} />
          </g>
        );

      case "shoes":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Left sneaker */}
            <path d="M14 58 L28 42 L44 52 L58 58 Q62 66 56 72 L14 72 Z" fill={fill} />
            <rect x="12" y="68" width="46" height="8" rx="4" fill="#FFFDF7" />
            <line x1="34" y1="48" x2="40" y2="52" stroke="#FFFDF7" strokeWidth="2.5" />
            <line x1="40" y1="52" x2="46" y2="55" stroke="#FFFDF7" strokeWidth="2.5" />
            {/* Right sneaker */}
            <path d="M62 78 L76 62 L92 72 L106 78 Q110 86 104 92 L62 92 Z" fill={fill} />
            <rect x="60" y="88" width="46" height="8" rx="4" fill="#FFFDF7" />
            <line x1="82" y1="68" x2="88" y2="72" stroke="#FFFDF7" strokeWidth="2.5" />
            <line x1="88" y1="72" x2="94" y2="75" stroke="#FFFDF7" strokeWidth="2.5" />
          </g>
        );

      case "cap":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Dome */}
            <path d="M22 74 C22 38 84 36 86 74 Z" fill={fill} />
            {/* Visor / Brim */}
            <path d="M74 68 C94 68 108 74 106 82 C92 84 74 82 54 78 Z" fill={shade} />
            {/* Top button */}
            <circle cx="54" cy="40" r="4.5" fill={accent} />
            {/* Panel seam */}
            <path d="M54 44 C50 56 50 66 52 74" fill="none" strokeOpacity="0.55" />
          </g>
        );

      case "shirt":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M42 24 L18 52 L28 62 L38 52 L38 100 L82 100 L82 52 L92 62 L102 52 L78 24 Z"
              fill={fill}
            />
            <polygon points="44,24 60,40 52,44 38,30" fill={accent} />
            <polygon points="76,24 60,40 68,44 82,30" fill={accent} />
            <line x1="60" y1="40" x2="60" y2="100" />
            <circle cx="60" cy="52" r="2" fill={INK} />
            <circle cx="60" cy="66" r="2" fill={INK} />
            <circle cx="60" cy="80" r="2" fill={INK} />
          </g>
        );

      case "hat":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Pom-pom */}
            <circle cx="60" cy="22" r="10" fill={accent} />
            {/* Beanie dome */}
            <path d="M26 74 C26 38 94 38 94 74 Z" fill={fill} />
            {/* Folded cuff */}
            <rect x="20" y="70" width="80" height="18" rx="8" fill={shade} />
            <line x1="36" y1="70" x2="36" y2="88" strokeOpacity="0.4" />
            <line x1="52" y1="70" x2="52" y2="88" strokeOpacity="0.4" />
            <line x1="68" y1="70" x2="68" y2="88" strokeOpacity="0.4" />
            <line x1="84" y1="70" x2="84" y2="88" strokeOpacity="0.4" />
          </g>
        );

      case "slippers":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Cute bunny slippers */}
            <ellipse cx="38" cy="70" rx="22" ry="15" fill={fill} />
            <ellipse cx="30" cy="48" rx="6" ry="14" fill={accent} />
            <ellipse cx="44" cy="48" rx="6" ry="14" fill={accent} />
            <circle cx="32" cy="68" r="2" fill={INK} />
            <circle cx="44" cy="68" r="2" fill={INK} />

            <ellipse cx="82" cy="82" rx="22" ry="15" fill={fill} />
            <ellipse cx="74" cy="60" rx="6" ry="14" fill={accent} />
            <ellipse cx="88" cy="60" rx="6" ry="14" fill={accent} />
            <circle cx="76" cy="80" r="2" fill={INK} />
            <circle cx="88" cy="80" r="2" fill={INK} />
          </g>
        );

      case "dressing-gown":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M42 22 L16 52 L28 64 L38 54 L32 104 L88 104 L82 54 L92 64 L104 52 L78 22 Z"
              fill={fill}
            />
            <path d="M44 22 L60 54 L76 22" fill="none" stroke={accent} strokeWidth="6" />
            {/* Tie belt */}
            <rect x="35" y="64" width="50" height="8" rx="3" fill={accent} />
            <path d="M56 72 L48 88 M64 72 L72 88" stroke={accent} strokeWidth="5" />
          </g>
        );

      case "pyjamas":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Pyjama top */}
            <path
              d="M36 16 L18 32 L26 42 L34 36 L34 62 L66 62 L66 36 L74 42 L82 32 L64 16 Z"
              fill={fill}
            />
            {/* Pyjama trousers */}
            <path
              d="M66 54 L102 54 L104 104 L88 104 L84 74 L80 104 L64 104 Z"
              fill={fill}
            />
            {/* Stars/moon print */}
            <circle cx="48" cy="38" r="4" fill={accent} stroke="none" />
            <circle cx="56" cy="48" r="3" fill={accent} stroke="none" />
            <circle cx="76" cy="76" r="3.5" fill={accent} stroke="none" />
            <circle cx="92" cy="84" r="3.5" fill={accent} stroke="none" />
          </g>
        );

      case "sunny":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="60"
                y1="14"
                x2="60"
                y2="26"
                stroke="#F59E0B"
                strokeWidth="5"
                transform={`rotate(${deg} 60 60)`}
              />
            ))}
            <circle cx="60" cy="60" r="24" fill="#FACC15" />
            <circle cx="52" cy="56" r="2.3" fill={INK} stroke="none" />
            <circle cx="68" cy="56" r="2.3" fill={INK} stroke="none" />
            <path d="M52 65 Q60 72 68 65" fill="none" />
          </g>
        );

      case "cloudy":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M28 76 H92 C102 76 106 62 96 56 C96 40 78 34 68 42 C60 28 36 32 34 50 C20 52 18 76 28 76 Z"
              fill="#CBD5E1"
            />
            <path
              d="M20 86 H76 C84 86 88 74 78 70 C78 58 64 54 56 60 C50 48 30 52 28 66 C16 68 14 86 20 86 Z"
              fill="#E2E8F0"
            />
          </g>
        );

      case "rainy":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M24 64 H94 C104 64 106 50 96 46 C96 30 78 24 66 34 C58 20 36 24 34 40 C20 42 16 64 24 64 Z"
              fill="#94A3B8"
            />
            {[34, 52, 70, 86].map((x, idx) => (
              <path
                key={x}
                d={`M${x} ${74 + (idx % 2) * 6} Q${x - 5} ${86 + (idx % 2) * 6} ${x} ${92 + (idx % 2) * 6} Q${x + 5} ${86 + (idx % 2) * 6} ${x} ${74 + (idx % 2) * 6} Z`}
                fill="#38BDF8"
                stroke="#0284C7"
                strokeWidth="2.4"
              />
            ))}
          </g>
        );

      case "snowy":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M24 58 H94 C104 58 106 44 96 40 C96 26 78 20 66 30 C58 18 36 20 34 36 C20 38 16 58 24 58 Z"
              fill="#E0F2FE"
            />
            {[
              [36, 78],
              [60, 86],
              [84, 76],
              [48, 98],
              [74, 98],
            ].map(([cx, cy]) => (
              <g key={`${cx}-${cy}`} stroke="#38BDF8" strokeWidth="2.8">
                <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} />
                <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} />
                <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} />
                <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} />
              </g>
            ))}
          </g>
        );

      case "hot":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="44" cy="46" r="20" fill="#FB923C" />
            <rect x="76" y="22" width="16" height="58" rx="8" fill="#FFFDF7" />
            <circle cx="84" cy="86" r="14" fill="#EF4444" />
            <rect x="80" y="34" width="8" height="48" rx="4" fill="#EF4444" stroke="none" />
          </g>
        );

      case "cold":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Big crisp snowflake */}
            <g stroke="#0EA5E9" strokeWidth="4.2">
              <line x1="60" y1="18" x2="60" y2="102" />
              <line x1="18" y1="60" x2="102" y2="60" />
              <line x1="30" y1="30" x2="90" y2="90" />
              <line x1="90" y1="30" x2="30" y2="90" />
            </g>
            <circle cx="60" cy="60" r="12" fill="#BAE6FD" stroke="#0284C7" />
          </g>
        );

      case "spring":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="60" cy="102" rx="34" ry="8" fill="#86EFAC" stroke="none" />
            <path d="M54 102 L56 64 L64 64 L66 102 Z" fill="#92400E" />
            <circle cx="60" cy="48" r="26" fill="#F9A8D4" />
            <circle cx="42" cy="54" r="17" fill="#FBCFE8" />
            <circle cx="78" cy="54" r="17" fill="#FBCFE8" />
            <circle cx="52" cy="40" r="4" fill="#FFFDF7" stroke="none" />
            <circle cx="70" cy="46" r="4" fill="#FFFDF7" stroke="none" />
            <circle cx="58" cy="56" r="3.5" fill="#F472B6" stroke="none" />
          </g>
        );

      case "summer":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="94" cy="24" r="11" fill="#FACC15" stroke="#F59E0B" />
            <ellipse cx="60" cy="102" rx="34" ry="8" fill="#4ADE80" stroke="none" />
            <path d="M54 102 L56 64 L64 64 L66 102 Z" fill="#92400E" />
            <circle cx="60" cy="48" r="27" fill="#16A34A" />
            <circle cx="40" cy="56" r="17" fill="#22C55E" />
            <circle cx="80" cy="56" r="17" fill="#22C55E" />
            <circle cx="52" cy="44" r="4" fill="#EF4444" stroke="none" />
            <circle cx="72" cy="52" r="4" fill="#EF4444" stroke="none" />
          </g>
        );

      case "autumn":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="60" cy="102" rx="34" ry="8" fill="#FDBA74" stroke="none" />
            <path d="M54 102 L56 64 L64 64 L66 102 Z" fill="#78350F" />
            <circle cx="60" cy="48" r="26" fill="#EA580C" />
            <circle cx="40" cy="56" r="17" fill="#F59E0B" />
            <circle cx="80" cy="56" r="17" fill="#DC2626" />
            <circle cx="30" cy="92" r="4" fill="#EA580C" stroke="none" />
            <circle cx="86" cy="94" r="4" fill="#F59E0B" stroke="none" />
          </g>
        );

      case "winter":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="60" cy="102" rx="38" ry="10" fill="#E0F2FE" stroke="#BAE6FD" />
            <path d="M54 100 L56 60 L64 60 L66 100 Z" fill="#78350F" />
            {/* Bare winter branches */}
            <path d="M60 66 L36 42 M60 58 L84 36 M60 60 L60 28 M46 52 L34 54 M74 46 L86 50" fill="none" stroke="#78350F" strokeWidth="4.5" />
            {/* Falling snow dots */}
            <circle cx="30" cy="28" r="3.5" fill="#38BDF8" stroke="none" />
            <circle cx="90" cy="24" r="3.5" fill="#38BDF8" stroke="none" />
            <circle cx="24" cy="68" r="3" fill="#38BDF8" stroke="none" />
            <circle cx="96" cy="68" r="3" fill="#38BDF8" stroke="none" />
          </g>
        );

      case "ice-cream":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="42,60 78,60 60,106" fill="#F59E0B" />
            <circle cx="48" cy="50" r="15" fill="#F472B6" />
            <circle cx="72" cy="50" r="15" fill="#FDE047" />
            <circle cx="60" cy="34" r="15" fill="#FFFDF7" />
            <circle cx="60" cy="18" r="5" fill="#EF4444" />
          </g>
        );

      case "soup":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 60 H98 C96 88 80 98 60 98 C40 98 24 88 22 60 Z" fill="#EF4444" />
            <ellipse cx="60" cy="60" rx="38" ry="10" fill="#FB923C" />
            <path d="M44 42 Q40 32 46 24" fill="none" stroke="#94A3B8" strokeWidth="3.5" />
            <path d="M60 38 Q56 28 62 20" fill="none" stroke="#94A3B8" strokeWidth="3.5" />
            <path d="M76 42 Q72 32 78 24" fill="none" stroke="#94A3B8" strokeWidth="3.5" />
          </g>
        );

      case "color-swatch":
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Cute chunky crayon */}
            <path d="M28 76 L72 32 L88 48 L44 92 L24 96 Z" fill={fill} />
            <line x1="40" y1="64" x2="56" y2="80" stroke={shade} strokeWidth="5" />
            <line x1="62" y1="42" x2="78" y2="58" stroke={shade} strokeWidth="5" />
            <circle cx="88" cy="30" r="10" fill={fill} opacity="0.25" stroke="none" />
          </g>
        );

      case "moon-sleep":
        return (
          <g stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M72 24 C46 24 28 44 28 64 C28 86 48 100 72 96 C54 90 48 74 52 56 C55 42 62 32 72 24 Z"
              fill="#FACC15"
            />
            <circle cx="86" cy="40" r="4" fill="#FDE047" stroke="none" />
            <circle cx="94" cy="62" r="3" fill="#FDE047" stroke="none" />
          </g>
        );

      case "clothes-rack":
      default:
        return (
          <g stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="20" y1="30" x2="100" y2="30" />
            <line x1="26" y1="30" x2="26" y2="96" />
            <line x1="94" y1="30" x2="94" y2="96" />
            <rect x="34" y="42" width="18" height="36" rx="4" fill="#EF4444" />
            <rect x="56" y="42" width="18" height="36" rx="4" fill="#3B82F6" />
            <rect x="76" y="42" width="14" height="36" rx="4" fill="#FACC15" />
          </g>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={visual.kind}
    >
      {renderGraphic()}
    </svg>
  );
}
