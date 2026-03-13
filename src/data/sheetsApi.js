import { getToken } from './auth';
import { startLoading, stopLoading } from './loadingTracker';

let sheetId = null;
export function setSheetId(id) { sheetId = id; }

let errorCallback = null;
export function setApiErrorHandler(handler) { errorCallback = handler; }

function getBase() { return `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`; }

// Numeric GID for each tab — found in the sheet URL fragment (#gid=...)
// Sets tab is typically gid=0, Exercises is gid=1 (update if yours differ)
const SETS_GID = 0;

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

async function sheetsGet(path, operation) {
  startLoading();
  try {
    const res = await fetch(`${getBase()}${path}`, { headers: authHeaders() });
    if (!res.ok) {
      const err = Object.assign(new Error('Sheets GET failed'), { status: res.status });
      errorCallback?.({ message: err.message, status: res.status, operation });
      throw err;
    }
    return res.json();
  } finally {
    stopLoading();
  }
}

async function sheetsPost(path, body, operation) {
  startLoading();
  try {
    const res = await fetch(`${getBase()}${path}`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = Object.assign(new Error('Sheets POST failed'), { status: res.status });
      errorCallback?.({ message: err.message, status: res.status, operation });
      throw err;
    }
    return res.json();
  } finally {
    stopLoading();
  }
}

async function sheetsPut(path, body, operation) {
  startLoading();
  try {
    const res = await fetch(`${getBase()}${path}`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = Object.assign(new Error('Sheets PUT failed'), { status: res.status });
      errorCallback?.({ message: err.message, status: res.status, operation });
      throw err;
    }
    return res.json();
  } finally {
    stopLoading();
  }
}

// ─── Sets ────────────────────────────────────────────────────────────────────

// New column layout: A=id, B=date, C=user, D=exercise(formula), E=exercise_id, F=reps, G=weight, H=notes, I=createdAt
export function rowToSet(row) {
  return {
    id: row[0] ?? '',
    date: row[1] ?? '',
    user: row[2] ?? '',
    exercise: row[3] ?? '',
    exerciseId: row[4] ?? '',
    reps: row[5] !== '' && row[5] != null ? Number(row[5]) : null,
    weight: Number(row[6] ?? 0),
    notes: row[7] ?? '',
    createdAt: row[8] ?? '',
  };
}

export function setToRow(set) {
  // exerciseId falls back to exercise name for backward-compat with old data
  const exerciseId = set.exerciseId ?? set.exercise ?? '';
  return [
    set.id,
    set.date,
    set.user,
    `=IFERROR(XLOOKUP(INDIRECT("E"&ROW()), Exercises!A:A, Exercises!B:B), INDIRECT("E"&ROW()))`,
    exerciseId,
    set.reps != null ? set.reps : '',
    set.weight,
    set.notes ?? '',
    set.createdAt,
  ];
}

export async function getSets() {
  const data = await sheetsGet('/values/Sets!A:I', 'loading sets');
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
    '/values/Sets!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
    { values: [setToRow(newSet)] },
    'saving set'
  );
  return newSet;
}

export async function deleteSet(id) {
  const data = await sheetsGet('/values/Sets!A:I', 'deleting set');
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
  }, 'deleting set');
}

// ─── Exercises ───────────────────────────────────────────────────────────────

// New column layout: A=id, B=name, C=muscles, D=archived
export function rowToExercise(row) {
  let muscles = {};
  try { muscles = JSON.parse(row[2] ?? '{}'); } catch { /* ignore */ }
  return { id: row[0] ?? '', name: row[1] ?? '', muscles, archived: row[3] === 'true' };
}

export function exerciseToRow(ex) {
  return [ex.id, ex.name, JSON.stringify(ex.muscles ?? {}), ex.archived ? 'true' : ''];
}

export async function getExercises() {
  const data = await sheetsGet('/values/Exercises!A:D', 'loading exercises');
  const rows = data.values ?? [];
  return rows.slice(1).map(rowToExercise).filter(e => e.name);
}

export async function addExercise(exercise) {
  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const newExercise = { ...exercise, id };
  await sheetsPost(
    '/values/Exercises!A:D:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
    { values: [exerciseToRow(newExercise)] },
    'adding exercise'
  );
  return newExercise;
}

export async function updateExercise(exerciseId, updatedExercise) {
  const data = await sheetsGet('/values/Exercises!A:D', 'updating exercise');
  const rows = data.values ?? [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === exerciseId);
  if (rowIndex === -1) return;

  const merged = { ...rowToExercise(rows[rowIndex]), ...updatedExercise };
  const sheetRow = rowIndex + 1;
  await sheetsPut(
    `/values/Exercises!A${sheetRow}:D${sheetRow}?valueInputOption=RAW`,
    { values: [exerciseToRow(merged)] },
    'updating exercise'
  );
}

export function renameExercise(exerciseId, newName) {
  return updateExercise(exerciseId, { name: newName });
}

// ─── Plans ───────────────────────────────────────────────────────────────────

// Column layout: A=id, B=name, C=exerciseIds (JSON array)
export function rowToPlan(row) {
  let exerciseIds = [];
  try { exerciseIds = JSON.parse(row[2] ?? '[]'); } catch { /* ignore */ }
  return { id: row[0] ?? '', name: row[1] ?? '', exerciseIds };
}

export function planToRow(plan) {
  return [plan.id, plan.name, JSON.stringify(plan.exerciseIds ?? [])];
}

export async function getPlans() {
  try {
    const data = await sheetsGet('/values/Plans!A:C', 'loading plans');
    const rows = data.values ?? [];
    return rows.slice(1).map(rowToPlan).filter(p => p.id);
  } catch {
    return [];
  }
}

export async function addPlan(plan) {
  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const newPlan = { ...plan, id };
  await sheetsPost(
    '/values/Plans!A:C:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
    { values: [planToRow(newPlan)] },
    'adding plan'
  );
  return newPlan;
}

export async function updatePlan(planId, updatedPlan) {
  const data = await sheetsGet('/values/Plans!A:C', 'updating plan');
  const rows = data.values ?? [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === planId);
  if (rowIndex === -1) return;

  const merged = { ...rowToPlan(rows[rowIndex]), ...updatedPlan };
  const sheetRow = rowIndex + 1;
  await sheetsPut(
    `/values/Plans!A${sheetRow}:C${sheetRow}?valueInputOption=RAW`,
    { values: [planToRow(merged)] },
    'updating plan'
  );
}

async function getSheetGid(tabTitle) {
  const data = await sheetsGet('');
  const sheet = (data.sheets ?? []).find(s => s.properties.title === tabTitle);
  return sheet?.properties?.sheetId ?? null;
}

export async function deletePlan(id) {
  const data = await sheetsGet('/values/Plans!A:C', 'deleting plan');
  const rows = data.values ?? [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) return;

  const gid = await getSheetGid('Plans');
  if (gid === null) return;

  await sheetsPost(':batchUpdate', {
    requests: [{
      deleteDimension: {
        range: { sheetId: gid, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
      },
    }],
  }, 'deleting plan');
}

// ─── Sheet management ────────────────────────────────────────────────────────

export async function createNewSheet() {
  startLoading();
  try { return await _createNewSheet(); } finally { stopLoading(); }
}

async function _createNewSheet() {
  const BASE_SHEETS = 'https://sheets.googleapis.com/v4/spreadsheets';

  // 1. Create the spreadsheet
  const createRes = await fetch(BASE_SHEETS, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { title: 'YAWT Workout Tracker' } }),
  });
  if (!createRes.ok) {
    const err = Object.assign(new Error('Failed to create sheet'), { status: createRes.status });
    errorCallback?.({ message: err.message, status: createRes.status, operation: 'creating sheet' });
    throw err;
  }
  const created = await createRes.json();
  const id = created.spreadsheetId;
  const defaultSheetId = created.sheets[0].properties.sheetId;

  // 2. Rename "Sheet1" → "Sets" and add "Exercises" and "Plans" tabs
  await fetch(`${BASE_SHEETS}/${id}:batchUpdate`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { updateSheetProperties: { properties: { sheetId: defaultSheetId, title: 'Sets' }, fields: 'title' } },
        { addSheet: { properties: { title: 'Exercises' } } },
        { addSheet: { properties: { title: 'Plans' } } },
      ],
    }),
  });

  // 3. Write headers
  await fetch(`${BASE_SHEETS}/${id}/values/Sets!A1:I1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [['id', 'date', 'user', 'exercise', 'exercise_id', 'reps', 'weight', 'notes', 'createdAt']] }),
  });
  await fetch(`${BASE_SHEETS}/${id}/values/Exercises!A1:D1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [['id', 'name', 'muscles', 'archived']] }),
  });
  await fetch(`${BASE_SHEETS}/${id}/values/Plans!A1:C1?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [['id', 'name', 'exerciseIds']] }),
  });

  return id;
}

export async function validateSheet(id) {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Sets!A1`,
      { headers: authHeaders() }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Batch migration (Phase 5) ───────────────────────────────────────────────

export async function migrateSetsFromLocalStorage() {
  const raw = localStorage.getItem('workout_sets');
  if (!raw) return 0;
  const sets = JSON.parse(raw);
  if (!sets.length) return 0;

  const rows = sets.map(setToRow);
  await sheetsPost(
    '/values/Sets!A:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS',
    { values: rows }
  );

  // Clear localStorage after successful migration
  localStorage.removeItem('workout_sets');
  localStorage.removeItem('csv_v1_imported');
  return sets.length;
}

// ─── Schema migration (name → GUID) ──────────────────────────────────────────

function newUuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function sheetsClear(range) {
  const res = await fetch(`${getBase()}/values/${encodeURIComponent(range)}:clear`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw Object.assign(new Error('Sheets CLEAR failed'), { status: res.status });
  return res.json();
}

export async function migrateToGuids() {
  // Check if already migrated (new schema has "id" in Exercises!A1)
  const headerData = await sheetsGet('/values/Exercises!A1');
  const a1 = (headerData.values?.[0]?.[0] ?? '').toLowerCase();
  if (a1 === 'id') return; // already migrated

  // Fetch all exercises (old format: name, muscles, archived)
  const exData = await sheetsGet('/values/Exercises!A:C');
  const exRows = (exData.values ?? []).slice(1);
  const oldExercises = exRows
    .filter(r => r[0])
    .map(r => {
      let muscles = {};
      try { muscles = JSON.parse(r[1] ?? '{}'); } catch { /* ignore */ }
      return { id: newUuid(), name: r[0], muscles, archived: r[2] === 'true' };
    });

  // Fetch all sets (old format: id, date, user, exercise_name, reps, weight, notes, createdAt)
  const setsData = await sheetsGet('/values/Sets!A:H');
  const oldSetRows = (setsData.values ?? []).slice(1).filter(r => r[0]);

  // Build name → uuid map
  const nameToId = Object.fromEntries(oldExercises.map(e => [e.name, e.id]));

  const XLOOKUP_FORMULA = `=IFERROR(XLOOKUP(INDIRECT("E"&ROW()), Exercises!A:A, Exercises!B:B), INDIRECT("E"&ROW()))`;

  // Build new sets rows (columns: id, date, user, formula, exercise_id, reps, weight, notes, createdAt)
  const newSetRows = oldSetRows.map(r => [
    r[0] ?? '',               // id
    r[1] ?? '',               // date
    r[2] ?? '',               // user
    XLOOKUP_FORMULA,          // exercise (formula resolves to name)
    nameToId[r[3]] ?? r[3],   // exercise_id (UUID or original name as fallback)
    r[4] ?? '',               // reps
    r[5] ?? '',               // weight
    r[6] ?? '',               // notes
    r[7] ?? '',               // createdAt
  ]);

  // Rewrite Exercises tab
  await sheetsClear('Exercises!A:D');
  const exerciseHeader = [['id', 'name', 'muscles', 'archived']];
  const exerciseData = oldExercises.map(e => [e.id, e.name, JSON.stringify(e.muscles), e.archived ? 'true' : '']);
  await sheetsPut(
    `/values/Exercises!A1:D${1 + oldExercises.length}?valueInputOption=RAW`,
    { values: [...exerciseHeader, ...exerciseData] }
  );

  // Rewrite Sets tab
  await sheetsClear('Sets!A:I');
  const setHeader = [['id', 'date', 'user', 'exercise', 'exercise_id', 'reps', 'weight', 'notes', 'createdAt']];
  await sheetsPut(
    `/values/Sets!A1:I${1 + newSetRows.length}?valueInputOption=USER_ENTERED`,
    { values: [...setHeader, ...newSetRows] }
  );
}
