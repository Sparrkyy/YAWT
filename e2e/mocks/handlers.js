import { http, HttpResponse } from 'msw';
import { MOCK_SETS_ROWS, MOCK_EXERCISES_ROWS, MOCK_PLANS_ROWS } from './data';

// Deep-copy so handlers can mutate without polluting the originals
let setsRows, exercisesRows, plansRows;

export function resetMockData() {
  setsRows = JSON.parse(JSON.stringify(MOCK_SETS_ROWS));
  exercisesRows = JSON.parse(JSON.stringify(MOCK_EXERCISES_ROWS));
  plansRows = JSON.parse(JSON.stringify(MOCK_PLANS_ROWS));
}

resetMockData();

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets/:sheetId';

export const handlers = [
  // GET Sets
  http.get(`${SHEETS_BASE}/values/Sets!A:I`, () => {
    return HttpResponse.json({ values: setsRows });
  }),

  // GET Exercises
  http.get(`${SHEETS_BASE}/values/Exercises!A:D`, () => {
    return HttpResponse.json({ values: exercisesRows });
  }),

  // GET Plans
  http.get(`${SHEETS_BASE}/values/Plans!A:C`, () => {
    return HttpResponse.json({ values: plansRows });
  }),

  // Append (addSet, addExercise, addPlan) — match any values path ending in :append
  http.post(/sheets\.googleapis\.com\/v4\/spreadsheets\/[^/]+\/values\/.*:append/, async ({ request }) => {
    const body = await request.json();
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.includes('Sets')) {
      setsRows.push(...(body.values ?? []));
    } else if (path.includes('Exercises')) {
      exercisesRows.push(...(body.values ?? []));
    } else if (path.includes('Plans')) {
      plansRows.push(...(body.values ?? []));
    }

    return HttpResponse.json({
      spreadsheetId: 'mock-sheet-id',
      updates: { updatedRows: body.values?.length ?? 0 },
    });
  }),

  // PUT (updateExercise, updatePlan) — match any values path
  http.put(/sheets\.googleapis\.com\/v4\/spreadsheets\/[^/]+\/values\//, async () => {
    return HttpResponse.json({
      spreadsheetId: 'mock-sheet-id',
      updatedCells: 4,
    });
  }),

  // batchUpdate (deleteSet, deletePlan)
  http.post(/sheets\.googleapis\.com\/v4\/spreadsheets\/[^/]+:batchUpdate/, async () => {
    return HttpResponse.json({ spreadsheetId: 'mock-sheet-id', replies: [{}] });
  }),

  // OAuth tokeninfo
  http.get('https://oauth2.googleapis.com/tokeninfo', () => {
    return HttpResponse.json({
      sub: 'mock-user-123',
      email: 'test@example.com',
      email_verified: 'true',
      expires_in: '3600',
    });
  }),
];
