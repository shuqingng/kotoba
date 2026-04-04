---
name: Kotoba app overview
description: Japanese vocabulary flashcard web app — stack, structure, and design decisions
type: project
---

Personal Japanese vocabulary app at ~/Documents/Personal/Git Repo/kotoba.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · Google Sheets as database (googleapis)

**Design:** Japanese stationery aesthetic — deep navy (#1a1f3a), warm paper (#f5f0e8), vermilion (#c9414a), gold (#c9a84c). Logo uses 言葉 kanji in gold. Noto Sans JP + Inter fonts.

**Features:**
- `/` — vocab library (stats, searchable table, delete)
- `/add` — add new vocab (Japanese, reading/furigana, English) with live preview card
- `/review` — Anki-style flashcard session using SM-2 algorithm (Again/Hard/Good/Easy). 'Again' re-queues the card at end of session. Keyboard shortcuts: Space/Enter to flip, 1–4 to rate.

**Data (Google Sheets):**
Sheet named "Vocab", row 1 = headers.
Columns: A=id · B=japanese · C=reading · D=english · E=created_at · F=next_review · G=interval · H=ease_factor · I=repetitions

**Why:** Placeholder credentials approach — copy .env.local.example → .env.local and fill in GOOGLE_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
