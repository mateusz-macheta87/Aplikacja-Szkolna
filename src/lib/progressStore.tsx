"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { GameModeId, LearningModule } from "@/types/content";
import { learningModuleSchema } from "@/content/schemas";
import { audioManager } from "@/lib/audioManager";

export interface ModuleProgress {
  modeStars: Partial<Record<GameModeId, number>>;
  masteredVocabIds: string[];
  trickyItemIds: string[];
  bestExamScore?: { correct: number; total: number; date: string };
  sessionsCompleted: number;
}

export interface PersistedState {
  version: 1;
  childName: string;
  muted: boolean;
  slowAudio: boolean;
  totalStars: number;
  streakDays: number;
  lastActiveDate: string | null;
  modules: Record<string, ModuleProgress>;
  customModules: LearningModule[];
}

const STORAGE_KEY = "bzyczek-aplikacja-szkolna-v1";

const DEFAULT_STATE: PersistedState = {
  version: 1,
  childName: "Mistrzyni",
  muted: false,
  slowAudio: false,
  totalStars: 0,
  streakDays: 1,
  lastActiveDate: null,
  modules: {},
  customModules: [],
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyModuleProgress(): ModuleProgress {
  return {
    modeStars: {},
    masteredVocabIds: [],
    trickyItemIds: [],
    sessionsCompleted: 0,
  };
}

interface ProgressContextValue {
  state: PersistedState;
  hydrated: boolean;
  getModuleProgress: (moduleId: string) => ModuleProgress;
  getReadinessPercent: (moduleId: string, totalVocab: number) => number;
  recordGameCompletion: (
    moduleId: string,
    mode: GameModeId,
    stars: number,
    examScore?: { correct: number; total: number }
  ) => void;
  markVocabMastered: (moduleId: string, vocabId: string, mastered: boolean) => void;
  recordItemResult: (moduleId: string, itemId: string, correct: boolean) => void;
  toggleMuted: () => void;
  toggleSlowAudio: () => void;
  setChildName: (name: string) => void;
  importCustomModule: (rawJson: string) => { ok: true; title: string } | { ok: false; error: string };
  removeCustomModule: (moduleId: string) => void;
  exportBackupJson: () => string;
  importBackupJson: (rawJson: string) => { ok: true } | { ok: false; error: string };
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          const merged: PersistedState = {
            ...DEFAULT_STATE,
            ...parsed,
            modules: parsed.modules ?? {},
            customModules: Array.isArray(parsed.customModules) ? parsed.customModules : [],
          };
          setState(merged);
          audioManager.setMuted(Boolean(merged.muted));
          audioManager.setSlowMode(Boolean(merged.slowAudio));
        }
      } catch {
        // Ignore corrupt storage and start cleanly
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((updater: (prev: PersistedState) => PersistedState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage quota fallback
      }
      return next;
    });
  }, []);

  const getModuleProgress = useCallback(
    (moduleId: string): ModuleProgress => {
      return state.modules[moduleId] ?? emptyModuleProgress();
    },
    [state.modules]
  );

  const getReadinessPercent = useCallback(
    (moduleId: string, totalVocab: number): number => {
      const mp = state.modules[moduleId];
      if (!mp) return 0;
      const modeKeys: GameModeId[] = [
        "flashcards",
        "audio-quiz",
        "dress-up",
        "sentences",
        "sorter",
        "memory",
        "spelling",
        "exam",
      ];
      const earnedStars = modeKeys.reduce((sum, k) => sum + (mp.modeStars[k] ?? 0), 0);
      const maxStars = modeKeys.length * 3;
      const starsScore = (earnedStars / maxStars) * 70;
      const vocabScore =
        totalVocab > 0 ? Math.min(1, mp.masteredVocabIds.length / totalVocab) * 30 : 0;
      return Math.min(100, Math.round(starsScore + vocabScore));
    },
    [state.modules]
  );

  const recordGameCompletion = useCallback(
    (
      moduleId: string,
      mode: GameModeId,
      stars: number,
      examScore?: { correct: number; total: number }
    ) => {
      const today = todayKey();
      persist((prev) => {
        const current = prev.modules[moduleId] ?? emptyModuleProgress();
        const prevBest = current.modeStars[mode] ?? 0;
        const nextBest = Math.max(prevBest, stars);
        const starDelta = Math.max(0, nextBest - prevBest);

        let streakDays = prev.streakDays;
        if (prev.lastActiveDate !== today) {
          streakDays = prev.lastActiveDate ? prev.streakDays + 1 : 1;
        }

        const nextBestExam =
          examScore &&
          (!current.bestExamScore ||
            examScore.correct / Math.max(1, examScore.total) >=
              current.bestExamScore.correct / Math.max(1, current.bestExamScore.total))
            ? { ...examScore, date: today }
            : current.bestExamScore;

        return {
          ...prev,
          totalStars: prev.totalStars + starDelta,
          streakDays,
          lastActiveDate: today,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              modeStars: { ...current.modeStars, [mode]: nextBest },
              bestExamScore: nextBestExam,
              sessionsCompleted: current.sessionsCompleted + 1,
            },
          },
        };
      });
    },
    [persist]
  );

  const markVocabMastered = useCallback(
    (moduleId: string, vocabId: string, mastered: boolean) => {
      persist((prev) => {
        const current = prev.modules[moduleId] ?? emptyModuleProgress();
        const masteredSet = new Set(current.masteredVocabIds);
        const trickySet = new Set(current.trickyItemIds);
        if (mastered) {
          masteredSet.add(vocabId);
          trickySet.delete(vocabId);
        } else {
          masteredSet.delete(vocabId);
          trickySet.add(vocabId);
        }
        return {
          ...prev,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              masteredVocabIds: Array.from(masteredSet),
              trickyItemIds: Array.from(trickySet),
            },
          },
        };
      });
    },
    [persist]
  );

  const recordItemResult = useCallback(
    (moduleId: string, itemId: string, correct: boolean) => {
      persist((prev) => {
        const current = prev.modules[moduleId] ?? emptyModuleProgress();
        const trickySet = new Set(current.trickyItemIds);
        if (correct) {
          trickySet.delete(itemId);
        } else {
          trickySet.add(itemId);
        }
        return {
          ...prev,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              trickyItemIds: Array.from(trickySet),
            },
          },
        };
      });
    },
    [persist]
  );

  const toggleMuted = useCallback(() => {
    persist((prev) => {
      const nextMuted = !prev.muted;
      audioManager.setMuted(nextMuted);
      return { ...prev, muted: nextMuted };
    });
  }, [persist]);

  const toggleSlowAudio = useCallback(() => {
    persist((prev) => {
      const nextSlow = !prev.slowAudio;
      audioManager.setSlowMode(nextSlow);
      return { ...prev, slowAudio: nextSlow };
    });
  }, [persist]);

  const setChildName = useCallback(
    (name: string) => {
      persist((prev) => ({ ...prev, childName: name.trim() || "Mistrzyni" }));
    },
    [persist]
  );

  const importCustomModule = useCallback(
    (rawJson: string): { ok: true; title: string } | { ok: false; error: string } => {
      try {
        const parsed = JSON.parse(rawJson);
        const validated = learningModuleSchema.safeParse(parsed);
        if (!validated.success) {
          return {
            ok: false,
            error: "Nieprawidłowa struktura modułu JSON: " + validated.error.issues[0]?.message,
          };
        }
        const mod = validated.data;
        persist((prev) => ({
          ...prev,
          customModules: [...prev.customModules.filter((m) => m.id !== mod.id), mod],
        }));
        return { ok: true, title: mod.title };
      } catch {
        return { ok: false, error: "Nie udało się odczytać pliku JSON." };
      }
    },
    [persist]
  );

  const removeCustomModule = useCallback(
    (moduleId: string) => {
      persist((prev) => ({
        ...prev,
        customModules: prev.customModules.filter((m) => m.id !== moduleId),
      }));
    },
    [persist]
  );

  const exportBackupJson = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importBackupJson = useCallback(
    (rawJson: string): { ok: true } | { ok: false; error: string } => {
      try {
        const parsed = JSON.parse(rawJson) as Partial<PersistedState>;
        if (parsed.version !== 1 || typeof parsed.modules !== "object") {
          return { ok: false, error: "Ten plik nie jest kopią zapasową Bzyczka." };
        }
        persist(() => ({
          ...DEFAULT_STATE,
          ...parsed,
          modules: parsed.modules ?? {},
          customModules: Array.isArray(parsed.customModules) ? parsed.customModules : [],
        }));
        return { ok: true };
      } catch {
        return { ok: false, error: "Błędny format pliku kopii zapasowej." };
      }
    },
    [persist]
  );

  const resetProgress = useCallback(() => {
    persist((prev) => ({
      ...DEFAULT_STATE,
      childName: prev.childName,
      customModules: prev.customModules,
    }));
  }, [persist]);

  return (
    <ProgressContext.Provider
      value={{
        state,
        hydrated,
        getModuleProgress,
        getReadinessPercent,
        recordGameCompletion,
        markVocabMastered,
        recordItemResult,
        toggleMuted,
        toggleSlowAudio,
        setChildName,
        importCustomModule,
        removeCustomModule,
        exportBackupJson,
        importBackupJson,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
