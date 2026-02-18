import csvText from './workout_log.csv?raw';

const EXERCISE_NAME_MAP = {
  'machine rear delt fly': 'Machine Rear Delt Fly (matrix)',
  'machine rear delt fly (matrix)': 'Machine Rear Delt Fly (matrix)',
  'machine chest fly': 'Machine Chest Fly (matrix)',
  'machine chest fly (matrix)': 'Machine Chest Fly (matrix)',
  'calf raise': 'Calf Raise',
  'sitting hamstring curl': 'Sitting Hamstring Curl',
  'hammer strength stack row': 'Hammer Strength Stack Row',
  'hammer str back-supported row': 'Hammer Str Back-Supported Row',
  'hammer strength preacher curl': 'Hammer Strength Preacher Curl',
  'matrix tricep push down': 'Matrix Tricep Push Down',
  'matrix cable row': 'Matrix Cable Row',
  'bulgarian split squat': 'Bulgarian Split Squat',
};

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseDate(str) {
  const parts = str.split('/');
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  const y = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function normalizeExercise(name) {
  const key = name.trim().toLowerCase();
  if (EXERCISE_NAME_MAP[key] !== undefined) return EXERCISE_NAME_MAP[key];
  return name.trim().replace(/\b\w/g, c => c.toUpperCase());
}

function parseCsvToSets(text) {
  const lines = text.split('\n');
  const sets = [];
  let lastDate = null;
  let lastUser = null;

  // Skip rows 0–2 (metadata + column header)
  for (let i = 3; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const dateCell = (fields[0] ?? '').trim();
    const userCell = (fields[1] ?? '').trim();
    const exerciseCell = (fields[2] ?? '').trim();
    const repsCell = (fields[3] ?? '').trim();
    const weightCell = (fields[4] ?? '').trim();
    const notesCell = (fields[5] ?? '').trim();

    // Skip fully empty rows
    if (!dateCell && !userCell && !exerciseCell && !repsCell && !weightCell && !notesCell) continue;

    // Carry forward date / user
    if (dateCell) lastDate = parseDate(dateCell);
    if (userCell) lastUser = userCell;

    // Skip if date or user still unknown
    if (!lastDate || !lastUser) continue;

    // Skip if reps or weight missing or non-numeric
    if (!repsCell || isNaN(parseFloat(repsCell))) continue;
    if (!weightCell || isNaN(parseFloat(weightCell))) continue;

    // Skip if exercise missing
    if (!exerciseCell) continue;

    sets.push({
      id: `csv-row-${i}`,
      date: lastDate,
      user: lastUser,
      exercise: normalizeExercise(exerciseCell),
      reps: parseInt(repsCell, 10),
      weight: parseFloat(weightCell),
      notes: notesCell,
    });
  }

  return sets;
}

const CSV_FLAG = 'csv_v1_imported';

export function ensureCsvImported() {
  if (localStorage.getItem(CSV_FLAG) !== null) return;

  const csvSets = parseCsvToSets(csvText);
  const raw = localStorage.getItem('workout_sets');
  const existing = raw ? JSON.parse(raw) : [];
  const existingIds = new Set(existing.map(s => s.id));

  const toAdd = csvSets.filter(s => !existingIds.has(s.id));
  localStorage.setItem('workout_sets', JSON.stringify([...existing, ...toAdd]));
  localStorage.setItem(CSV_FLAG, '1');
}
