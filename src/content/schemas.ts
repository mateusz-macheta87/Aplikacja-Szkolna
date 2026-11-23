import { z } from "zod";

export const colourNameSchema = z.enum([
  "red",
  "blue",
  "yellow",
  "green",
  "purple",
  "pink",
  "orange",
  "brown",
  "black",
  "white",
]);

export const clothingVisualSchema = z.enum([
  "coat",
  "trousers",
  "t-shirt",
  "jumper",
  "skirt",
  "shorts",
  "shoes",
  "cap",
  "shirt",
  "hat",
  "slippers",
  "dressing-gown",
  "pyjamas",
]);

export const visualKindSchema = z.enum([
  "coat",
  "trousers",
  "t-shirt",
  "jumper",
  "skirt",
  "shorts",
  "shoes",
  "cap",
  "shirt",
  "hat",
  "slippers",
  "dressing-gown",
  "pyjamas",
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "hot",
  "cold",
  "spring",
  "summer",
  "autumn",
  "winter",
  "ice-cream",
  "soup",
  "park",
  "house",
  "color-swatch",
  "clothes-rack",
  "moon-sleep",
  "sparkles",
]);

export const visualSpecSchema = z.object({
  kind: visualKindSchema,
  color: colourNameSchema.optional(),
  secondaryColor: colourNameSchema.optional(),
});

export const vocabItemSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  translation: z.string().min(1),
  category: z.string().min(1),
  categoryLabel: z.string().min(1),
  needsArticleA: z.boolean().optional(),
  exampleSentence: z.string().min(1),
  exampleTranslation: z.string().min(1),
  audioKey: z.string().optional(),
  exampleAudioKey: z.string().optional(),
  visual: visualSpecSchema,
  tip: z.string().optional(),
});

export const grammarRuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  badge: z.string().min(1),
  summary: z.string().min(1),
  formulaParts: z
    .array(
      z.object({
        text: z.string().min(1),
        tone: z.enum(["subject", "verb", "article", "accent", "noun"]),
      })
    )
    .min(1),
  examples: z
    .array(
      z.object({
        en: z.string().min(1),
        pl: z.string().min(1),
        highlight: z.string().optional(),
        audioKey: z.string().optional(),
        visual: visualSpecSchema.optional(),
      })
    )
    .min(1),
  watchOut: z.string().optional(),
});

export const quizQuestionSchema = z.object({
  id: z.string().min(1),
  promptPl: z.string().min(1),
  promptEn: z.string().optional(),
  audioText: z.string().optional(),
  audioKey: z.string().optional(),
  promptVisual: visualSpecSchema.optional(),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        sublabel: z.string().optional(),
        visual: visualSpecSchema.optional(),
      })
    )
    .min(2),
  correctOptionId: z.string().min(1),
  hint: z.string().min(1),
  topicTag: z.string().min(1),
});

export const sentenceTaskSchema = z.object({
  id: z.string().min(1),
  promptPl: z.string().min(1),
  targetSentence: z.string().min(1),
  words: z.array(z.string().min(1)).min(2),
  distractorWords: z.array(z.string().min(1)).optional(),
  audioKey: z.string().optional(),
  visual: visualSpecSchema.optional(),
  hint: z.string().min(1),
  topicTag: z.string().min(1),
});

export const sortBucketSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  tone: z.enum(["amber", "blue", "green", "coral"]),
});

export const sortRoundSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string().min(1),
  buckets: z.tuple([sortBucketSchema, sortBucketSchema]),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        sublabel: z.string().optional(),
        audioText: z.string().min(1),
        audioKey: z.string().optional(),
        bucketId: z.string().min(1),
        visual: visualSpecSchema.optional(),
        explanation: z.string().min(1),
      })
    )
    .min(2),
});

export const dressUpTaskSchema = z.object({
  id: z.string().min(1),
  sentence: z.string().min(1),
  translation: z.string().min(1),
  audioKey: z.string().optional(),
  targets: z
    .array(
      z.object({
        item: clothingVisualSchema,
        color: colourNameSchema,
        label: z.string().min(1),
      })
    )
    .min(1),
  hint: z.string().min(1),
});

export const spellingTaskSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  translation: z.string().min(1),
  audioKey: z.string().optional(),
  visual: visualSpecSchema,
  hint: z.string().min(1),
});

export const learningModuleSchema = z
  .object({
    id: z.string().min(1),
    subjectId: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    sourceNote: z.string().min(1),
    grade: z.string().min(1),
    speechLang: z.enum(["en-GB", "en-US", "pl-PL"]),
    accentColor: z.string().min(1),
    vocab: z.array(vocabItemSchema).min(1),
    grammarRules: z.array(grammarRuleSchema),
    audioQuiz: z.array(quizQuestionSchema),
    dressUpTasks: z.array(dressUpTaskSchema),
    sentenceTasks: z.array(sentenceTaskSchema),
    sortRounds: z.array(sortRoundSchema),
    spellingTasks: z.array(spellingTaskSchema),
    examQuestions: z.array(quizQuestionSchema),
    twisters: z
      .array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          sentence: z.string().min(1),
          highlightSubstring: z.string().min(1),
          translation: z.string().min(1),
          audioKey: z.string().optional(),
        })
      )
      .optional(),
  })
  .superRefine((mod, ctx) => {
    for (const listName of ["audioQuiz", "examQuestions"] as const) {
      mod[listName].forEach((q, idx) => {
        if (!q.options.some((o) => o.id === q.correctOptionId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${listName}[${idx}] (${q.id}) has invalid correctOptionId "${q.correctOptionId}"`,
          });
        }
      });
    }
    mod.sortRounds.forEach((round, rIdx) => {
      const bucketIds = new Set(round.buckets.map((b) => b.id));
      round.items.forEach((item, iIdx) => {
        if (!bucketIds.has(item.bucketId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `sortRounds[${rIdx}].items[${iIdx}] (${item.id}) has unknown bucketId "${item.bucketId}"`,
          });
        }
      });
    });
  });
