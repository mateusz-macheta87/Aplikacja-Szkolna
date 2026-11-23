"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Download,
  Lock,
  PlusCircle,
  RotateCcw,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Tablet,
} from "lucide-react";
import { BUILTIN_MODULES } from "@/content/registry";
import { useProgress } from "@/lib/progressStore";
import { unit1MrBeetleClothes } from "@/content/subjects/english/unit1-mr-beetle-clothes";

interface ParentZoneViewProps {
  onBack: () => void;
}

export function ParentZoneView({ onBack }: ParentZoneViewProps) {
  const {
    state,
    getModuleProgress,
    getReadinessPercent,
    setChildName,
    importCustomModule,
    removeCustomModule,
    exportBackupJson,
    importBackupJson,
    resetProgress,
  } = useProgress();

  const [challenge] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 7 + Math.floor(Math.random() * 3);
    return { a, b, answer: a * b };
  });

  const [unlocked, setUnlocked] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [gateError, setGateError] = useState(false);

  const [nameDraft, setNameDraft] = useState(state.childName);
  const [moduleJsonText, setModuleJsonText] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const allModules = [...BUILTIN_MODULES, ...state.customModules];

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(gateInput.trim()) === challenge.answer) {
      setUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  };

  const handleDownloadBackup = () => {
    const data = exportBackupJson();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bzyczek-kopia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg({ ok: true, text: "Pobrano kopię zapasową postępów (JSON)." });
  };

  const handleDownloadTemplate = () => {
    const template = {
      ...unit1MrBeetleClothes,
      id: "english-unit-2-przyklad",
      title: "Unit 2: Nowy sprawdzian (szablon)",
      subtitle: "Wypełnij własnymi słówkami i zaimportuj w Strefie Rodzica",
      vocab: unit1MrBeetleClothes.vocab.slice(0, 4),
      grammarRules: unit1MrBeetleClothes.grammarRules.slice(0, 1),
      audioQuiz: unit1MrBeetleClothes.audioQuiz.slice(0, 2),
      dressUpTasks: unit1MrBeetleClothes.dressUpTasks.slice(0, 1),
      sentenceTasks: unit1MrBeetleClothes.sentenceTasks.slice(0, 2),
      sortRounds: unit1MrBeetleClothes.sortRounds.slice(0, 1),
      spellingTasks: unit1MrBeetleClothes.spellingTasks.slice(0, 2),
      examQuestions: unit1MrBeetleClothes.examQuestions.slice(0, 2),
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "szablon-modulu-bzyczek.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importBackupJson(text);
    setStatusMsg(
      res.ok
        ? { ok: true, text: "Przywrócono kopię zapasową postępów!" }
        : { ok: false, text: res.error }
    );
  };

  const handleModuleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = importCustomModule(text);
    setStatusMsg(
      res.ok
        ? { ok: true, text: `Dodano nowy moduł: „${res.title}”!` }
        : { ok: false, text: res.error }
    );
  };

  if (!unlocked) {
    return (
      <div className="game-stage" style={{ maxWidth: 520 }}>
        <div className="topbar">
          <button type="button" className="btn btn-soft" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Wróć</span>
          </button>
        </div>

        <div className="card" style={{ textAlign: "center", padding: "32px 26px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: "var(--amber-soft)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Lock size={30} color="#D97706" />
          </div>
          <h1 style={{ fontSize: "1.7rem", marginBottom: 8 }}>Strefa Rodzica</h1>
          <p style={{ color: "var(--ink-secondary)", margin: "0 0 20px", fontWeight: 700 }}>
            Rozwiąż szybkie działanie, aby wejść do raportu postępów i ustawień:
          </p>

          <form onSubmit={handleUnlock}>
            <div className="font-display" style={{ fontSize: "2rem", marginBottom: 16 }}>
              {challenge.a} × {challenge.b} = ?
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={gateInput}
              onChange={(e) => setGateInput(e.target.value)}
              placeholder="Wpisz wynik"
              style={{
                width: 180,
                padding: "14px 16px",
                fontSize: "1.4rem",
                fontWeight: 800,
                textAlign: "center",
                borderRadius: 16,
                border: "2px solid var(--border-warm)",
                marginBottom: 16,
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            {gateError && (
              <div style={{ color: "var(--coral-dark)", fontWeight: 800, marginBottom: 12 }}>
                Spróbuj jeszcze raz!
              </div>
            )}
            <button type="submit" className="btn btn-primary" id="btn-parent-unlock">
              Odblokuj
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="game-stage">
      <div className="topbar">
        <div className="topbar-left">
          <button type="button" className="btn btn-soft" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Wróć</span>
          </button>
          <h1 style={{ fontSize: "1.7rem" }}>Strefa Rodzica</h1>
        </div>
      </div>

      {statusMsg && (
        <div className={`feedback-banner ${statusMsg.ok ? "success" : "hint"}`} style={{ marginBottom: 18 }}>
          {statusMsg.ok ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span style={{ fontWeight: 800 }}>{statusMsg.text}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Child Profile */}
        <section className="card">
          <h2 style={{ fontSize: "1.35rem", marginBottom: 12 }}>Imię dziecka</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="np. Zosia"
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "2px solid var(--border-warm)",
                fontSize: "1.1rem",
                fontWeight: 700,
                minWidth: 220,
              }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setChildName(nameDraft);
                setStatusMsg({ ok: true, text: `Zapisano imię: ${nameDraft || "Mistrzyni"}!` });
              }}
            >
              Zapisz imię
            </button>
          </div>
        </section>

        {/* Readiness Report */}
        <section className="card">
          <h2 style={{ fontSize: "1.35rem", marginBottom: 14 }}>Raport gotowości do sprawdzianu</h2>
          {allModules.map((mod) => {
            const mp = getModuleProgress(mod.id);
            const readiness = getReadinessPercent(mod.id, mod.vocab.length);
            const trickyLabels = mp.trickyItemIds
              .map((id) => mod.vocab.find((v) => v.id === id)?.term)
              .filter(Boolean);

            return (
              <div
                key={mod.id}
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: "var(--surface-soft)",
                  border: "2px solid var(--border-warm)",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 8,
                  }}
                >
                  <strong style={{ fontSize: "1.12rem" }}>{mod.title}</strong>
                  <span className="stat-pill stat-pill-green">Gotowość: {readiness}%</span>
                </div>

                <div className="progress-track" style={{ marginBottom: 12 }}>
                  <div className="progress-fill" style={{ width: `${readiness}%` }} />
                </div>

                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", fontWeight: 700, color: "var(--ink-secondary)" }}>
                  <span>
                    Opanowane słówka: {mp.masteredVocabIds.length} / {mod.vocab.length}
                  </span>
                  <span>Ukończone sesje: {mp.sessionsCompleted}</span>
                  {mp.bestExamScore && (
                    <span>
                      Najlepszy próbny sprawdzian: {mp.bestExamScore.correct}/{mp.bestExamScore.total}
                    </span>
                  )}
                </div>

                {trickyLabels.length > 0 && (
                  <div style={{ marginTop: 10, fontWeight: 700, color: "#92400E" }}>
                    Warto jeszcze powtórzyć: {trickyLabels.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Add New Lessons / Subjects via JSON */}
        <section className="card">
          <h2 style={{ fontSize: "1.35rem", marginBottom: 8 }}>
            Dodaj kolejny sprawdzian lub przedmiot (JSON)
          </h2>
          <p style={{ color: "var(--ink-secondary)", margin: "0 0 14px", fontWeight: 600 }}>
            Aplikacja jest w pełni modułowa. Możesz pobrać szablon JSON, wgrać gotową paczkę z kolejnym
            rozdziałem z angielskiego albo innego przedmiotu, a nowe gry pojawią się automatycznie.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
            <button type="button" className="btn btn-soft" onClick={handleDownloadTemplate}>
              <Download size={18} />
              <span>Pobierz szablon modułu JSON</span>
            </button>

            <label className="btn btn-blue" style={{ cursor: "pointer" }}>
              <Upload size={18} />
              <span>Wczytaj plik modułu (.json)</span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleModuleFile}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <textarea
            rows={4}
            value={moduleJsonText}
            onChange={(e) => setModuleJsonText(e.target.value)}
            placeholder="...albo wklej tutaj kod JSON nowego modułu"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 14,
              border: "2px solid var(--border-warm)",
              fontFamily: "monospace",
              fontSize: "0.88rem",
              marginBottom: 10,
            }}
          />

          <button
            type="button"
            className="btn btn-green"
            disabled={!moduleJsonText.trim()}
            onClick={() => {
              const res = importCustomModule(moduleJsonText);
              if (res.ok) {
                setModuleJsonText("");
                setStatusMsg({ ok: true, text: `Dodano moduł: „${res.title}”!` });
              } else {
                setStatusMsg({ ok: false, text: res.error });
              }
            }}
          >
            <PlusCircle size={18} />
            <span>Dodaj wklejony moduł</span>
          </button>

          {state.customModules.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Dodane własne moduły:</strong>
              {state.customModules.map((cm) => (
                <div
                  key={cm.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                    padding: "10px 14px",
                    borderRadius: 14,
                    background: "var(--surface-soft)",
                  }}
                >
                  <span>{cm.title}</span>
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={() => removeCustomModule(cm.id)}
                  >
                    <Trash2 size={16} />
                    <span>Usuń</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* iPad PWA Tip & Backup */}
        <section className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Tablet size={24} color="#2563EB" />
            <h2 style={{ fontSize: "1.35rem" }}>Instalacja na ekranie głównym iPada i kopia danych</h2>
          </div>
          <p style={{ color: "var(--ink-secondary)", fontWeight: 600, margin: "0 0 16px" }}>
            Otwórz link w przeglądarce <strong>Safari na iPadzie</strong>, stuknij ikonę{" "}
            <strong>Udostępnij</strong> (kwadrat ze strzałką w górę) i wybierz{" "}
            <strong>„Dodaj do ekranu początkowego”</strong>. Aplikacja pojawi się jak natywna ikona i
            będzie działać również offline!
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-soft" onClick={handleDownloadBackup}>
              <Download size={18} />
              <span>Zapisz kopię postępów</span>
            </button>

            <label className="btn btn-soft" style={{ cursor: "pointer" }}>
              <Upload size={18} />
              <span>Przywróć kopię</span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleBackupFile}
                style={{ display: "none" }}
              />
            </label>

            <button
              type="button"
              className="btn btn-coral"
              onClick={() => {
                if (window.confirm("Czy na pewno wyzerować zdobyte gwiazdki i postępy?")) {
                  resetProgress();
                  setStatusMsg({ ok: true, text: "Wyzerowano postępy." });
                }
              }}
            >
              <RotateCcw size={18} />
              <span>Wyzeruj postępy</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
