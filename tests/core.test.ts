import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BUILTIN_MODULES } from "@/content/registry";
import { learningModuleSchema } from "@/content/schemas";
import {
  computeStars,
  isSentenceMatch,
  isSpellingMatch,
} from "@/lib/answerMatcher";

describe("Content modules & audio assets", () => {
  it("validates every built-in learning module against the Zod schema", () => {
    expect(BUILTIN_MODULES.length).toBeGreaterThan(0);
    for (const mod of BUILTIN_MODULES) {
      const result = learningModuleSchema.safeParse(mod);
      expect(result.success, `Module ${mod.id} failed validation`).toBe(true);
    }
  });

  it("ensures every referenced audioKey has a generated MP3 clip on disk", () => {
    const audioDir = path.resolve(process.cwd(), "public/audio/en-GB");
    const missing: string[] = [];

    for (const mod of BUILTIN_MODULES) {
      if (mod.speechLang !== "en-GB") continue;
      const keys = new Set<string>();
      mod.vocab.forEach((v) => {
        if (v.audioKey) keys.add(v.audioKey);
        if (v.exampleAudioKey) keys.add(v.exampleAudioKey);
      });
      mod.grammarRules.forEach((r) =>
        r.examples.forEach((ex) => {
          if (ex.audioKey) keys.add(ex.audioKey);
        })
      );
      mod.audioQuiz.forEach((q) => q.audioKey && keys.add(q.audioKey));
      mod.dressUpTasks.forEach((t) => t.audioKey && keys.add(t.audioKey));
      mod.sentenceTasks.forEach((t) => t.audioKey && keys.add(t.audioKey));
      mod.sortRounds.forEach((r) =>
        r.items.forEach((i) => i.audioKey && keys.add(i.audioKey))
      );
      mod.spellingTasks.forEach((t) => t.audioKey && keys.add(t.audioKey));
      mod.examQuestions.forEach((q) => q.audioKey && keys.add(q.audioKey));
      mod.twisters?.forEach((tw) => tw.audioKey && keys.add(tw.audioKey));

      for (const key of keys) {
        const filePath = path.join(audioDir, `${key}.mp3`);
        if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1000) {
          missing.push(key);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});

describe("Answer matcher & scoring", () => {
  it("matches spelling forgiving hyphens and case", () => {
    expect(isSpellingMatch("T-shirt", "T-shirt")).toBe(true);
    expect(isSpellingMatch("tshirt", "T-shirt")).toBe(true);
    expect(isSpellingMatch("  COAT ", "coat")).toBe(true);
    expect(isSpellingMatch("shorts", "shirt")).toBe(false);
  });

  it("matches sentences accepting contractions and punctuation variants", () => {
    expect(
      isSentenceMatch(["I'm", "wearing", "a", "red", "coat."], "I'm wearing a red coat.")
    ).toBe(true);
    expect(
      isSentenceMatch(["I", "am", "wearing", "purple", "shorts"], "I'm wearing purple shorts.")
    ).toBe(true);
    expect(
      isSentenceMatch(["What's", "the", "weather", "like", "today?"], "What's the weather like today?")
    ).toBe(true);
    expect(
      isSentenceMatch(["I'm", "wearing", "a", "purple", "shorts."], "I'm wearing purple shorts.")
    ).toBe(false);
  });

  it("computes 0-3 stars accurately", () => {
    expect(computeStars(10, 10)).toBe(3);
    expect(computeStars(9, 10)).toBe(3);
    expect(computeStars(7, 10)).toBe(2);
    expect(computeStars(4, 10)).toBe(1);
    expect(computeStars(0, 10)).toBe(0);
  });
});
