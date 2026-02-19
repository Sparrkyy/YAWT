import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = resolve(__dirname, '../ExamplesFilesFromExcelSheetVersion/workout_tracker.xlsx - Workout Log.csv');

const EXERCISE_MAP = {
  'Incline Bench Dumbell Bicep Curl': 'Incline dumbbell curl',
  'Dumbell Shoulder Press': 'Seated dumbbell shoulder press',
  'Hammer strength stack row': 'Hammer Str Stack Row',
};

function parseDate(raw) {
  // Fix two-digit year: 2/15/26 -> 2/15/2026
  const fixed = raw.replace(/^(\d{1,2}\/\d{1,2}\/)(\d{2})$/, (_, prefix, yy) => {
    return prefix + '20' + yy;
  });
  const [m, d, y] = fixed.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function mapExercise(raw) {
  const trimmed = raw.trim();
  // Check exact match first (after trimming)
  if (EXERCISE_MAP[trimmed]) return EXERCISE_MAP[trimmed];
  return trimmed;
}

function parseWeight(raw) {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  return String(Math.round(parseFloat(trimmed)));
}

const content = readFileSync(csvPath, 'utf8');
const lines = content.split('\n');

// Skip rows 1-3 (0-indexed: 0, 1, 2)
const dataLines = lines.slice(3);

// Parse CSV rows (simple split by comma, handle quoted fields)
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

let lastDate = '';
let lastUser = '';

const outputRows = [];

for (const line of dataLines) {
  if (!line.trim()) continue;

  const fields = parseCsvLine(line);
  // Columns: date, user, exercise, reps, weight, notes
  let [date, user, exercise, reps, weight, notes] = fields;

  date = (date || '').trim();
  user = (user || '').trim();
  exercise = (exercise || '').trim();
  reps = (reps || '').trim();
  weight = (weight || '').trim();
  notes = (notes || '').trim();

  // Skip fully blank rows (no date, user, or exercise)
  if (!date && !user && !exercise) continue;

  // Carry-forward date and user
  if (date) lastDate = date;
  else date = lastDate;

  if (user) lastUser = user;
  else user = lastUser;

  // Skip rows with no exercise
  if (!exercise) continue;

  // Skip rows with no reps AND no weight
  if (!reps && !weight) continue;

  const isoDate = parseDate(date);
  const mappedExercise = mapExercise(exercise);
  const intWeight = parseWeight(weight);
  const createdAt = `${isoDate}T12:00:00.000Z`;
  const id = randomUUID();

  outputRows.push([id, isoDate, user, mappedExercise, reps, intWeight, notes, createdAt].join('\t'));
}

// Print header + rows
console.log(['id', 'date', 'user', 'exercise', 'reps', 'weight', 'notes', 'createdAt'].join('\t'));
for (const row of outputRows) {
  console.log(row);
}

process.stderr.write(`\nTotal data rows: ${outputRows.length}\n`);
