import { getToken } from './auth';

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

// Numeric GID for each tab — found in the sheet URL fragment (#gid=...)
// Sets tab is typically gid=0, Exercises is gid=1 (update if yours differ)
const SETS_GID = 0;

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

async function sheetsGet(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw Object.assign(new Error('Sheets GET failed'), { status: res.status });
  return res.json();
}

async function sheetsPost(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw Object.assign(new Error('Sheets POST failed'), { status: res.status });
  return res.json();
}

async function sheetsPut(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw Object.assign(new Error('Sheets PUT failed'), { status: res.status });
  return res.json();
}

// ─── Sets ────────────────────────────────────────────────────────────────────

export function rowToSet(row) {
  return {
    id: row[0] ?? '',
    date: row[1] ?? '',
    user: row[2] ?? '',
    exercise: row[3] ?? '',
    reps: row[4] !== '' && row[4] != null ? Number(row[4]) : null,
    weight: Number(row[5] ?? 0),
    notes: row[6] ?? '',
    createdAt: row[7] ?? '',
  };
}

export function setToRow(set) {
  return [
    set.id,
    set.date,
    set.user,
    set.exercise,
    set.reps != null ? set.reps : '',
    set.weight,
    set.notes ?? '',
    set.createdAt,
  ];
}

export async function getSets() {
  const data = await sheetsGet('/values/Sets!A:H');
  const rows = data.values ?? [];
  // skip header row (index 0)
  return rows.slice(1).map(rowToSet).filter(s => s.id);
}

export async function addSet(set) {
  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const newSet = { ...set, id };
  await sheetsPost(
    '/values/Sets!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',
    { values: [setToRow(newSet)] }
  );
  return newSet;
}

export async function deleteSet(id) {
  const data = await sheetsGet('/values/Sets!A:H');
  const rows = data.values ?? [];
  // rows[0] is header; find the data row (1-based in the sheet)
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) return;

  await sheetsPost(':batchUpdate', {
    requests: [{
      deleteDimension: {
        range: {
          sheetId: SETS_GID,
          dimension: 'ROWS',
          startIndex: rowIndex,     // 0-based absolute (header = 0, first data = 1)
          endIndex: rowIndex + 1,
        },
      },
    }],
  });
}

// ─── Exercises ───────────────────────────────────────────────────────────────

export function rowToExercise(row) {
  let muscles = {};
  try { muscles = JSON.parse(row[1] ?? '{}'); } catch { /* ignore */ }
  return { name: row[0] ?? '', muscles };
}

export function exerciseToRow(ex) {
  return [ex.name, JSON.stringify(ex.muscles ?? {})];
}

export async function getExercises() {
  const data = await sheetsGet('/values/Exercises!A:B');
  const rows = data.values ?? [];
  return rows.slice(1).map(rowToExercise).filter(e => e.name);
}

export async function addExercise(exercise) {
  await sheetsPost(
    '/values/Exercises!A:B:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',
    { values: [exerciseToRow(exercise)] }
  );
}

export async function updateExercise(name, updatedExercise) {
  const data = await sheetsGet('/values/Exercises!A:B');
  const rows = data.values ?? [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === name);
  if (rowIndex === -1) return;

  const merged = { ...rowToExercise(rows[rowIndex]), ...updatedExercise };
  // rowIndex is 0-based in array; sheet rows are 1-based, so sheet row = rowIndex + 1
  const sheetRow = rowIndex + 1;
  await sheetsPut(
    `/values/Exercises!A${sheetRow}:B${sheetRow}?valueInputOption=RAW`,
    { values: [exerciseToRow(merged)] }
  );
}

// ─── Batch migration (Phase 5) ───────────────────────────────────────────────

export async function migrateSetsFromLocalStorage() {
  const raw = localStorage.getItem('workout_sets');
  if (!raw) return 0;
  const sets = JSON.parse(raw);
  if (!sets.length) return 0;

  const rows = sets.map(setToRow);
  await sheetsPost(
    '/values/Sets!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',
    { values: rows }
  );

  // Clear localStorage after successful migration
  localStorage.removeItem('workout_sets');
  localStorage.removeItem('csv_v1_imported');
  return sets.length;
}
