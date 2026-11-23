#!/usr/bin/env python3
"""
Generates crisp British English (en-GB) neural MP3 audio clips for Aplikacja Szkolna.
Clips are saved under public/audio/en-GB/<audioKey>.mp3 so the iPad PWA can play
natural voice pronunciation offline with zero external API latency.
"""

import asyncio
import os
import sys
from pathlib import Path
import edge_tts

VOICE = "en-GB-SoniaNeural"
OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "audio" / "en-GB"

CLIPS = {
    # Single words (Unit 1 + colours + extras)
    "w-coat": "coat",
    "w-trousers": "trousers",
    "w-t-shirt": "T-shirt",
    "w-jumper": "jumper",
    "w-skirt": "skirt",
    "w-shorts": "shorts",
    "w-shoes": "shoes",
    "w-cap": "cap",
    "w-pyjamas": "pyjamas",
    "w-slippers": "slippers",
    "w-dressing-gown": "dressing gown",
    "w-hat": "hat",
    "w-shirt": "shirt",
    "w-spring": "spring",
    "w-summer": "summer",
    "w-autumn": "autumn",
    "w-winter": "winter",
    "w-sunny": "sunny",
    "w-cloudy": "cloudy",
    "w-rainy": "rainy",
    "w-snowy": "snowy",
    "w-hot": "hot",
    "w-cold": "cold",
    "w-red": "red",
    "w-blue": "blue",
    "w-yellow": "yellow",
    "w-green": "green",
    "w-purple": "purple",
    "w-pink": "pink",
    "w-orange": "orange",
    "w-brown": "brown",
    "w-black": "black",
    "w-ice-cream": "ice cream",
    "w-soup": "soup",

    # Sentences & Exam phrases
    "s-wearing-a-coat": "I'm wearing a coat.",
    "s-wearing-red-coat": "I'm wearing a red coat.",
    "s-wearing-blue-trousers": "I'm wearing blue trousers.",
    "s-wearing-green-tshirt": "I'm wearing a green T-shirt.",
    "s-wearing-yellow-jumper": "I'm wearing a yellow jumper.",
    "s-wearing-pink-skirt": "I'm wearing a pink skirt.",
    "s-wearing-purple-shorts": "I'm wearing purple shorts.",
    "s-wearing-yellow-shoes": "I'm wearing yellow shoes.",
    "s-wearing-green-cap": "I'm wearing a green cap.",
    "s-wearing-pyjamas": "I'm wearing pyjamas.",
    "s-wearing-slippers": "I'm wearing slippers.",
    "s-wearing-blue-dressing-gown": "I'm wearing a blue dressing gown.",
    "s-put-on-hat": "Put on your hat!",
    "s-put-on-coat": "Put on your coat!",
    "s-wearing-yellow-shirt": "I'm wearing a yellow shirt.",
    "s-its-spring": "It's spring.",
    "s-its-autumn": "It's autumn.",
    "s-favourite-summer": "My favourite season is summer.",
    "s-winter-coat": "It's winter. I'm wearing a coat.",
    "s-its-sunny": "It's sunny.",
    "s-its-cloudy": "It's cloudy.",
    "s-its-rainy": "It's rainy.",
    "s-its-snowy": "It's snowy.",
    "s-its-hot": "It's hot.",
    "s-cold-put-on-coat": "It's cold. Put on your coat!",
    "s-wearing-orange-shorts": "I'm wearing orange shorts.",
    "s-wearing-brown-trousers": "I'm wearing brown trousers.",
    "s-wearing-black-shoes": "I'm wearing black shoes.",
    "s-whats-weather": "What's the weather like today?",
    "s-sunny-summer": "It's sunny. It's summer.",
    "s-snowy-winter": "It's snowy. It's winter.",
    "s-i-like-spring": "I like spring.",
    "s-i-dont-like-winter": "I don't like winter.",
    "s-new-coat-mr-beetle": "Here's a new coat for Mr Beetle.",
    "s-love-new-clothes": "I love my new clothes.",
    "s-goodnight": "Goodnight! Sleep well!",
    "s-pink-skirt-yellow-shoes": "I'm wearing a pink skirt and yellow shoes.",
    "s-green-tshirt-orange-shorts": "I'm wearing a green T-shirt and orange shorts.",
    "s-blue-jumper-brown-trousers": "I'm wearing a blue jumper and brown trousers.",
    "s-red-coat-black-shoes": "I'm wearing a red coat and black shoes.",
    "s-bug-twister": "I'm wearing a new T-shirt, shorts and shoes.",
    # Station 2: Colours (Colour the ... ...)
    "s-colour-hat-red": "Colour the hat red.",
    "s-colour-coat-yellow": "Colour the coat yellow.",
    "s-colour-shorts-purple": "Colour the shorts purple.",
    "s-colour-trousers-blue": "Colour the trousers blue.",
    "s-colour-skirt-pink": "Colour the skirt pink.",
    "s-colour-jumper-green": "Colour the jumper green.",
    "s-colour-shoes-orange": "Colour the shoes orange.",
    "s-colour-cap-blue": "Colour the cap blue.",
}


async def gen_one(sem: asyncio.Semaphore, key: str, text: str) -> None:
    out_path = OUT_DIR / f"{key}.mp3"
    if out_path.exists() and out_path.stat().st_size > 1000:
        return
    async with sem:
        for attempt in range(4):
            try:
                communicate = edge_tts.Communicate(text, VOICE, rate="-5%")
                await communicate.save(str(out_path))
                return
            except Exception as exc:
                if attempt == 3:
                    raise
                await asyncio.sleep(1.5 * (attempt + 1))


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(3)
    await asyncio.gather(*(gen_one(sem, k, v) for k, v in CLIPS.items()))
    count = len(list(OUT_DIR.glob("*.mp3")))
    print(f"Generated {count} British English MP3 clips in {OUT_DIR}")


if __name__ == "__main__":
    asyncio.run(main())
