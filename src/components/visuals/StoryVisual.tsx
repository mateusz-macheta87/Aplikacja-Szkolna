"use client";

import React, { useId } from "react";
import type { ColourName, VisualSpec } from "@/types/content";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const COLOUR_PALETTE: Record<
  ColourName,
  {
    light: string;
    fill: string;
    shade: string;
    accent: string;
    halo: string;
    labelPl: string;
    labelEn: string;
  }
> = {
  red: {
    light: "#F87171",
    fill: "#E5484D",
    shade: "#B91C1C",
    accent: "#FFE4E6",
    halo: "#FFE4E6",
    labelPl: "czerwony",
    labelEn: "red",
  },
  blue: {
    light: "#60A5FA",
    fill: "#3B82F6",
    shade: "#1D4ED8",
    accent: "#DBEAFE",
    halo: "#E0F2FE",
    labelPl: "niebieski",
    labelEn: "blue",
  },
  yellow: {
    light: "#FEF08A",
    fill: "#FACC15",
    shade: "#D97706",
    accent: "#FFFBEB",
    halo: "#FEF9C3",
    labelPl: "żółty",
    labelEn: "yellow",
  },
  green: {
    light: "#86EFAC",
    fill: "#34C759",
    shade: "#15803D",
    accent: "#ECFDF5",
    halo: "#DCFCE7",
    labelPl: "zielony",
    labelEn: "green",
  },
  purple: {
    light: "#D8B4FE",
    fill: "#9F5AE8",
    shade: "#6D28D9",
    accent: "#F5F3FF",
    halo: "#F3E8FF",
    labelPl: "fioletowy",
    labelEn: "purple",
  },
  pink: {
    light: "#FBCFE8",
    fill: "#F472B6",
    shade: "#BE185D",
    accent: "#FFF1F7",
    halo: "#FCE7F3",
    labelPl: "różowy",
    labelEn: "pink",
  },
  orange: {
    light: "#FDBA74",
    fill: "#F97316",
    shade: "#C2410C",
    accent: "#FFF7ED",
    halo: "#FFEDD5",
    labelPl: "pomarańczowy",
    labelEn: "orange",
  },
  brown: {
    light: "#D6A87C",
    fill: "#A66A38",
    shade: "#6B3E1B",
    accent: "#F7E7D5",
    halo: "#F5EAD8",
    labelPl: "brązowy",
    labelEn: "brown",
  },
  black: {
    light: "#64748B",
    fill: "#334155",
    shade: "#0F172A",
    accent: "#E2E8F0",
    halo: "#E2E8F0",
    labelPl: "czarny",
    labelEn: "black",
  },
  white: {
    light: "#FFFFFF",
    fill: "#F8F4EC",
    shade: "#D6CBB8",
    accent: "#FFFBF2",
    halo: "#F7F1E5",
    labelPl: "biały",
    labelEn: "white",
  },
};

// Warm chestnut storybook ink (softer and cozier than harsh black)
const INK = "#5C3D2E";

interface StoryVisualProps {
  visual: VisualSpec;
  size?: number;
  uncolored?: boolean;
  className?: string;
}

function getWatercolorArtFile(visual: VisualSpec, uncolored: boolean): string | null {
  if (uncolored) return null;
  switch (visual.kind) {
    case "spring":
      return "season-spring.webp";
    case "summer":
      return "season-summer.webp";
    case "autumn":
      return "season-autumn.webp";
    case "winter":
      return "season-winter.webp";
    case "rainy":
      return "weather-rainy.webp";
    case "jumper":
      return visual.color === "yellow" ? "item-yellow-jumper.webp" : null;
    case "clothes-rack":
      return "wardrobe-closet.webp";
    default:
      return null;
  }
}

export function StoryVisual({
  visual,
  size = 110,
  uncolored = false,
  className = "",
}: StoryVisualProps) {
  const uid = useId().replace(/:/g, "");
  const watercolorFile = getWatercolorArtFile(visual, uncolored);

  if (watercolorFile) {
    return (
      <img
        src={`${BASE_PATH}/art/${watercolorFile}`}
        alt={visual.kind}
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.24),
          objectFit: "cover",
          border: "3px solid #FFFFFF",
          boxShadow: "0 5px 14px rgba(102, 70, 32, 0.14)",
          background: "#FFFBF2",
          display: "block",
        }}
      />
    );
  }

  const p = uncolored
    ? {
        light: "#FFFFFF",
        fill: "#FFFDF8",
        shade: "#E6DAC5",
        accent: "#FAF3E6",
        halo: "transparent",
      }
    : COLOUR_PALETTE[visual.color ?? "red"];

  const gradId = `g-${uid}`;
  const shadeGradId = `gs-${uid}`;
  const haloId = `gh-${uid}`;
  const fillRef = `url(#${gradId})`;
  const shadeRef = `url(#${shadeGradId})`;

  const renderSparkles = () =>
    !uncolored ? (
      <g opacity="0.7" fill="#F59E0B" stroke="none">
        <path d="M18 22 L20 27 L25 29 L20 31 L18 36 L16 31 L11 29 L16 27 Z" />
        <circle cx="102" cy="24" r="3" fill="#F472B6" />
        <circle cx="106" cy="92" r="2.6" fill="#60A5FA" />
        <circle cx="16" cy="90" r="2.2" fill="#4ADE80" />
      </g>
    ) : null;

  const renderGraphic = () => {
    switch (visual.kind) {
      case "coat":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Fluffy hood with cream fur trim */}
            <path d="M39 25 Q60 9 81 25 L75 37 L45 37 Z" fill={shadeRef} />
            <path d="M41 26 Q60 17 79 26" fill="none" stroke="#FFF9EE" strokeWidth="5.5" />
            <path d="M41 26 Q60 17 79 26" fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="3 4" />
            {/* Main body & sleeves */}
            <path
              d="M44 31 L17 57 L27 68 L39 56 L34 102 Q60 106 86 102 L81 56 L93 68 L103 57 L76 31 Z"
              fill={fillRef}
            />
            {/* Cozy collar */}
            <path d="M44 31 L60 46 L76 31" fill={p.accent} />
            {/* Center closure + stitching */}
            <line x1="60" y1="44" x2="60" y2="103" />
            <line x1="56" y1="48" x2="56" y2="99" strokeOpacity="0.35" strokeDasharray="3 4" />
            {/* Wooden toggle buttons */}
            {[55, 69, 83].map((y) => (
              <g key={y}>
                <line x1="52" y1={y} x2="68" y2={y} stroke="#8B5A2B" strokeWidth="3.6" />
                <circle cx="52" cy={y} r="2.2" fill="#E5C08D" stroke={INK} strokeWidth="1.4" />
                <circle cx="68" cy={y} r="2.2" fill="#E5C08D" stroke={INK} strokeWidth="1.4" />
              </g>
            ))}
            {/* Rounded patch pockets */}
            <path d="M40 74 H52 V86 Q46 90 40 86 Z" fill={shadeRef} opacity="0.65" />
            <path d="M68 74 H80 V86 Q74 90 68 86 Z" fill={shadeRef} opacity="0.65" />
            {/* Sleeve cuffs */}
            <path d="M18 56 L28 67" stroke={p.accent} strokeWidth="5" />
            <path d="M102 56 L92 67" stroke={p.accent} strokeWidth="5" />
          </g>
        );

      case "trousers":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M34 18 H86 L91 103 H67 L60 52 L53 103 H29 Z"
              fill={fillRef}
            />
            {/* Waistband & belt loops */}
            <rect x="34" y="18" width="52" height="10" rx="3" fill={shadeRef} />
            <circle cx="60" cy="23" r="2.6" fill="#FDE68A" />
            <line x1="44" y1="18" x2="44" y2="28" />
            <line x1="76" y1="18" x2="76" y2="28" />
            <line x1="60" y1="28" x2="60" y2="48" />
            {/* Soft curved denim pockets with dashed stitch */}
            <path d="M35 33 Q46 37 47 47" fill="none" strokeDasharray="3 3" />
            <path d="M85 33 Q74 37 73 47" fill="none" strokeDasharray="3 3" />
            {/* Rolled cuffs */}
            <rect x="29" y="94" width="24" height="9" rx="3" fill={p.accent} />
            <rect x="67" y="94" width="24" height="9" rx="3" fill={p.accent} />
          </g>
        );

      case "t-shirt":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M42 22 L17 43 L29 57 L39 49 L39 101 Q60 104 81 101 L81 49 L91 57 L103 43 L78 22 Q60 35 42 22 Z"
              fill={fillRef}
            />
            <path d="M43 23 Q60 38 77 23" fill="none" stroke={p.accent} strokeWidth="4.5" />
            <path d="M43 23 Q60 38 77 23" fill="none" stroke={INK} strokeWidth="2.2" />
            {/* Cute smiling golden star patch */}
            <path
              d="M60 44 L64 54 L75 54 L66 61 L69 72 L60 65 L51 72 L54 61 L45 54 L56 54 Z"
              fill={uncolored ? "#FFFDF8" : "#FDE047"}
              stroke={INK}
              strokeWidth="2.2"
            />
            {!uncolored && (
              <g stroke="none">
                <circle cx="57" cy="58" r="1.4" fill={INK} />
                <circle cx="63" cy="58" r="1.4" fill={INK} />
                <circle cx="54" cy="60.5" r="1.7" fill="#F472B6" opacity="0.65" />
                <circle cx="66" cy="60.5" r="1.7" fill="#F472B6" opacity="0.65" />
              </g>
            )}
          </g>
        );

      case "jumper":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M44 22 L15 51 L26 63 L38 51 L38 99 H82 V51 L94 63 L105 51 L76 22 Z"
              fill={fillRef}
            />
            {/* Ribbed collar & hem */}
            <rect x="43" y="17" width="34" height="11" rx="5.5" fill={p.accent} />
            <rect x="38" y="90" width="44" height="10" rx="4" fill={p.accent} />
            {/* Fairytale knitted zigzag & little dots */}
            <path
              d="M40 50 L47 43 L54 50 L60 43 L66 50 L73 43 L80 50"
              fill="none"
              stroke={p.accent}
              strokeWidth="4.2"
            />
            <path
              d="M40 62 H80"
              stroke={p.accent}
              strokeWidth="3.5"
              strokeDasharray="4 6"
            />
            {/* Sleeve rib cuffs */}
            <path d="M16 51 L26 62" stroke={p.accent} strokeWidth="5.5" />
            <path d="M104 51 L94 62" stroke={p.accent} strokeWidth="5.5" />
          </g>
        );

      case "skirt":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M38 27 H82 L101 94 Q60 105 19 94 Z" fill={fillRef} />
            <rect x="36" y="20" width="48" height="11" rx="5" fill={shadeRef} />
            {/* Cute bow on waistband */}
            <ellipse cx="54" cy="25" rx="6" ry="4" fill={p.accent} />
            <ellipse cx="66" cy="25" rx="6" ry="4" fill={p.accent} />
            <circle cx="60" cy="25" r="3.2" fill="#FDE68A" />
            {/* Scalloped decorative embroidery & pleats */}
            <path d="M27 72 Q60 81 93 72" fill="none" stroke={p.accent} strokeWidth="4.5" />
            <path d="M23 85 Q60 95 97 85" fill="none" stroke={p.accent} strokeWidth="3" strokeDasharray="3 5" />
            <line x1="49" y1="32" x2="41" y2="95" strokeOpacity="0.35" />
            <line x1="71" y1="32" x2="79" y2="95" strokeOpacity="0.35" />
          </g>
        );

      case "shorts":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M27 24 H93 L101 85 H66 L60 61 L54 85 H19 Z"
              fill={fillRef}
            />
            <rect x="27" y="24" width="66" height="10" rx="3" fill={shadeRef} />
            <circle cx="60" cy="29" r="2.6" fill="#FDE68A" />
            <line x1="60" y1="34" x2="60" y2="54" />
            <path d="M29 39 Q40 43 41 53" fill="none" strokeDasharray="3 3" />
            <path d="M91 39 Q80 43 79 53" fill="none" strokeDasharray="3 3" />
            {/* Rolled cuffs */}
            <rect x="19" y="76" width="35" height="9" rx="3" fill={p.accent} />
            <rect x="66" y="76" width="35" height="9" rx="3" fill={p.accent} />
          </g>
        );

      case "shoes":
        return (
          <g stroke={INK} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
            {/* Left fairytale sneaker */}
            <path d="M13 58 L28 40 L45 50 L59 57 Q63 66 57 72 H13 Z" fill={fillRef} />
            <path d="M46 54 Q57 56 59 68 H46 Z" fill="#FFFDF8" />
            <rect x="11" y="67" width="48" height="8" rx="4" fill="#FFFDF8" />
            <line x1="33" y1="47" x2="39" y2="51" stroke="#FFFDF8" strokeWidth="2.8" />
            <line x1="39" y1="51" x2="45" y2="54" stroke="#FFFDF8" strokeWidth="2.8" />
            {/* Right fairytale sneaker */}
            <path d="M61 78 L76 60 L93 70 L107 77 Q111 86 105 92 H61 Z" fill={fillRef} />
            <path d="M94 74 Q105 76 107 88 H94 Z" fill="#FFFDF8" />
            <rect x="59" y="87" width="48" height="8" rx="4" fill="#FFFDF8" />
            <line x1="81" y1="67" x2="87" y2="71" stroke="#FFFDF8" strokeWidth="2.8" />
            <line x1="87" y1="71" x2="93" y2="74" stroke="#FFFDF8" strokeWidth="2.8" />
          </g>
        );

      case "cap":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 75 C20 37 85 35 87 75 Z" fill={fillRef} />
            <path d="M74 69 C95 69 110 75 107 83 C92 86 73 84 52 79 Z" fill={shadeRef} />
            <circle cx="53" cy="40" r="5" fill={p.accent} />
            <path d="M53 45 C49 56 49 66 51 75" fill="none" strokeDasharray="3 3" strokeOpacity="0.65" />
            {/* Cute badge emblem */}
            <circle cx="67" cy="60" r="7" fill={p.accent} />
            <circle cx="67" cy="60" r="2.8" fill="#F59E0B" stroke="none" />
          </g>
        );

      case "shirt":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M42 24 L17 52 L28 63 L38 52 V100 H82 V52 L92 63 L103 52 L78 24 Z"
              fill={fillRef}
            />
            <polygon points="44,24 60,40 52,44 38,30" fill={p.accent} />
            <polygon points="76,24 60,40 68,44 82,30" fill={p.accent} />
            <line x1="60" y1="40" x2="60" y2="100" />
            {[52, 66, 80].map((y) => (
              <circle key={y} cx="60" cy={y} r="2.3" fill="#FDE68A" />
            ))}
            <rect x="66" y="49" width="11" height="12" rx="3" fill={shadeRef} opacity="0.45" />
          </g>
        );

      case "hat":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Fluffy wool pom-pom */}
            <circle cx="60" cy="23" r="12" fill={p.accent} />
            <path d="M55 21 Q60 16 65 21 M56 26 Q60 29 64 26" fill="none" strokeOpacity="0.45" />
            {/* Cozy knitted beanie dome */}
            <path d="M24 75 C24 37 96 37 96 75 Z" fill={fillRef} />
            <path d="M36 56 Q60 48 84 56" fill="none" stroke={p.accent} strokeWidth="4" strokeDasharray="5 5" />
            {/* Ribbed folded cuff */}
            <rect x="18" y="70" width="84" height="20" rx="9" fill={shadeRef} />
            {[32, 46, 60, 74, 88].map((x) => (
              <line key={x} x1={x} y1="71" x2={x} y2="89" strokeOpacity="0.45" />
            ))}
          </g>
        );

      case "slippers":
        return (
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {/* Left bunny slipper */}
            <ellipse cx="38" cy="70" rx="23" ry="15" fill={fillRef} />
            <ellipse cx="30" cy="46" rx="6" ry="15" fill={fillRef} />
            <ellipse cx="30" cy="47" rx="3" ry="10" fill={p.accent} stroke="none" />
            <ellipse cx="45" cy="46" rx="6" ry="15" fill={fillRef} />
            <ellipse cx="45" cy="47" rx="3" ry="10" fill={p.accent} stroke="none" />
            <circle cx="32" cy="67" r="2.2" fill={INK} stroke="none" />
            <circle cx="44" cy="67" r="2.2" fill={INK} stroke="none" />
            <circle cx="28" cy="71" r="2.8" fill="#F472B6" opacity="0.5" stroke="none" />
            <circle cx="48" cy="71" r="2.8" fill="#F472B6" opacity="0.5" stroke="none" />
            <path d="M35 72 Q38 75 41 72" fill="none" />

            {/* Right bunny slipper */}
            <ellipse cx="82" cy="83" rx="23" ry="15" fill={fillRef} />
            <ellipse cx="74" cy="59" rx="6" ry="15" fill={fillRef} />
            <ellipse cx="74" cy="60" rx="3" ry="10" fill={p.accent} stroke="none" />
            <ellipse cx="89" cy="59" rx="6" ry="15" fill={fillRef} />
            <ellipse cx="89" cy="60" rx="3" ry="10" fill={p.accent} stroke="none" />
            <circle cx="76" cy="80" r="2.2" fill={INK} stroke="none" />
            <circle cx="88" cy="80" r="2.2" fill={INK} stroke="none" />
            <circle cx="72" cy="84" r="2.8" fill="#F472B6" opacity="0.5" stroke="none" />
            <circle cx="92" cy="84" r="2.8" fill="#F472B6" opacity="0.5" stroke="none" />
            <path d="M79 85 Q82 88 85 85" fill="none" />
          </g>
        );

      case "dressing-gown":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <path
              d="M42 22 L15 52 L27 64 L38 54 L31 104 Q60 107 89 104 L82 54 L93 64 L105 52 L78 22 Z"
              fill={fillRef}
            />
            <path d="M44 22 L60 55 L76 22" fill="none" stroke={p.accent} strokeWidth="7" />
            <path d="M44 22 L60 55 L76 22" fill="none" stroke={INK} strokeWidth="2.2" />
            {/* Plush tied belt */}
            <rect x="34" y="64" width="52" height="8" rx="4" fill={p.accent} />
            <path d="M56 72 L47 89 M64 72 L73 89" stroke={p.accent} strokeWidth="5.5" />
            <circle cx="60" cy="68" r="4.2" fill={p.accent} />
          </g>
        );

      case "pyjamas":
        return (
          <g stroke={INK} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
            {/* Top */}
            <path
              d="M35 16 L16 33 L25 43 L33 36 V64 H67 V36 L75 43 L84 33 L65 16 Z"
              fill={fillRef}
            />
            <path d="M42 17 Q50 25 58 17" fill={p.accent} />
            {/* Trousers */}
            <path
              d="M66 53 H102 L105 104 H88 L84 74 L80 104 H63 Z"
              fill={fillRef}
            />
            {/* Dreamy moons & golden stars */}
            {!uncolored && (
              <g fill="#FEF08A" stroke="none">
                <circle cx="46" cy="38" r="4.2" />
                <circle cx="57" cy="50" r="3.4" />
                <circle cx="75" cy="75" r="3.6" />
                <circle cx="92" cy="84" r="3.8" />
                <circle cx="88" cy="64" r="2.8" />
              </g>
            )}
          </g>
        );

      case "sunny":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Warm watercolor sun glow */}
            <circle cx="60" cy="60" r="48" fill="#FEF08A" opacity="0.45" stroke="none" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="60"
                y1="14"
                x2="60"
                y2={deg % 60 === 0 ? "25" : "22"}
                stroke="#F59E0B"
                strokeWidth={deg % 60 === 0 ? "5.2" : "3.6"}
                transform={`rotate(${deg} 60 60)`}
              />
            ))}
            <circle cx="60" cy="60" r="26" fill="#FDE047" stroke="#D97706" strokeWidth="3" />
            <circle cx="52" cy="56" r="2.6" fill={INK} stroke="none" />
            <circle cx="68" cy="56" r="2.6" fill={INK} stroke="none" />
            <circle cx="46" cy="62" r="4" fill="#FB7185" opacity="0.55" stroke="none" />
            <circle cx="74" cy="62" r="4" fill="#FB7185" opacity="0.55" stroke="none" />
            <path d="M52 65 Q60 73 68 65" fill="none" />
          </g>
        );

      case "cloudy":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="62" r="48" fill="#E0F2FE" opacity="0.55" stroke="none" />
            {/* Back fluffy cloud */}
            <path
              d="M34 62 H94 C104 62 108 48 98 42 C98 26 78 20 68 29 C60 15 36 20 34 38 C22 40 20 62 34 62 Z"
              fill="#CBD5E1"
            />
            {/* Front smiling pearl cloud */}
            <path
              d="M20 86 H84 C95 86 99 70 88 64 C88 47 68 41 56 50 C48 35 24 41 22 59 C9 61 7 86 20 86 Z"
              fill="#F8FAFC"
            />
            <circle cx="45" cy="68" r="2.4" fill={INK} stroke="none" />
            <circle cx="63" cy="68" r="2.4" fill={INK} stroke="none" />
            <circle cx="39" cy="72" r="3.5" fill="#F9A8D4" opacity="0.7" stroke="none" />
            <circle cx="69" cy="72" r="3.5" fill="#F9A8D4" opacity="0.7" stroke="none" />
            <path d="M49 74 Q54 79 59 74" fill="none" />
          </g>
        );

      case "snowy":
        return (
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="60" r="48" fill="#E0F2FE" opacity="0.6" stroke="none" />
            <path
              d="M23 58 H95 C105 58 108 44 97 39 C97 24 78 18 66 28 C58 15 35 19 33 35 C19 37 15 58 23 58 Z"
              fill="#F0F9FF"
            />
            <circle cx="50" cy="42" r="2.2" fill={INK} stroke="none" />
            <circle cx="68" cy="42" r="2.2" fill={INK} stroke="none" />
            <path d="M55 47 Q59 51 63 47" fill="none" />
            {[
              [35, 78],
              [60, 86],
              [85, 76],
              [48, 99],
              [74, 99],
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
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="44" cy="46" r="28" fill="#FEF08A" opacity="0.55" stroke="none" />
            <circle cx="44" cy="46" r="20" fill="#FB923C" />
            <rect x="75" y="20" width="18" height="60" rx="9" fill="#FFFDF8" />
            <circle cx="84" cy="86" r="15" fill="#EF4444" />
            <rect x="79.5" y="32" width="9" height="50" rx="4.5" fill="#EF4444" stroke="none" />
          </g>
        );

      case "cold":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="60" r="46" fill="#E0F2FE" opacity="0.65" stroke="none" />
            <g stroke="#0EA5E9" strokeWidth="4.4">
              <line x1="60" y1="16" x2="60" y2="104" />
              <line x1="16" y1="60" x2="104" y2="60" />
              <line x1="28" y1="28" x2="92" y2="92" />
              <line x1="92" y1="28" x2="28" y2="92" />
            </g>
            <circle cx="60" cy="60" r="14" fill="#BAE6FD" stroke="#0284C7" />
            <circle cx="60" cy="60" r="5" fill="#FFFFFF" stroke="none" />
          </g>
        );

      case "ice-cream":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="60" r="46" fill="#FCE7F3" opacity="0.55" stroke="none" />
            <polygon points="41,60 79,60 60,108" fill="#F59E0B" />
            <line x1="48" y1="70" x2="72" y2="70" stroke="#B45309" strokeWidth="2" />
            <line x1="52" y1="82" x2="68" y2="82" stroke="#B45309" strokeWidth="2" />
            <circle cx="47" cy="50" r="15" fill="#F472B6" />
            <circle cx="73" cy="50" r="15" fill="#FDE047" />
            <circle cx="60" cy="34" r="16" fill="#FFFDF8" />
            <circle cx="60" cy="17" r="5.5" fill="#EF4444" />
          </g>
        );

      case "soup":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="64" r="46" fill="#FFEDD5" opacity="0.6" stroke="none" />
            <path d="M20 60 H100 C98 90 82 100 60 100 C38 100 22 90 20 60 Z" fill="#F43F5E" />
            <ellipse cx="60" cy="60" rx="40" ry="11" fill="#FB923C" />
            {/* Cute cream polka dots on bowl */}
            <circle cx="40" cy="78" r="3.5" fill="#FFFDF8" stroke="none" />
            <circle cx="60" cy="84" r="3.5" fill="#FFFDF8" stroke="none" />
            <circle cx="80" cy="78" r="3.5" fill="#FFFDF8" stroke="none" />
            <path d="M44 41 Q40 31 46 23" fill="none" stroke="#94A3B8" strokeWidth="3.5" />
            <path d="M60 37 Q56 27 62 19" fill="none" stroke="#94A3B8" strokeWidth="3.5" />
            <path d="M76 41 Q72 31 78 23" fill="none" stroke="#94A3B8" strokeWidth="3.5" />
          </g>
        );

      case "color-swatch":
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Fairytale wooden pencil / crayon */}
            <path d="M28 76 L72 32 L88 48 L44 92 L24 96 Z" fill={fillRef} />
            <polygon points="24,96 28,76 44,92" fill="#F6DFB5" />
            <polygon points="24,96 26,86 34,94" fill={p.fill} />
            <line x1="42" y1="62" x2="58" y2="78" stroke={p.accent} strokeWidth="4.5" />
            <line x1="62" y1="42" x2="78" y2="58" stroke={p.accent} strokeWidth="4.5" />
          </g>
        );

      case "moon-sleep":
      default:
        return (
          <g stroke={INK} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="60" cy="60" r="46" fill="#EDE9FE" opacity="0.6" stroke="none" />
            <path
              d="M72 22 C45 22 26 43 26 64 C26 87 48 102 74 96 C54 90 48 74 52 55 C55 41 62 30 72 22 Z"
              fill="#FDE047"
            />
            <circle cx="86" cy="38" r="4.5" fill="#F59E0B" stroke="none" />
            <circle cx="94" cy="62" r="3.2" fill="#F59E0B" stroke="none" />
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
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.light} />
          <stop offset="55%" stopColor={p.fill} />
          <stop offset="100%" stopColor={p.shade} />
        </linearGradient>
        <linearGradient id={shadeGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={p.fill} />
          <stop offset="100%" stopColor={p.shade} />
        </linearGradient>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={p.halo} stopOpacity="0.85" />
          <stop offset="100%" stopColor={p.halo} stopOpacity="0" />
        </radialGradient>
      </defs>

      {!uncolored && p.halo !== "transparent" && (
        <circle cx="60" cy="62" r="54" fill={`url(#${haloId})`} />
      )}
      {renderSparkles()}
      {renderGraphic()}
    </svg>
  );
}
