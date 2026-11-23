"use client";

import React from "react";
import { X, AlertCircle } from "lucide-react";
import type { LearningModule } from "@/types/content";
import { AudioButton } from "@/components/ui/AudioButton";

interface CheatSheetDrawerProps {
  open: boolean;
  module: LearningModule;
  onClose: () => void;
}

export function CheatSheetDrawer({ open, module, onClose }: CheatSheetDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Ściągawka gramatyczna"
      onClick={onClose}
    >
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: "1.55rem" }}>Ściągawka Bzyczka</h2>
          <button
            type="button"
            className="btn btn-icon btn-soft"
            onClick={onClose}
            aria-label="Zamknij ściągawkę"
          >
            <X size={22} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {module.grammarRules.map((rule) => (
            <div
              key={rule.id}
              style={{
                padding: 16,
                borderRadius: 18,
                background: "var(--surface-soft)",
                border: "2px solid var(--border-warm)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "1.12rem", marginBottom: 6 }}>
                {rule.title}
              </div>
              <p style={{ margin: "0 0 10px", color: "var(--ink-secondary)", fontWeight: 600 }}>
                {rule.summary}
              </p>

              <div className="formula-row" style={{ margin: "8px 0 12px" }}>
                {rule.formulaParts.map((part, i) => (
                  <span key={i} className={`formula-pill formula-${part.tone}`} style={{ fontSize: "0.96rem", padding: "6px 12px" }}>
                    {part.text}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rule.examples.slice(0, 3).map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      background: "#FFFFFF",
                      padding: "8px 12px",
                      borderRadius: 12,
                      border: "1.5px solid var(--border-warm)",
                    }}
                  >
                    <div>
                      <strong>{ex.en}</strong>
                      <span style={{ color: "var(--ink-secondary)", marginLeft: 8, fontSize: "0.92rem" }}>
                        — {ex.pl}
                      </span>
                    </div>
                    <AudioButton
                      text={ex.en}
                      audioKey={ex.audioKey}
                      lang={module.speechLang}
                      label="Słuchaj"
                      showSlowOption={false}
                    />
                  </div>
                ))}
              </div>

              {rule.watchOut && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#92400E",
                    fontWeight: 700,
                    fontSize: "0.94rem",
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{rule.watchOut}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
