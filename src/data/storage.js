const SETS_KEY = 'workout_sets';
const EXERCISES_KEY = 'workout_exercises';

import { EXERCISES } from './exercises';
import { ensureCsvImported } from './importCsv';

function generateId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export async function getSets() {
  ensureCsvImported(); // no-op after first run
  const raw = localStorage.getItem(SETS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSets(sets) {
  localStorage.setItem(SETS_KEY, JSON.stringify(sets));
}

export async function addSet(set) {
  const sets = await getSets();
  const newSet = { ...set, id: generateId() };
  await saveSets([...sets, newSet]);
  return newSet;
}

export async function deleteSet(id) {
  const sets = (await getSets()).filter(s => s.id !== id);
  await saveSets(sets);
}

export async function getExercises() {
  const raw = localStorage.getItem(EXERCISES_KEY);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(EXERCISES));
  return EXERCISES;
}

export async function saveExercises(exercises) {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

export async function addExercise(exercise) {
  const exercises = await getExercises();
  await saveExercises([...exercises, exercise]);
}

export async function updateExercise(name, updatedExercise) {
  const exercises = await getExercises();
  const next = exercises.map(ex => ex.name === name ? { ...ex, ...updatedExercise } : ex);
  await saveExercises(next);
}
