import { google } from 'googleapis'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VocabEntry {
  id:          string
  japanese:    string
  reading:     string   // pronunciation / furigana
  english:     string
  created_at:  string   // ISO 8601
  next_review: string   // ISO 8601
  interval:    number   // days
  ease_factor: number   // SM-2 ease factor
  repetitions: number   // successful review count
}

// ─── Sheet layout ─────────────────────────────────────────────────────────────
// Row 1 = headers (created manually in the sheet)
// Columns: A=id  B=japanese  C=reading  D=english  E=created_at
//          F=next_review  G=interval  H=ease_factor  I=repetitions

const SHEET_NAME = 'Vocab'

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key:  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
}

function spreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID
  if (!id) throw new Error('GOOGLE_SPREADSHEET_ID is not set')
  return id
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToVocab(row: string[]): VocabEntry {
  return {
    id:          row[0] ?? '',
    japanese:    row[1] ?? '',
    reading:     row[2] ?? '',
    english:     row[3] ?? '',
    created_at:  row[4] ?? '',
    next_review: row[5] ?? new Date().toISOString(),
    interval:    Number(row[6]) || 1,
    ease_factor: Number(row[7]) || 2.5,
    repetitions: Number(row[8]) || 0,
  }
}

function vocabToRow(v: VocabEntry): string[] {
  return [
    v.id, v.japanese, v.reading, v.english, v.created_at,
    v.next_review, String(v.interval), String(v.ease_factor), String(v.repetitions),
  ]
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getAllVocab(): Promise<VocabEntry[]> {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${SHEET_NAME}!A2:I`,
  })
  const rows = (res.data.values ?? []) as string[][]
  return rows.filter(r => r[0]).map(rowToVocab)
}

export async function addVocab(
  data: Pick<VocabEntry, 'japanese' | 'reading' | 'english'>
): Promise<VocabEntry> {
  const sheets = getSheetsClient()
  const entry: VocabEntry = {
    id:          Date.now().toString(),
    ...data,
    created_at:  new Date().toISOString(),
    next_review: new Date().toISOString(), // due immediately
    interval:    1,
    ease_factor: 2.5,
    repetitions: 0,
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId:   spreadsheetId(),
    range:           `${SHEET_NAME}!A:I`,
    valueInputOption:'RAW',
    requestBody:     { values: [vocabToRow(entry)] },
  })
  return entry
}

export async function updateVocab(
  id: string,
  updates: Partial<VocabEntry>
): Promise<VocabEntry> {
  const sheets = getSheetsClient()
  const sid    = spreadsheetId()

  // Find the row number
  const colARes = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range:         `${SHEET_NAME}!A:A`,
  })
  const ids = ((colARes.data.values ?? []) as string[][]).map(r => r[0])
  // Row 1 is header → data starts at index 1 in the array → sheet row = index + 1
  const idx = ids.indexOf(id)
  if (idx === -1) throw new Error(`Vocab id "${id}" not found`)
  const rowNum = idx + 1 // 1-indexed sheet row

  // Read current row
  const rowRes = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range:         `${SHEET_NAME}!A${rowNum}:I${rowNum}`,
  })
  const current = rowToVocab(((rowRes.data.values ?? [[]])[0] ?? []) as string[])
  const updated = { ...current, ...updates }

  await sheets.spreadsheets.values.update({
    spreadsheetId:   sid,
    range:           `${SHEET_NAME}!A${rowNum}:I${rowNum}`,
    valueInputOption:'RAW',
    requestBody:     { values: [vocabToRow(updated)] },
  })
  return updated
}

export async function deleteVocab(id: string): Promise<void> {
  const sheets = getSheetsClient()
  const sid    = spreadsheetId()

  // Get spreadsheet metadata to find the sheet ID
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sid })
  const sheet = meta.data.sheets?.find(
    s => s.properties?.title === SHEET_NAME
  )
  if (!sheet?.properties?.sheetId == null) throw new Error('Sheet not found')
  const sheetId = sheet.properties!.sheetId!

  // Find row
  const colARes = await sheets.spreadsheets.values.get({
    spreadsheetId: sid,
    range:         `${SHEET_NAME}!A:A`,
  })
  const ids = ((colARes.data.values ?? []) as string[][]).map(r => r[0])
  const idx = ids.indexOf(id)
  if (idx === -1) throw new Error(`Vocab id "${id}" not found`)

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sid,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension:  'ROWS',
            startIndex: idx,       // 0-indexed
            endIndex:   idx + 1,
          },
        },
      }],
    },
  })
}
