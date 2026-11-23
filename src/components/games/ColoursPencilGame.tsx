"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Lightbulb, Volume2 } from "lucide-react";
import type { ClothingVisualType, ColourName, LearningModule } from "@/types/content";
import { COLOUR_PALETTE, StoryVisual } from "@/components/visuals/StoryVisual";
import { GameHeader } from "@/components/ui/GameHeader";
import { MascotAvatar } from "@/components/ui/MascotAvatar";
import { RoundSummary } from "@/components/ui/RoundSummary";
import { audioManager } from "@/lib/audioManager";
import { computeStars } from "@/lib/answerMatcher";
import { useProgress } from "@/lib/progressStore";

interface ColouringTask {
  id: string;
  sentence: string;
  audioKey: string;
  item: ClothingVisualType;
  targetColor: ColourName;
  hint: string;
}

const COLOURING_TASKS: ColouringTask[] = [
  {
    id: "col-1",
    sentence: "Colour the hat red.",
    audioKey: "s-colour-hat-red",
    item: "hat",
    targetColor: "red",
    hint: "„Red” to czerwony — wybierz czerwoną kredkę i stuknij czapkę!",
  },
  {
    id: "col-2",
    sentence: "Colour the coat yellow.",
    audioKey: "s-colour-coat-yellow",
    item: "coat",
    targetColor: "yellow",
    hint: "„Yellow” to żółty — pokoloruj płaszcz na żółto!",
  },
  {
    id: "col-3",
    sentence: "Colour the shorts purple.",
    audioKey: "s-colour-shorts-purple",
    item: "shorts",
    targetColor: "purple",
    hint: "„Purple” to fioletowy — dokładnie tak jak na sprawdzianie!",
  },
  {
    id: "col-4",
    sentence: "Colour the trousers blue.",
    audioKey: "s-colour-trousers-blue",
    item: "trousers",
    targetColor: "blue",
    hint: "„Blue” to niebieski — pokoloruj spodnie na niebiesko!",
  },
  {
    id: "col-5",
    sentence: "Colour the skirt pink.",
    audioKey: "s-colour-skirt-pink",
    item: "skirt",
    targetColor: "pink",
    hint: "„Pink” to różowy — stuknij różową kredkę i spódnicę!",
  },
  {
    id: "col-6",
    sentence: "Colour the jumper purple.",
    audioKey: "s-colour-jumper-purple",
    item: "jumper",
    targetColor: "purple",
    hint: "„Purple” to fioletowy — pokoloruj sweter na fioletowo!",
  },
  {
    id: "col-7",
    sentence: "Colour the shoes yellow.",
    audioKey: "s-colour-shoes-yellow",
    item: "shoes",
    targetColor: "yellow",
    hint: "„Yellow” to żółty — pokoloruj buty na żółto!",
  },
  {
    id: "col-8",
    sentence: "Colour the cap blue.",
    audioKey: "s-colour-cap-blue",
    item: "cap",
    targetColor: "blue",
    hint: "„Blue” to niebieski — pokoloruj czapkę z daszkiem na niebiesko!",
  },
];

const PENCIL_COLOURS: ColourName[] = [
  "red",
  "blue",
  "yellow",
  "green",
  "purple",
  "pink",
  "orange",
  "brown",
  "black",
];

function ColoredPencilSvg({ color, selected }: { color: ColourName; selected: boolean }) {
  const p = COLOUR_PALETTE[color];
  return (
    <svg
      width="34"
      height="86"
      viewBox="0 0 34 86"
      style={{
        transform: selected ? "translateY(-10px) scale(1.08)" : "translateY(0)",
        transition: "transform 0.16s cubic-bezier(0.22, 1, 0.36, 1)",
        filter: selected ? "drop-shadow(0 6px 8px rgba(45, 34, 25, 0.22))" : "none",
      }}
      aria-hidden="true"
    >
      {/* Tip lead */}
      <polygon points="17,3 13,13 21,13" fill={p.fill} stroke="#3A2A1E" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Wood cone */}
      <polygon points="13,13 21,13 26,26 8,26" fill="#F6DFB5" stroke="#3A2A1E" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Body */}
      <rect x="8" y="26" width="18" height="54" rx="4" fill={p.fill} stroke="#3A2A1E" strokeWidth="2" />
      {/* Highlight strip */}
      <rect x="12" y="28" width="4" height="48" rx="2" fill={p.accent} opacity="0.55" />
      {/* Decorative bands */}
      <line x1="8" y1="40" x2="26" y2="40" stroke="#3A2A1E" strokeWidth="1.8" />
      <line x1="8" y1="68" x2="26" y2="68" stroke="#3A2A1E" strokeWidth="1.8" />
    </svg>
  );
}

interface ColoursPencilGameProps {
  module: LearningModule;
  onBack: () => void;
  onComplete?: (stars: number) => void;
}

export function ColoursPencilGame({ module, onBack, onComplete }: ColoursPencilGameProps) {
  const { recordItemResult } = useProgress();
  const [tasks, setTasks] = useState<ColouringTask[]>(COLOURING_TASKS);
  const [idx, setIdx] = useState(0);
  const [selectedPencil, setSelectedPencil] = useState<ColourName>("red");
  const [paintedColor, setPaintedColor] = useState<ColourName | null>(null);
  const [status, setStatus] = useState<"playing" | "correct" | "wrong">("playing");
  const [hadWrong, setHadWrong] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<ColouringTask[]>([]);
  const [finished, setFinished] = useState(false);

  const current = tasks[idx];

  useEffect(() => {
    if (!finished && current) {
      const t = setTimeout(() => {
        void audioManager.speak(current.sentence, {
          audioKey: current.audioKey,
          lang: module.speechLang,
        });
      }, 220);
      return () => clearTimeout(t);
    }
  }, [idx, finished, current, module.speechLang]);

  const handleCheck = () => {
    if (!current || !paintedColor) return;
    if (paintedColor === current.targetColor) {
      audioManager.playSuccess();
      setStatus("correct");
      if (!hadWrong) {
        setCorrectCount((c) => c + 1);
        recordItemResult(module.id, current.id, true);
      }
    } else {
      audioManager.playGentleTryAgain();
      setStatus("wrong");
      setHadWrong(true);
      recordItemResult(module.id, current.id, false);
      setMistakes((m) => (m.some((x) => x.id === current.id) ? m : [...m, current]));
    }
  };

  const handleNext = () => {
    audioManager.stopSpeech();
    if (idx + 1 >= tasks.length) {
      const stars = computeStars(correctCount, tasks.length);
      onComplete?.(stars);
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
      setPaintedColor(null);
      setStatus("playing");
      setHadWrong(false);
    }
  };

  const restart = (list: ColouringTask[]) => {
    setTasks(list);
    setIdx(0);
    setPaintedColor(null);
    setStatus("playing");
    setHadWrong(false);
    setCorrectCount(0);
    setMistakes([]);
    setFinished(false);
  };

  if (finished) {
    return (
      <RoundSummary
        title="Kolory opanowane śpiewająco!"
        correctCount={correctCount}
        totalCount={tasks.length}
        stars={computeStars(correctCount, tasks.length)}
        mistakesCount={mistakes.length}
        onPracticeMistakes={mistakes.length > 0 ? () => restart(mistakes) : undefined}
        onReplay={() => restart(COLOURING_TASKS)}
        onBack={onBack}
      />
    );
  }

  if (!current) return null;

  return (
    <div className="game-stage">
      <GameHeader
        title="Kolory"
        onBack={onBack}
        currentStep={idx + 1}
        totalSteps={tasks.length}
        moduleForCheatSheet={module}
      />

      <div className="card" style={{ padding: "24px 26px", textAlign: "center" }}>
        {/* Step instruction row matching reference */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 18,
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="step-circle">{idx + 1}</span>
            <span style={{ fontWeight: 800, fontSize: "1.08rem" }}>
              Przeczytaj i pokoloruj. Wybierz kredkę, a potem stuknij w ubranie.
            </span>
          </div>

          <button
            type="button"
            className="btn btn-icon btn-soft"
            onClick={() =>
              void audioManager.speak(current.sentence, {
                audioKey: current.audioKey,
                lang: module.speechLang,
              })
            }
            aria-label="Posłuchaj polecenia"
          >
            <Volume2 size={22} />
          </button>
        </div>

        {/* Big Blue Spoken Sentence */}
        <button
          type="button"
          onClick={() =>
            void audioManager.speak(current.sentence, {
              audioKey: current.audioKey,
              lang: module.speechLang,
            })
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--blue)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 0 var(--blue-dark)",
            }}
          >
            <Volume2 size={24} />
          </span>
          <span
            className="font-display"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.15rem)", color: "#1D4ED8", fontWeight: 700 }}
          >
            {current.sentence}
          </span>
        </button>

        {/* Big Cozy Coloring Canvas */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
          <button
            type="button"
            id="btn-coloring-canvas"
            className="coloring-canvas"
            onClick={() => {
              if (status === "correct") return;
              audioManager.playClick();
              setPaintedColor(selectedPencil);
              setStatus("playing");
            }}
            aria-label={`Pokoloruj ${current.item} kolorem ${selectedPencil}`}
          >
            <StoryVisual
              visual={{ kind: current.item, color: paintedColor ?? undefined }}
              uncolored={!paintedColor}
              size={188}
            />
          </button>
        </div>

        {/* Vertical Colored Pencils Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {PENCIL_COLOURS.map((col) => {
            const isSelected = selectedPencil === col;
            return (
              <button
                key={col}
                type="button"
                className="pencil-btn"
                aria-label={`Kredka ${COLOUR_PALETTE[col].labelEn}`}
                onClick={() => {
                  setSelectedPencil(col);
                  void audioManager.speak(COLOUR_PALETTE[col].labelEn, {
                    audioKey: `w-${col}`,
                    lang: module.speechLang,
                  });
                }}
              >
                <ColoredPencilSvg color={col} selected={isSelected} />
                <span
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    color: isSelected ? "var(--ink-primary)" : "var(--ink-muted)",
                  }}
                >
                  {COLOUR_PALETTE[col].labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mascot + Check Button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <MascotAvatar size={82} cheering={status === "correct"} />

          {status !== "correct" ? (
            <button
              type="button"
              id="btn-colours-check"
              className="btn btn-green btn-pill"
              style={{ minWidth: 190, minHeight: 58, fontSize: "1.2rem" }}
              disabled={!paintedColor}
              onClick={handleCheck}
            >
              <span>Sprawdź</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-colours-next"
              className="btn btn-primary btn-pill"
              style={{ minWidth: 210, minHeight: 58, fontSize: "1.15rem" }}
              onClick={handleNext}
            >
              <span>{idx + 1 >= tasks.length ? "Zobacz wynik" : "Dalej!"}</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>

        {status === "correct" && (
          <div className="feedback-banner success" style={{ textAlign: "left" }}>
            <CheckCircle2 size={28} />
            <div style={{ fontWeight: 800, fontSize: "1.08rem" }}>
              Pięknie pokolorowane! {current.sentence}
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="feedback-banner hint" style={{ textAlign: "left" }}>
            <Lightbulb size={28} />
            <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>{current.hint}</div>
          </div>
        )}
      </div>
    </div>
  );
}
