# Inburgering Leestoets

PWA voor het oefenen van leesvaardigheid op A2-niveau voor het Nederlandse inburgeringsexamen.

## Features

- **350+ leesteksten** met meerkeuzevragen, verdeeld over 7 thematische batches
- **50 tabelvragen** — vragen die begrip van tabellen, roosters en schema's toetsen
- **Willekeurige vragen** — elke toets kiest 25 unieke vragen uit de bank
- **Slimme selectie** — geeft voorrang aan onbeantwoorde of eerder fout beantwoorde vragen
- **Drie moeilijkheidsniveaus** — easy, medium, hard met oplopende tekstlengte en complexiteit
- **Bladwijzers** — markeer vragen om later opnieuw te bekijken
- **Voortgangsstatistieken** — sessie- en lifetime-statistieken op de startpagina
- **PWA** — installeerbaar op desktop en mobiel, werkt offline
- **65-minuten timer** — zoals het echte examen

## Snel starten

```bash
npm install
npm run dev
```

Open http://localhost:5173 in je browser.

## Bouwen voor productie

```bash
npm run build
npm run preview
```

De `dist/` map bevat de statische bestanden — te deployen naar elke statische hosting.

## Project structuur

```
src/
  data/
    types.ts              # BankEntry, BankQuestion, TableData, AttemptRecord
    questionBank.ts       # YAML-loader, slimme vraagselectie, voortgang bijhouden
    questions-batch-*.yaml # 350+ leesteksten in YAML-formaat
    index.ts              # Publieke API
  context/
    ExamContext.tsx       # Examenstatus (useReducer + localStorage), statistieken
  hooks/
    useTimer.ts           # 65-minuten afteltimer met waarschuwingen
  components/
    Timer.tsx             # Timer-weergave (mm:ss)
    ProgressDots.tsx      # Voortgangsindicatie per leestekst
    ReadingText.tsx       # Leesvenster met optionele tabelweergave
    QuestionCard.tsx      # Meerkeuzevraag met bladwijzer-knop
    AnswerReview.tsx      # Nabespreking per vraag (goed/fout)
  pages/
    HomePage.tsx          # Startpagina met statistieken en startknop
    ExamPage.tsx          # Exameninterface (tekst links, vragen rechts)
    ResultsPage.tsx       # Uitslag en antwoordbespreking
```

## Vragenbank uitbreiden

Nieuwe vragen toevoegen als YAML-bestand in `src/data/` met de naam `questions-batch-N.yaml`. Het bestand wordt automatisch ingeladen door de glob-loader.

### YAML-structuur

```yaml
- id: 1
  title: "Afval scheiden"
  difficulty: easy
  text: |
    Lees hier de tekst...
  table:                          # optioneel, voor tabelvragen
    headers: ["Kolom 1", "Kolom 2"]
    rows:
      - ["waarde", "waarde"]
  questions:
    - questiontext: "Wat is het antwoord?"
      options:
        - label: A
          text: "Optie A"
        - label: B
          text: "Optie B"
        - label: C
          text: "Optie C"
      correct_answer: B
```

### Moeilijkheidsniveaus

| Niveau | Tekstlengte | Kenmerken |
|--------|-------------|-----------|
| `easy` | 40-80 woorden | Eenvoudige woordenschat, antwoord direct in tekst |
| `medium` | 80-130 woorden | Standaard A2, vereist zorgvuldig lezen |
| `hard` | 130-200 woorden | Langere tekst, vereist gevolgtrekking |

### Tabelvragen

Voeg een `table`-veld toe met `headers` en `rows`. De vragen moeten alleen te beantwoorden zijn door de tabel te lezen.

## Tech stack

- React 19 + TypeScript 7
- Vite 6 + Tailwind CSS 4
- React Router 7
- js-yaml (YAML-parsing)
- vite-plugin-pwa (service worker + manifest)
