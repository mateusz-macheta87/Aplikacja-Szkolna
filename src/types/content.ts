export type SpeechLang = "en-GB" | "en-US" | "pl-PL";

export type ClothingVisualType =
  | "coat"
  | "trousers"
  | "t-shirt"
  | "jumper"
  | "skirt"
  | "shorts"
  | "shoes"
  | "cap"
  | "shirt"
  | "hat"
  | "slippers"
  | "dressing-gown"
  | "pyjamas";

export type WeatherVisualType =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "hot"
  | "cold";

export type SeasonVisualType = "spring" | "summer" | "autumn" | "winter";

export type ExtraVisualType =
  | "ice-cream"
  | "soup"
  | "park"
  | "house"
  | "color-swatch"
  | "clothes-rack"
  | "moon-sleep"
  | "sparkles";

export type VisualKind =
  | ClothingVisualType
  | WeatherVisualType
  | SeasonVisualType
  | ExtraVisualType;

export type ColourName =
  | "red"
  | "blue"
  | "yellow"
  | "green"
  | "purple"
  | "pink"
  | "orange"
  | "brown"
  | "black"
  | "white";

export interface VisualSpec {
  kind: VisualKind;
  color?: ColourName;
  secondaryColor?: ColourName;
}

export interface VocabItem {
  id: string;
  term: string;
  translation: string;
  category: string;
  categoryLabel: string;
  needsArticleA?: boolean; // true for "a coat", false for plural "trousers", undefined for non-nouns
  exampleSentence: string;
  exampleTranslation: string;
  audioKey?: string;
  exampleAudioKey?: string;
  visual: VisualSpec;
  tip?: string;
}

export interface GrammarExample {
  en: string;
  pl: string;
  highlight?: string;
  audioKey?: string;
  visual?: VisualSpec;
}

export interface GrammarRule {
  id: string;
  title: string;
  badge: string;
  summary: string;
  formulaParts: Array<{ text: string; tone: "subject" | "verb" | "article" | "accent" | "noun" }>;
  examples: GrammarExample[];
  watchOut?: string;
}

export interface QuizQuestion {
  id: string;
  promptPl: string;
  promptEn?: string;
  audioText?: string;
  audioKey?: string;
  promptVisual?: VisualSpec;
  options: Array<{
    id: string;
    label: string;
    sublabel?: string;
    visual?: VisualSpec;
  }>;
  correctOptionId: string;
  hint: string;
  topicTag: string;
}

export interface SentenceTask {
  id: string;
  promptPl: string;
  targetSentence: string;
  words: string[];
  distractorWords?: string[];
  audioKey?: string;
  visual?: VisualSpec;
  hint: string;
  topicTag: string;
}

export interface SortBucket {
  id: string;
  label: string;
  description: string;
  tone: "amber" | "blue" | "green" | "coral";
}

export interface SortItem {
  id: string;
  label: string;
  sublabel?: string;
  audioText: string;
  audioKey?: string;
  bucketId: string;
  visual?: VisualSpec;
  explanation: string;
}

export interface SortRound {
  id: string;
  title: string;
  instruction: string;
  buckets: [SortBucket, SortBucket];
  items: SortItem[];
}

export interface DressUpTask {
  id: string;
  sentence: string;
  translation: string;
  audioKey?: string;
  targets: Array<{
    item: ClothingVisualType;
    color: ColourName;
    label: string;
  }>;
  hint: string;
}

export interface SpellingTask {
  id: string;
  word: string;
  translation: string;
  audioKey?: string;
  visual: VisualSpec;
  hint: string;
}

export interface TwisterItem {
  id: string;
  title: string;
  sentence: string;
  highlightSubstring: string;
  translation: string;
  audioKey?: string;
}

export interface LearningModule {
  id: string;
  subjectId: string;
  title: string;
  subtitle: string;
  sourceNote: string;
  grade: string;
  speechLang: SpeechLang;
  accentColor: string;
  vocab: VocabItem[];
  grammarRules: GrammarRule[];
  audioQuiz: QuizQuestion[];
  dressUpTasks: DressUpTask[];
  sentenceTasks: SentenceTask[];
  sortRounds: SortRound[];
  spellingTasks: SpellingTask[];
  examQuestions: QuizQuestion[];
  twisters?: TwisterItem[];
}

export interface SubjectDefinition {
  id: string;
  name: string;
  description: string;
  icon: "languages" | "calculator" | "book-open" | "leaf" | "landmark";
  theme: "amber" | "blue" | "green" | "coral" | "plum";
  defaultSpeechLang: SpeechLang;
  comingSoon?: boolean;
}

export type GameModeId =
  | "flashcards"
  | "grammar"
  | "audio-quiz"
  | "dress-up"
  | "sentences"
  | "sorter"
  | "memory"
  | "spelling"
  | "exam";
