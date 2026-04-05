import { google } from 'googleapis'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReadingScript = 'hiragana' | 'katakana' | ''

export interface ReadingCard {
  id:          string
  japanese:    string
  reading:     string       // pronunciation — hidden on card front
  english:     string
  next_review: string       // ISO 8601
  interval:    number
  ease_factor: number
  repetitions: number
  language:    ReadingScript // column I — 'hiragana' | 'katakana' | ''
  locked:      boolean       // column J — true = not yet learnt, hide from review
}

// ─── Sheet layout ─────────────────────────────────────────────────────────────
// Tab: "ReadingReview"
// Row 1 = headers:
//   A=id  B=japanese  C=reading  D=english  E=next_review
//   F=interval  G=ease_factor  H=repetitions  I=language  J=locked

const SHEET_NAME = 'ReadingReview'

// ─── Auto-detect script from reading field ────────────────────────────────────

export function detectScript(reading: string): ReadingScript {
  if (/[\u30A0-\u30FF]/.test(reading)) return 'katakana'
  if (/[\u3040-\u309F]/.test(reading)) return 'hiragana'
  return ''
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

function stripBom(s: string): string {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s
}

function normalizePrivateKey(raw: string | undefined): string {
  if (raw == null || raw === '') return ''
  let k = stripBom(raw).trim()
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim()
  }
  return k.replace(/\\n/g, '\n')
}

function getCredentials() {
  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()
  if (jsonRaw) {
    const parsed = JSON.parse(stripBom(jsonRaw)) as {
      client_email?: string
      private_key?: string
    }
    return {
      client_email: parsed.client_email!.trim(),
      private_key:  normalizePrivateKey(parsed.private_key),
    }
  }
  return {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? '',
    private_key:  normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  }
}

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

function sid(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID
  if (!id) throw new Error('GOOGLE_SPREADSHEET_ID is not set')
  return id
}

// ─── Row helpers ──────────────────────────────────────────────────────────────

function rowToCard(row: string[]): ReadingCard {
  return {
    id:          row[0] ?? '',
    japanese:    row[1] ?? '',
    reading:     row[2] ?? '',
    english:     row[3] ?? '',
    next_review: row[4] ?? new Date().toISOString(),
    interval:    Number(row[5]) || 1,
    ease_factor: Number(row[6]) || 2.5,
    repetitions: Number(row[7]) || 0,
    language:    (row[8] ?? '') as ReadingScript,
    locked:      (row[9] ?? '').toLowerCase() === 'true',
  }
}

function cardToRow(c: ReadingCard): string[] {
  return [
    c.id, c.japanese, c.reading, c.english, c.next_review,
    String(c.interval), String(c.ease_factor), String(c.repetitions),
    c.language,
  ]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllReadingCards(): Promise<ReadingCard[]> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sid(),
    range:         `${SHEET_NAME}!A2:J`,
  })
  return ((res.data.values ?? []) as string[][])
    .filter(r => r[0])
    .map(rowToCard)
    .filter(c => !c.locked)
}

export async function addReadingCard(
  data: Pick<ReadingCard, 'japanese' | 'reading'>
): Promise<ReadingCard> {
  const card: ReadingCard = {
    id:          Date.now().toString(),
    japanese:    data.japanese,
    reading:     data.reading,
    english:     '',
    next_review: new Date().toISOString(),
    interval:    1,
    ease_factor: 2.5,
    repetitions: 0,
    language:    detectScript(data.reading),
    locked:      false,
  }
  const sheets = getSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId:   sid(),
    range:           `${SHEET_NAME}!A:I`,
    valueInputOption:'RAW',
    requestBody:     { values: [cardToRow(card)] },
  })
  return card
}

export async function updateReadingCard(
  id: string,
  updates: Pick<ReadingCard, 'next_review' | 'interval' | 'ease_factor' | 'repetitions'>,
): Promise<void> {
  const sheets        = getSheetsClient()
  const spreadsheetId = sid()

  const colARes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A:A`,
  })
  const ids    = ((colARes.data.values ?? []) as string[][]).map(r => r[0])
  const idx    = ids.indexOf(id)
  if (idx === -1) throw new Error(`ReadingReview entry "${id}" not found`)
  const rowNum = idx + 1

  const rowRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A${rowNum}:I${rowNum}`,
  })
  const current = rowToCard(((rowRes.data.values ?? [[]])[0] ?? []) as string[])
  const updated: ReadingCard = { ...current, ...updates }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range:           `${SHEET_NAME}!A${rowNum}:I${rowNum}`,
    valueInputOption:'RAW',
    requestBody:     { values: [cardToRow(updated)] },
  })
}

export async function deleteReadingCard(id: string): Promise<void> {
  const sheets        = getSheetsClient()
  const spreadsheetId = sid()

  const meta  = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(s => s.properties?.title === SHEET_NAME)
  const sheetId = sheet?.properties?.sheetId
  if (sheetId == null) throw new Error('ReadingReview sheet not found')

  const colARes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_NAME}!A:A`,
  })
  const ids = ((colARes.data.values ?? []) as string[][]).map(r => r[0])
  const idx = ids.indexOf(id)
  if (idx === -1) throw new Error(`ReadingReview entry "${id}" not found`)

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: idx, endIndex: idx + 1 },
        },
      }],
    },
  })
}
