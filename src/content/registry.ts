import type { LearningModule, SubjectDefinition } from "@/types/content";
import { unit1MrBeetleClothes } from "@/content/subjects/english/unit1-mr-beetle-clothes";

export const SUBJECTS: SubjectDefinition[] = [
  {
    id: "english",
    name: "Język angielski",
    description: "Słówka, gramatyka, słuchanki i gry językowe",
    icon: "languages",
    theme: "amber",
    defaultSpeechLang: "en-GB",
  },
  {
    id: "math",
    name: "Matematyka",
    description: "Tabliczka mnożenia, zadania tekstowe i zegar",
    icon: "calculator",
    theme: "blue",
    defaultSpeechLang: "pl-PL",
    comingSoon: true,
  },
  {
    id: "polish",
    name: "Język polski",
    description: "Ortografia, części mowy i lektury",
    icon: "book-open",
    theme: "coral",
    defaultSpeechLang: "pl-PL",
    comingSoon: true,
  },
  {
    id: "science",
    name: "Przyroda",
    description: "Zwierzęta, rośliny, pogoda i pory roku",
    icon: "leaf",
    theme: "green",
    defaultSpeechLang: "pl-PL",
    comingSoon: true,
  },
];

export const BUILTIN_MODULES: LearningModule[] = [unit1MrBeetleClothes];

export function getSubjectById(id: string): SubjectDefinition | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getModulesForSubject(
  subjectId: string,
  customModules: LearningModule[] = []
): LearningModule[] {
  return [...BUILTIN_MODULES, ...customModules].filter(
    (m) => m.subjectId === subjectId
  );
}

export function getModuleById(
  moduleId: string,
  customModules: LearningModule[] = []
): LearningModule | undefined {
  return [...BUILTIN_MODULES, ...customModules].find((m) => m.id === moduleId);
}
