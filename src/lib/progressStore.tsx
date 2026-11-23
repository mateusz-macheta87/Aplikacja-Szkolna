"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { GameModeId, LearningModule } from "@/types/content";
import { learningModuleSchema } from "@/content/schemas";
import { audioManager } from "@/lib/audioManager";

export type StationId =
  | "s1-clothes"
  | "s2-colours"
  | "s3-wearing"
  | "s4-dressup"
  | "s5-seasons"
  | "s6-weather"
  | "s7-listen"
  | "s8-write"
  | "s9-test";

export const ALL_STATION_IDS: StationId[] = [
  "s1-clothes",
  "s2-colours",
  "s3-wearing",
  "s4-dressup",
  "s5-seasons",
  "s6-weather",
  "s7-listen",
  "s8-write",
  "s9-test",
];

export interface ModuleProgress {
  modeStars: Partial<Record<GameModeId, number>>;
  stationStars: Partial<Record<StationId, number>>;
  masteredVocabIds: string[];
  trickyItemIds: string[];
  bestExamScore?: { correct: number; total: number; date: string };
  bestBlitzScore: number;
  treasureOpened: boolean;
  sessionsCompleted: number;
}

export interface PersistedState {
  version: 1;
  childName: string;
  muted: boolean;
  slowAudio: boolean;
  totalStars: number;
  spendableStars: number;
  streakDays: number;
  lastActiveDate: string | null;
  activeDates: string[];
  unlockedStickers: string[];
  ownedAccessories: string[];
  equippedAccessories: string[];
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
  spendableStars: 0,
  streakDays: 0,
  lastActiveDate: null,
  activeDates: [],
  unlockedStickers: [],
  ownedAccessories: [],
  equippedAccessories: [],
  modules: {},
  customModules: [],
};

export function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyModuleProgress(): ModuleProgress {
  return {
    modeStars: {},
    stationStars: {},
    masteredVocabIds: [],
    trickyItemIds: [],
    bestBlitzScore: 0,
    treasureOpened: false,
    sessionsCompleted: 0,
  };
}

function normalizeModuleProgress(mp?: Partial<ModuleProgress>): ModuleProgress {
  return {
    ...emptyModuleProgress(),
    ...mp,
    modeStars: mp?.modeStars ?? {},
    stationStars: mp?.stationStars ?? {},
    masteredVocabIds: Array.isArray(mp?.masteredVocabIds) ? mp.masteredVocabIds : [],
    trickyItemIds: Array.isArray(mp?.trickyItemIds) ? mp.trickyItemIds : [],
    bestBlitzScore: mp?.bestBlitzScore ?? 0,
    treasureOpened: Boolean(mp?.treasureOpened),
    sessionsCompleted: mp?.sessionsCompleted ?? 0,
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
  recordStationCompletion: (
    moduleId: string,
    stationId: StationId,
    stars: number,
    stickerId?: string,
    examScore?: { correct: number; total: number }
  ) => void;
  recordBonusActivity: (
    moduleId: string,
    bonusStars: number,
    stickerId?: string,
    blitzScore?: number
  ) => void;
  openTreasureChest: (moduleId: string) => void;
  buyAccessory: (accessoryId: string, cost: number) => boolean;
  toggleAccessory: (accessoryId: string) => void;
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
          const normalizedModules: Record<string, ModuleProgress> = {};
          if (parsed.modules) {
            for (const [k, v] of Object.entries(parsed.modules)) {
              normalizedModules[k] = normalizeModuleProgress(v);
            }
          }
          const merged: PersistedState = {
            ...DEFAULT_STATE,
            ...parsed,
            spendableStars: parsed.spendableStars ?? parsed.totalStars ?? 0,
            activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates : [],
            unlockedStickers: Array.isArray(parsed.unlockedStickers) ? parsed.unlockedStickers : [],
            ownedAccessories: Array.isArray(parsed.ownedAccessories) ? parsed.ownedAccessories : [],
            equippedAccessories: Array.isArray(parsed.equippedAccessories)
              ? parsed.equippedAccessories
              : [],
            modules: normalizedModules,
            customModules: Array.isArray(parsed.customModules) ? parsed.customModules : [],
          };
          setState(merged);
          audioManager.setMuted(Boolean(merged.muted));
          audioManager.setSlowMode(Boolean(merged.slowAudio));
        }
      } catch {
        // Ignore corrupt storage
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
      return normalizeModuleProgress(state.modules[moduleId]);
    },
    [state.modules]
  );

  const getReadinessPercent = useCallback(
    (moduleId: string, totalVocab: number): number => {
      const mp = normalizeModuleProgress(state.modules[moduleId]);
      const earnedStationStars = ALL_STATION_IDS.reduce(
        (sum, id) => sum + (mp.stationStars[id] ?? 0),
        0
      );
      const maxStars = ALL_STATION_IDS.length * 3;
      const stationScore = (earnedStationStars / maxStars) * 75;
      const vocabScore =
        totalVocab > 0 ? Math.min(1, mp.masteredVocabIds.length / totalVocab) * 25 : 0;
      return Math.min(100, Math.round(stationScore + vocabScore));
    },
    [state.modules]
  );

  const addTodayActivity = (prev: PersistedState): { activeDates: string[]; streakDays: number; lastActiveDate: string } => {
    const today = todayDateKey();
    const dates = prev.activeDates.includes(today)
      ? prev.activeDates
      : [...prev.activeDates, today];
    const streakDays =
      prev.lastActiveDate === today
        ? Math.max(1, prev.streakDays)
        : prev.lastActiveDate
        ? prev.streakDays + 1
        : 1;
    return { activeDates: dates, streakDays, lastActiveDate: today };
  };

  const recordGameCompletion = useCallback(
    (
      moduleId: string,
      mode: GameModeId,
      stars: number,
      examScore?: { correct: number; total: number }
    ) => {
      persist((prev) => {
        const current = normalizeModuleProgress(prev.modules[moduleId]);
        const prevBest = current.modeStars[mode] ?? 0;
        const nextBest = Math.max(prevBest, stars);
        const earnedNow = Math.max(1, stars);
        const activity = addTodayActivity(prev);

        const nextBestExam =
          examScore &&
          (!current.bestExamScore ||
            examScore.correct / Math.max(1, examScore.total) >=
              current.bestExamScore.correct / Math.max(1, current.bestExamScore.total))
            ? { ...examScore, date: activity.lastActiveDate }
            : current.bestExamScore;

        return {
          ...prev,
          ...activity,
          totalStars: prev.totalStars + Math.max(0, nextBest - prevBest),
          spendableStars: prev.spendableStars + earnedNow,
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

  const recordStationCompletion = useCallback(
    (
      moduleId: string,
      stationId: StationId,
      stars: number,
      stickerId?: string,
      examScore?: { correct: number; total: number }
    ) => {
      persist((prev) => {
        const current = normalizeModuleProgress(prev.modules[moduleId]);
        const prevBest = current.stationStars[stationId] ?? 0;
        const nextBest = Math.max(prevBest, stars);
        const activity = addTodayActivity(prev);

        const nextStickers =
          stickerId && stars >= 1 && !prev.unlockedStickers.includes(stickerId)
            ? [...prev.unlockedStickers, stickerId]
            : prev.unlockedStickers;

        const nextBestExam =
          examScore &&
          (!current.bestExamScore ||
            examScore.correct / Math.max(1, examScore.total) >=
              current.bestExamScore.correct / Math.max(1, current.bestExamScore.total))
            ? { ...examScore, date: activity.lastActiveDate }
            : current.bestExamScore;

        return {
          ...prev,
          ...activity,
          totalStars: prev.totalStars + Math.max(0, nextBest - prevBest),
          spendableStars: prev.spendableStars + Math.max(1, stars),
          unlockedStickers: nextStickers,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              stationStars: { ...current.stationStars, [stationId]: nextBest },
              bestExamScore: nextBestExam,
              sessionsCompleted: current.sessionsCompleted + 1,
            },
          },
        };
      });
    },
    [persist]
  );

  const recordBonusActivity = useCallback(
    (moduleId: string, bonusStars: number, stickerId?: string, blitzScore?: number) => {
      persist((prev) => {
        const current = normalizeModuleProgress(prev.modules[moduleId]);
        const activity = addTodayActivity(prev);
        const nextStickers =
          stickerId && !prev.unlockedStickers.includes(stickerId)
            ? [...prev.unlockedStickers, stickerId]
            : prev.unlockedStickers;

        return {
          ...prev,
          ...activity,
          totalStars: prev.totalStars + bonusStars,
          spendableStars: prev.spendableStars + bonusStars,
          unlockedStickers: nextStickers,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              bestBlitzScore:
                blitzScore !== undefined
                  ? Math.max(current.bestBlitzScore, blitzScore)
                  : current.bestBlitzScore,
              sessionsCompleted: current.sessionsCompleted + 1,
            },
          },
        };
      });
    },
    [persist]
  );

  const openTreasureChest = useCallback(
    (moduleId: string) => {
      persist((prev) => {
        const current = normalizeModuleProgress(prev.modules[moduleId]);
        if (current.treasureOpened) return prev;
        const nextStickers = prev.unlockedStickers.includes("stk-treasure")
          ? prev.unlockedStickers
          : [...prev.unlockedStickers, "stk-treasure"];
        return {
          ...prev,
          totalStars: prev.totalStars + 10,
          spendableStars: prev.spendableStars + 10,
          unlockedStickers: nextStickers,
          modules: {
            ...prev.modules,
            [moduleId]: {
              ...current,
              treasureOpened: true,
            },
          },
        };
      });
    },
    [persist]
  );

  const buyAccessory = useCallback(
    (accessoryId: string, cost: number): boolean => {
      if (state.ownedAccessories.includes(accessoryId)) return true;
      if (state.spendableStars < cost) return false;
      persist((prev) => {
        if (prev.ownedAccessories.includes(accessoryId) || prev.spendableStars < cost) {
          return prev;
        }
        return {
          ...prev,
          spendableStars: prev.spendableStars - cost,
          ownedAccessories: [...prev.ownedAccessories, accessoryId],
          equippedAccessories: [...prev.equippedAccessories, accessoryId],
        };
      });
      return true;
    },
    [state.ownedAccessories, state.spendableStars, persist]
  );

  const toggleAccessory = useCallback(
    (accessoryId: string) => {
      persist((prev) => {
        if (!prev.ownedAccessories.includes(accessoryId)) return prev;
        const equipped = prev.equippedAccessories.includes(accessoryId)
          ? prev.equippedAccessories.filter((x) => x !== accessoryId)
          : [...prev.equippedAccessories, accessoryId];
        return { ...prev, equippedAccessories: equipped };
      });
    },
    [persist]
  );

  const markVocabMastered = useCallback(
    (moduleId: string, vocabId: string, mastered: boolean) => {
      persist((prev) => {
        const current = normalizeModuleProgress(prev.modules[moduleId]);
        const masteredSet = new Set(current.masteredVocabIds);
        const trickySet = new Set(current.trickyItemIds);
        if (mastered) {
          masteredSet.add(vocabId);
          trickySet.delete(vocabId);
        } else {
          masteredSet.delete(vocabId);
          trickySet.add(vocabId);
        }
        const nextStickers =
          masteredSet.size >= 8 && !prev.unlockedStickers.includes("stk-dictionary")
            ? [...prev.unlockedStickers, "stk-dictionary"]
            : prev.unlockedStickers;

        return {
          ...prev,
          unlockedStickers: nextStickers,
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
        const current = normalizeModuleProgress(prev.modules[moduleId]);
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
        recordStationCompletion,
        recordBonusActivity,
        openTreasureChest,
        buyAccessory,
        toggleAccessory,
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
