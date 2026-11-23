"use client";

import React from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import type { LearningModule } from "@/types/content";
import { StoryVisual } from "@/components/visuals/StoryVisual";
import { AudioButton } from "@/components/ui/AudioButton";
import { GameHeader } from "@/components/ui/GameHeader";

interface GrammarGuideViewProps {
  module: LearningModule;
  onBack: () => void;
}

export function GrammarGuideView({ module, onBack }: GrammarGuideViewProps) {
  return (
    <div className="game-stage">
      <GameHeader title="Ściągawka Gramatyczna" onBack={onBack} />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {module.grammarRules.map((rule) => (
          <section key={rule.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              <h2 style={{ fontSize: "1.45rem" }}>{rule.title}</h2>
              <span className="stat-pill stat-pill-amber" style={{ fontSize: "0.88rem" }}>
                {rule.badge}
              </span>
            </div>

            <p style={{ fontSize: "1.08rem", color: "var(--ink-secondary)", lineHeight: 1.55, margin: "0 0 12px" }}>
              {rule.summary}
            </p>

            {/* Color-coded Formula */}
            <div className="formula-row">
              {rule.formulaParts.map((part, idx) => (
                <span key={idx} className={`formula-pill formula-${part.tone}`}>
                  {part.text}
                </span>
              ))}
            </div>

            {/* Audio Examples */}
            <div className="grid-2" style={{ marginTop: 16 }}>
              {rule.examples.map((ex, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: 14,
                    borderRadius: 18,
                    background: "var(--surface-soft)",
                    border: "2px solid var(--border-warm)",
                  }}
                >
                  {ex.visual && <StoryVisual visual={ex.visual} size={66} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: "1.12rem", marginBottom: 2 }}>
                      {ex.en}
                    </div>
                    <div style={{ fontSize: "0.95rem", color: "var(--ink-secondary)", marginBottom: 10 }}>
                      {ex.pl}
                    </div>
                    <AudioButton
                      text={ex.en}
                      audioKey={ex.audioKey}
                      lang={module.speechLang}
                      label="Posłuchaj"
                      showSlowOption={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {rule.watchOut && (
              <div className="feedback-banner hint" style={{ marginTop: 16 }}>
                <AlertCircle size={24} style={{ flexShrink: 0 }} />
                <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>{rule.watchOut}</div>
              </div>
            )}
          </section>
        ))}

        {/* Bug Twister Bonus Card (Page 12) */}
        {module.twisters && module.twisters.length > 0 && (
          <section
            className="card"
            style={{
              background: "linear-gradient(135deg, #EFF6FF 0%, #FFFBF2 100%)",
              borderColor: "#93C5FD",
            }}
          >
            {module.twisters.map((tw) => {
              const parts = tw.sentence.split(new RegExp(`(${tw.highlightSubstring})`, "gi"));
              return (
                <div key={tw.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Sparkles size={24} color="#2563EB" />
                    <h2 style={{ fontSize: "1.4rem" }}>{tw.title}</h2>
                  </div>

                  <p style={{ fontSize: "1.55rem", fontWeight: 800, margin: "10px 0 6px" }}>
                    {parts.map((part, i) =>
                      part.toLowerCase() === tw.highlightSubstring.toLowerCase() ? (
                        <span
                          key={i}
                          style={{
                            color: "var(--coral-dark)",
                            background: "var(--coral-soft)",
                            padding: "1px 4px",
                            borderRadius: 6,
                          }}
                        >
                          {part}
                        </span>
                      ) : (
                        <React.Fragment key={i}>{part}</React.Fragment>
                      )
                    )}
                  </p>
                  <p style={{ color: "var(--ink-secondary)", margin: "0 0 16px", fontSize: "1.04rem" }}>
                    {tw.translation} — spróbuj powtórzyć za lektorem 3 razy coraz szybciej!
                  </p>
                  <AudioButton
                    text={tw.sentence}
                    audioKey={tw.audioKey}
                    lang={module.speechLang}
                    label="Posłuchaj łamańca"
                    size="lg"
                  />
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
