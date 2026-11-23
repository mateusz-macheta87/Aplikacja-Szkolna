import type { VisualSpec } from "@/types/content";

export interface StickerDef {
  id: string;
  namePl: string;
  phraseEn: string;
  audioKey?: string;
  unlockHint: string;
  visual: VisualSpec;
  bg: string;
}

export const STICKERS: StickerDef[] = [
  {
    id: "stk-clothes",
    namePl: "Czerwony płaszczyk",
    phraseEn: "I'm wearing a red coat.",
    audioKey: "s-wearing-red-coat",
    unlockHint: "Ukończ przystanek 1: Clothes",
    visual: { kind: "coat", color: "red" },
    bg: "#FFE4E6",
  },
  {
    id: "stk-colours",
    namePl: "Tęczowa kredka",
    phraseEn: "Colour the hat red.",
    audioKey: "s-colour-hat-red",
    unlockHint: "Ukończ przystanek 2: Colours",
    visual: { kind: "color-swatch", color: "purple" },
    bg: "#F3E8FF",
  },
  {
    id: "stk-wearing",
    namePl: "Żółty sweterek",
    phraseEn: "I'm wearing a yellow jumper.",
    audioKey: "s-wearing-yellow-jumper",
    unlockHint: "Ukończ przystanek 3: I'm wearing",
    visual: { kind: "jumper", color: "yellow" },
    bg: "#FEF3C7",
  },
  {
    id: "stk-dressup",
    namePl: "Fioletowe szorty",
    phraseEn: "I'm wearing purple shorts.",
    audioKey: "s-wearing-purple-shorts",
    unlockHint: "Ukończ przystanek 4: Dress up",
    visual: { kind: "shorts", color: "purple" },
    bg: "#EDE9FE",
  },
  {
    id: "stk-seasons",
    namePl: "Jesienne drzewo",
    phraseEn: "It's autumn.",
    audioKey: "s-its-autumn",
    unlockHint: "Ukończ przystanek 5: Seasons",
    visual: { kind: "autumn" },
    bg: "#FFEDD5",
  },
  {
    id: "stk-weather",
    namePl: "Uśmiechnięte słońce",
    phraseEn: "It's sunny.",
    audioKey: "s-its-sunny",
    unlockHint: "Ukończ przystanek 6: Weather",
    visual: { kind: "sunny" },
    bg: "#FEF9C3",
  },
  {
    id: "stk-listen",
    namePl: "Różowa spódniczka",
    phraseEn: "I'm wearing a pink skirt.",
    audioKey: "s-wearing-pink-skirt",
    unlockHint: "Ukończ przystanek 7: Bzyczek says",
    visual: { kind: "skirt", color: "pink" },
    bg: "#FCE7F3",
  },
  {
    id: "stk-write",
    namePl: "Niebieskie spodnie",
    phraseEn: "I'm wearing blue trousers.",
    audioKey: "s-wearing-blue-trousers",
    unlockHint: "Ukończ przystanek 8: Listen & write",
    visual: { kind: "trousers", color: "blue" },
    bg: "#DBEAFE",
  },
  {
    id: "stk-test",
    namePl: "Mistrzyni sprawdzianu",
    phraseEn: "I love my new clothes.",
    audioKey: "s-love-new-clothes",
    unlockHint: "Ukończ przystanek 9: Test",
    visual: { kind: "shoes", color: "yellow" },
    bg: "#DCFCE7",
  },
  {
    id: "stk-treasure",
    namePl: "Złoty skarb Bzyczka",
    phraseEn: "My favourite season is summer.",
    audioKey: "s-favourite-summer",
    unlockHint: "Otwórz Skarb na końcu mapy!",
    visual: { kind: "summer" },
    bg: "#FEF3C7",
  },
  {
    id: "stk-daily",
    namePl: "Wiosenny kwiat",
    phraseEn: "It's spring.",
    audioKey: "s-its-spring",
    unlockHint: "Zrób Zadanie dnia!",
    visual: { kind: "spring" },
    bg: "#FCE7F3",
  },
  {
    id: "stk-blitz",
    namePl: "Błyskawica",
    phraseEn: "It's snowy. It's winter.",
    audioKey: "s-snowy-winter",
    unlockHint: "Zagraj w Błyskawicę!",
    visual: { kind: "snowy" },
    bg: "#E0F2FE",
  },
  {
    id: "stk-duel",
    namePl: "Rodzinny puchar",
    phraseEn: "Goodnight! Sleep well!",
    audioKey: "s-goodnight",
    unlockHint: "Zagraj w Pojedynek z rodzicem!",
    visual: { kind: "ice-cream" },
    bg: "#FFE4E6",
  },
  {
    id: "stk-dictionary",
    namePl: "Odkrywczyni słówek",
    phraseEn: "I'm wearing pyjamas.",
    audioKey: "s-wearing-pyjamas",
    unlockHint: "Opanuj 8 słówek w Słowniczku",
    visual: { kind: "pyjamas", color: "pink" },
    bg: "#F3E8FF",
  },
];

export interface WardrobeAccessory {
  id: string;
  namePl: string;
  description: string;
  cost: number;
  badgeEmoji: string;
  overlayStyle: "crown" | "flower-crown" | "heart-glasses" | "rainbow-scarf" | "fairy-wings" | "magic-wand" | "winter-pom" | "gold-star-pin";
}

export const WARDROBE_ACCESSORIES: WardrobeAccessory[] = [
  {
    id: "acc-flower",
    namePl: "Wiosenny wianek",
    description: "Kwiatowy wianek na czapeczkę Bzyczka",
    cost: 3,
    badgeEmoji: "🌸",
    overlayStyle: "flower-crown",
  },
  {
    id: "acc-glasses",
    namePl: "Okulary serduszka",
    description: "Różowe słoneczne okulary na lato",
    cost: 4,
    badgeEmoji: "🕶️",
    overlayStyle: "heart-glasses",
  },
  {
    id: "acc-scarf",
    namePl: "Tęczowy szalik",
    description: "Ciepły, miękki szalik na zimę",
    cost: 5,
    badgeEmoji: "🧣",
    overlayStyle: "rainbow-scarf",
  },
  {
    id: "acc-pin",
    namePl: "Złota gwiazdka",
    description: "Błyszcząca przypinka mistrzyni",
    cost: 5,
    badgeEmoji: "⭐",
    overlayStyle: "gold-star-pin",
  },
  {
    id: "acc-crown",
    namePl: "Korona Księżniczki",
    description: "Lśniąca złota korona z klejnotami",
    cost: 8,
    badgeEmoji: "👑",
    overlayStyle: "crown",
  },
  {
    id: "acc-wings",
    namePl: "Skrzydła motyla",
    description: "Bajkowe pastelowe skrzydełka",
    cost: 10,
    badgeEmoji: "🦋",
    overlayStyle: "fairy-wings",
  },
  {
    id: "acc-wand",
    namePl: "Czarodziejska różdżka",
    description: "Rozsypuje magiczne iskierki",
    cost: 12,
    badgeEmoji: "🪄",
    overlayStyle: "magic-wand",
  },
  {
    id: "acc-pom",
    namePl: "Zimowy pomponik",
    description: "Puszysta czapka na śnieżną pogodę",
    cost: 6,
    badgeEmoji: "❄️",
    overlayStyle: "winter-pom",
  },
];
