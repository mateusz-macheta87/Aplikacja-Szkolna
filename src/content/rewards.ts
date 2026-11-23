import type { VisualSpec } from "@/types/content";

export interface StickerDef {
  id: string;
  namePl: string;
  phraseEn: string;
  audioKey?: string;
  unlockHint: string;
  visual: VisualSpec;
  artImage?: string;
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
    bg: "#FFF0F2",
  },
  {
    id: "stk-colours",
    namePl: "Tęczowa kredka",
    phraseEn: "Colour the hat red.",
    audioKey: "s-colour-hat-red",
    unlockHint: "Ukończ przystanek 2: Colours",
    visual: { kind: "color-swatch", color: "purple" },
    bg: "#F8F0FF",
  },
  {
    id: "stk-wearing",
    namePl: "Żółty sweterek",
    phraseEn: "I'm wearing a yellow jumper.",
    audioKey: "s-wearing-yellow-jumper",
    unlockHint: "Ukończ przystanek 3: I'm wearing",
    visual: { kind: "jumper", color: "yellow" },
    artImage: "item-yellow-jumper.webp",
    bg: "#FFF8E1",
  },
  {
    id: "stk-dressup",
    namePl: "Fioletowe szorty",
    phraseEn: "I'm wearing purple shorts.",
    audioKey: "s-wearing-purple-shorts",
    unlockHint: "Ukończ przystanek 4: Dress up",
    visual: { kind: "shorts", color: "purple" },
    bg: "#F3ECFF",
  },
  {
    id: "stk-seasons",
    namePl: "Złota jesień",
    phraseEn: "It's autumn.",
    audioKey: "s-its-autumn",
    unlockHint: "Ukończ przystanek 5: Seasons",
    visual: { kind: "autumn" },
    artImage: "season-autumn.webp",
    bg: "#FFF3E0",
  },
  {
    id: "stk-weather",
    namePl: "Tęczowy deszczyk",
    phraseEn: "It's rainy.",
    audioKey: "s-its-rainy",
    unlockHint: "Ukończ przystanek 6: Weather",
    visual: { kind: "rainy" },
    artImage: "weather-rainy.webp",
    bg: "#FFF1F5",
  },
  {
    id: "stk-listen",
    namePl: "Różowa spódniczka",
    phraseEn: "I'm wearing a pink skirt.",
    audioKey: "s-wearing-pink-skirt",
    unlockHint: "Ukończ przystanek 7: Bzyczek says",
    visual: { kind: "skirt", color: "pink" },
    bg: "#FDF0F7",
  },
  {
    id: "stk-write",
    namePl: "Niebieskie spodnie",
    phraseEn: "I'm wearing blue trousers.",
    audioKey: "s-wearing-blue-trousers",
    unlockHint: "Ukończ przystanek 8: Listen & write",
    visual: { kind: "trousers", color: "blue" },
    bg: "#EDF6FF",
  },
  {
    id: "stk-test",
    namePl: "Korona Mistrzyni",
    phraseEn: "I love my new clothes.",
    audioKey: "s-love-new-clothes",
    unlockHint: "Ukończ przystanek 9: Test",
    visual: { kind: "shoes", color: "yellow" },
    artImage: "art-crown.webp",
    bg: "#FFF9E6",
  },
  {
    id: "stk-treasure",
    namePl: "Złoty skarb Bzyczka",
    phraseEn: "My favourite season is summer.",
    audioKey: "s-favourite-summer",
    unlockHint: "Otwórz Skarb na końcu mapy!",
    visual: { kind: "summer" },
    artImage: "treasure-chest.webp",
    bg: "#FFF6DC",
  },
  {
    id: "stk-daily",
    namePl: "Wiosenne kwiaty",
    phraseEn: "It's spring.",
    audioKey: "s-its-spring",
    unlockHint: "Zrób Zadanie dnia!",
    visual: { kind: "spring" },
    artImage: "season-spring.webp",
    bg: "#FFF0F6",
  },
  {
    id: "stk-blitz",
    namePl: "Zimowa bajka",
    phraseEn: "It's snowy. It's winter.",
    audioKey: "s-snowy-winter",
    unlockHint: "Zagraj w Błyskawicę!",
    visual: { kind: "winter" },
    artImage: "season-winter.webp",
    bg: "#EEF7FF",
  },
  {
    id: "stk-duel",
    namePl: "Rodzinny puchar",
    phraseEn: "Goodnight! Sleep well!",
    audioKey: "s-goodnight",
    unlockHint: "Zagraj w Pojedynek z rodzicem!",
    visual: { kind: "ice-cream" },
    artImage: "duel-parent.webp",
    bg: "#FFF2EC",
  },
  {
    id: "stk-dictionary",
    namePl: "Motylek słówek",
    phraseEn: "I'm wearing pyjamas.",
    audioKey: "s-wearing-pyjamas",
    unlockHint: "Opanuj 8 słówek w Słowniczku",
    visual: { kind: "pyjamas", color: "pink" },
    artImage: "art-butterfly.webp",
    bg: "#F8F1FF",
  },
];

export interface HeroOutfit {
  id: string;
  namePl: string;
  description: string;
  cost: number;
  artFile: string;
  previewFile?: string;
  badgeText: string;
}

export const HERO_OUTFITS: HeroOutfit[] = [
  {
    id: "outfit-default",
    namePl: "Strój Podróżniczki",
    description: "Czerwony płaszczyk, żółta czapeczka i ulubiona książeczka!",
    cost: 0,
    artFile: "mascot-main.webp",
    badgeText: "Startowy",
  },
  {
    id: "outfit-spring",
    namePl: "Wiosenny Wianek",
    description: "Kwitnący wianek ze stokrotek i bukiet polnych kwiatków.",
    cost: 4,
    artFile: "hero-spring.webp",
    previewFile: "hero-spring.webp",
    badgeText: "Wiosna",
  },
  {
    id: "outfit-winter",
    namePl: "Zimowy Szalik i Czapka",
    description: "Pastelowa czapka z puszystym pomponem i tęczowy szalik.",
    cost: 6,
    artFile: "hero-winter.webp",
    previewFile: "hero-winter.webp",
    badgeText: "Zima",
  },
  {
    id: "outfit-princess",
    namePl: "Korona Księżniczki",
    description: "Lśniąca złota korona z klejnotami i różowa peleryna!",
    cost: 8,
    artFile: "hero-princess.webp",
    previewFile: "hero-princess.webp",
    badgeText: "Bajkowy!",
  },
  {
    id: "outfit-star",
    namePl: "Gwiazdka Mistrzyni",
    description: "Radosny strój świętowania w deszczu złotych gwiazdek!",
    cost: 10,
    artFile: "mascot-cheering.webp",
    previewFile: "mascot-cheering.webp",
    badgeText: "Mistrz!",
  },
];

export interface FrameCharm {
  id: string;
  namePl: string;
  description: string;
  cost: number;
  artFile: string;
}

export const FRAME_CHARMS: FrameCharm[] = [
  {
    id: "charm-butterfly",
    namePl: "Bajkowy Motylek",
    description: "Kolorowy motylek zawsze lata obok Twojej bohaterki!",
    cost: 3,
    artFile: "art-butterfly.webp",
  },
  {
    id: "charm-star",
    namePl: "Złota Gwiazdka",
    description: "Uśmiechnięta gwiazdka ze wstążeczką przy portrecie.",
    cost: 5,
    artFile: "art-gold-star.webp",
  },
  {
    id: "charm-umbrella",
    namePl: "Tęczowa Parasolka",
    description: "Różowa parasolka w groszki z małą tęczą.",
    cost: 7,
    artFile: "umbrella-review.webp",
  },
  {
    id: "charm-treasure",
    namePl: "Skrzyneczka Iskier",
    description: "Czarodziejska szkatułka pełna złotych iskier.",
    cost: 9,
    artFile: "treasure-chest.webp",
  },
];
