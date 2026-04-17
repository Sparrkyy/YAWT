// localStorage-backed mock backend for dev mode (?dev URL param)
// Mirrors the public API surface of sheetsApi.js

const KEYS = {
  sets: 'yawt_mock_sets',
  exercises: 'yawt_mock_exercises',
  plans: 'yawt_mock_plans',
  measurements: 'yawt_mock_measurements',
};

const today = new Date().toLocaleDateString('en-CA');
const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
const lastWeek = new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-CA');

const SEED_EXERCISES = [
  { id: 'ex-1', name: 'Bench Press',    muscles: { chest: 1, triceps: 0.5, frontDelts: 0.25 }, archived: false },
  { id: 'ex-2', name: 'Squat',          muscles: { quads: 1, glutes: 0.75, hamstrings: 0.5 }, archived: false },
  { id: 'ex-3', name: 'Deadlift',       muscles: { back: 1, hamstrings: 0.75, glutes: 0.5, lowBack: 0.5 }, archived: false },
  { id: 'ex-4', name: 'Overhead Press', muscles: { frontDelts: 1, sideDelts: 0.5, triceps: 0.5 }, archived: false },
  { id: 'ex-5', name: 'Barbell Row',    muscles: { back: 1, biceps: 0.5, rearDelts: 0.5 }, archived: false },
  { id: 'ex-6', name: 'Pull Up',        muscles: { back: 1, biceps: 0.75 }, archived: false },
];

const SEED_SETS = [
  { id: 'set-1', date: today,     user: 'Ethan', exercise: 'Bench Press',    exerciseId: 'ex-1', reps: 8,  weight: 185, notes: 'keep elbows tucked', createdAt: `${today}T10:00:00.000Z` },
  { id: 'set-2', date: today,     user: 'Ethan', exercise: 'Squat',          exerciseId: 'ex-2', reps: 5,  weight: 275, notes: 'felt good',           createdAt: `${today}T10:05:00.000Z` },
  { id: 'set-3', date: today,     user: 'Ava',   exercise: 'Bench Press',    exerciseId: 'ex-1', reps: 10, weight: 95,  notes: '',                    createdAt: `${today}T10:10:00.000Z` },
  { id: 'set-4', date: yesterday, user: 'Ethan', exercise: 'Deadlift',       exerciseId: 'ex-3', reps: 5,  weight: 315, notes: '',                    createdAt: `${yesterday}T09:00:00.000Z` },
  { id: 'set-5', date: yesterday, user: 'Ethan', exercise: 'Bench Press',    exerciseId: 'ex-1', reps: 6,  weight: 195, notes: 'shoulder felt tight',  createdAt: `${yesterday}T09:05:00.000Z` },
  { id: 'set-6', date: yesterday, user: 'Ava',   exercise: 'Squat',          exerciseId: 'ex-2', reps: 8,  weight: 135, notes: '',                    createdAt: `${yesterday}T09:10:00.000Z` },
];

const SEED_PLANS = [
  { id: 'plan-1', name: 'Push Day', exerciseIds: ['ex-1', 'ex-4'] },
  { id: 'plan-2', name: 'Pull Day', exerciseIds: ['ex-3', 'ex-5', 'ex-6'] },
  { id: 'plan-3', name: 'Leg Day',  exerciseIds: ['ex-2'] },
];

const SEED_MEASUREMENTS = [
  { id: 'meas-1', date: today,    user: 'Ethan', type: 'weight',  value: 185,  unit: 'lbs', notes: '', createdAt: `${today}T08:00:00.000Z` },
  { id: 'meas-2', date: today,    user: 'Ethan', type: 'waist',   value: 32,   unit: 'in',  notes: '', createdAt: `${today}T08:01:00.000Z` },
  { id: 'meas-3', date: today,    user: 'Ethan', type: 'bicepL',  value: 15,   unit: 'in',  notes: '', createdAt: `${today}T08:02:00.000Z` },
  { id: 'meas-4', date: today,    user: 'Ava',   type: 'weight',  value: 130,  unit: 'lbs', notes: '', createdAt: `${today}T08:10:00.000Z` },
  { id: 'meas-5', date: today,    user: 'Ava',   type: 'waist',   value: 26,   unit: 'in',  notes: '', createdAt: `${today}T08:11:00.000Z` },
  { id: 'meas-6', date: lastWeek, user: 'Ethan', type: 'weight',  value: 186,  unit: 'lbs', notes: '', createdAt: `${lastWeek}T08:00:00.000Z` },
  { id: 'meas-7', date: lastWeek, user: 'Ethan', type: 'waist',   value: 32.5, unit: 'in',  notes: '', createdAt: `${lastWeek}T08:01:00.000Z` },
  { id: 'meas-8', date: lastWeek, user: 'Ava',   type: 'weight',  value: 131,  unit: 'lbs', notes: '', createdAt: `${lastWeek}T08:10:00.000Z` },
];

function load(key, seed) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  save(key, seed);
  return seed;
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

const delay = (ms = 30) => new Promise(r => setTimeout(r, ms));

export function setSheetId() {}
export function setApiErrorHandler() {}

export async function createNewSheet() {
  await delay();
  return 'mock-sheet-id';
}

export async function validateSheet() {
  await delay();
  return true;
}

export async function migrateToGuids() {
  await delay();
}

// Sets
export async function getSets() {
  await delay();
  return load(KEYS.sets, SEED_SETS);
}

export async function addSet(set) {
  await delay();
  const sets = load(KEYS.sets, SEED_SETS);
  sets.push(set);
  save(KEYS.sets, sets);
}

export async function deleteSet(id) {
  await delay();
  const sets = load(KEYS.sets, SEED_SETS).filter(s => s.id !== id);
  save(KEYS.sets, sets);
}

// Exercises
export async function getExercises() {
  await delay();
  return load(KEYS.exercises, SEED_EXERCISES);
}

export async function addExercise(exercise) {
  await delay();
  const exercises = load(KEYS.exercises, SEED_EXERCISES);
  const newEx = { id: crypto.randomUUID(), archived: false, ...exercise };
  exercises.push(newEx);
  save(KEYS.exercises, exercises);
  return newEx;
}

export async function updateExercise(exerciseId, updates) {
  await delay();
  const exercises = load(KEYS.exercises, SEED_EXERCISES).map(ex =>
    ex.id === exerciseId ? { ...ex, ...updates } : ex
  );
  save(KEYS.exercises, exercises);
}

export function renameExercise(exerciseId, newName) {
  return updateExercise(exerciseId, { name: newName });
}

// Plans
export async function getPlans() {
  await delay();
  return load(KEYS.plans, SEED_PLANS);
}

export async function addPlan(plan) {
  await delay();
  const plans = load(KEYS.plans, SEED_PLANS);
  const newPlan = { id: crypto.randomUUID(), ...plan };
  plans.push(newPlan);
  save(KEYS.plans, plans);
  return newPlan;
}

export async function updatePlan(planId, updates) {
  await delay();
  const plans = load(KEYS.plans, SEED_PLANS).map(p =>
    p.id === planId ? { ...p, ...updates } : p
  );
  save(KEYS.plans, plans);
}

export async function deletePlan(id) {
  await delay();
  const plans = load(KEYS.plans, SEED_PLANS).filter(p => p.id !== id);
  save(KEYS.plans, plans);
}

// Measurements
export async function getMeasurements() {
  await delay();
  return load(KEYS.measurements, SEED_MEASUREMENTS);
}

export async function addMeasurement(measurement) {
  await delay();
  const measurements = load(KEYS.measurements, SEED_MEASUREMENTS);
  const newMeasurement = { id: crypto.randomUUID(), ...measurement };
  measurements.push(newMeasurement);
  save(KEYS.measurements, measurements);
  return newMeasurement;
}

export async function deleteMeasurement(id) {
  await delay();
  const measurements = load(KEYS.measurements, SEED_MEASUREMENTS).filter(m => m.id !== id);
  save(KEYS.measurements, measurements);
}
