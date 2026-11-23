# Bzyczek — Aplikacja Szkolna (iPad-First PWA)

Niezależna, multimedialna i modułowa aplikacja edukacyjna do nauki słownictwa, gramatyki oraz przygotowania do sprawdzianów szkolnych w formie gier językowych i quizów audio.

## Aktualny moduł: Język angielski — Unit 1: *Mr Beetle's New Clothes*
Przygotowany na podstawie podręcznika (str. 8–16, słowniczek obrazkowy str. 80) oraz zakresu sprawdzianu:
- **Słowniczek i Fiszki 3D** — 32 słówka (ubrania, kolory/kredki, pogoda, pory roku, ubrania na dobranoc) z naturalnymi nagraniami brytyjskiego lektora (`en-GB`) w tempie normalnym i wolnym („tryb żółwia”).
- **Ściągawka Gramatyczna + Bug Twister (`sh`)** — kolorowe schematy `I'm wearing a ...` vs `I'm wearing ...` (bez `a`), kolejność koloru przed ubraniem oraz `What's the weather like today?` → `It's sunny / cloudy / rainy / snowy`.
- **Audio Quiz** — słuchanie zdań i wskazywanie właściwych kolorowych ilustracji.
- **Kredki i Garderoba** — interaktywna kolorowanka ze słuchu (`I'm wearing a red coat`, `I'm wearing purple shorts`, itp.).
- **Budowniczy Zdań** — układanie pełnych zdań z klocków wyrazowych (z pułapkami na słówko `a`).
- **Sortownia Gramatyczna** — 3 rundy: *Z „a” czy bez „a”?*, *Lato czy Zima?*, *Pogoda czy Pora roku?*.
- **Memory Audio** — dopasowywanie obrazków do mówiących słówek po angielsku.
- **Mistrz Pisowni** — dyktando audio w trybie kafelków z literami lub klawiatury.
- **Próbny Sprawdzian** — 15 pytań jak na prawdziwej kartkówce + tryb **„Poćwicz tylko błędy”**.
- **Strefa Rodzica** — raport gotowości %, zmiana imienia, kopia zapasowa i import kolejnych modułów JSON.

## Jak otworzyć i zainstalować na iPadzie?
1. Po włączeniu **GitHub Pages** (Settings → Pages → Source: **GitHub Actions**) aplikacja jest dostępna pod adresem:
   `https://mateusz-macheta87.github.io/Aplikacja-Szkolna/`
2. Otwórz link w **Safari na iPadzie**.
3. Stuknij przycisk **Udostępnij** (kwadrat ze strzałką w górę) → **„Dodaj do ekranu początkowego”**.
4. Aplikacja otwiera się pełnoekranowo jak natywna aplikacja na iPadOS i działa również **offline** (wszystkie nagrania MP3 buforują się lokalnie).

## Jak dodać kolejny sprawdzian lub przedmiot?
- **Bez programowania (na iPadzie):** wejdź w **Strefa Rodzica** → pobierz szablon JSON, uzupełnij słówka/pytania i zaimportuj plik.
- **W kodzie repozytorium:** dodaj plik modułu w `src/content/subjects/<przedmiot>/<modul>.ts`, zarejestruj go w `src/content/registry.ts`, uruchom `npm run validate-content` oraz `npm run generate-audio` (dla nagrań MP3).

## Uruchomienie lokalne
```bash
npm install
npm test
npm run dev
```
