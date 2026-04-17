// Mock data in the row format Google Sheets API returns
// Matches the schema: Sets!A:I and Exercises!A:D

export const MOCK_EXERCISES_ROWS = [
  ['id', 'name', 'muscles', 'archived'], // header
  ['ex-1', 'Bench Press', JSON.stringify({ chest: 1, triceps: 0.5, frontDelts: 0.25 }), ''],
  ['ex-2', 'Squat', JSON.stringify({ quads: 1, glutes: 0.75, hamstrings: 0.5 }), ''],
  ['ex-3', 'Deadlift', JSON.stringify({ back: 1, hamstrings: 0.75, glutes: 0.5, lowBack: 0.5 }), ''],
  ['ex-4', 'Overhead Press', JSON.stringify({ frontDelts: 1, sideDelts: 0.5, triceps: 0.5 }), ''],
  ['ex-5', 'Barbell Row', JSON.stringify({ back: 1, biceps: 0.5, rearDelts: 0.5 }), ''],
  ['ex-6', 'Pull Up', JSON.stringify({ back: 1, biceps: 0.75 }), ''],
  ['ex-7', 'Archived Exercise', JSON.stringify({ chest: 1 }), 'true'],
];

const TODAY = new Date().toLocaleDateString('en-CA');
const YESTERDAY = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

export const MOCK_SETS_ROWS = [
  ['id', 'date', 'user', 'exercise', 'exercise_id', 'reps', 'weight', 'notes', 'createdAt'], // header
  ['set-1', TODAY, 'Ethan', 'Bench Press', 'ex-1', '8', '185', 'keep elbows tucked', `${TODAY}T10:00:00.000Z`],
  ['set-2', TODAY, 'Ethan', 'Squat', 'ex-2', '5', '275', 'felt good', `${TODAY}T10:05:00.000Z`],
  ['set-3', TODAY, 'Ava', 'Bench Press', 'ex-1', '10', '95', '', `${TODAY}T10:10:00.000Z`],
  ['set-4', YESTERDAY, 'Ethan', 'Deadlift', 'ex-3', '5', '315', '', `${YESTERDAY}T09:00:00.000Z`],
  ['set-5', YESTERDAY, 'Ethan', 'Bench Press', 'ex-1', '6', '195', 'shoulder felt tight', `${YESTERDAY}T09:05:00.000Z`],
  ['set-6', YESTERDAY, 'Ava', 'Squat', 'ex-2', '8', '135', '', `${YESTERDAY}T09:10:00.000Z`],
];

export const MOCK_PLANS_ROWS = [
  ['id', 'name', 'exerciseIds'], // header
  ['plan-1', 'Push Day', JSON.stringify(['ex-1', 'ex-4'])],
  ['plan-2', 'Pull Day', JSON.stringify(['ex-3', 'ex-5', 'ex-6'])],
  ['plan-3', 'Leg Day', JSON.stringify(['ex-2'])],
];

const LAST_WEEK = new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-CA');

export const MOCK_MEASUREMENTS_ROWS = [
  ['id', 'date', 'user', 'type', 'value', 'unit', 'notes', 'createdAt'], // header
  ['meas-1', TODAY, 'Ethan', 'weight', '185', 'lbs', '', `${TODAY}T08:00:00.000Z`],
  ['meas-2', TODAY, 'Ethan', 'waist',  '32',  'in',  '', `${TODAY}T08:01:00.000Z`],
  ['meas-3', TODAY, 'Ava',   'weight', '130', 'lbs', '', `${TODAY}T08:10:00.000Z`],
  ['meas-4', LAST_WEEK, 'Ethan', 'weight', '186', 'lbs', '', `${LAST_WEEK}T08:00:00.000Z`],
  ['meas-5', LAST_WEEK, 'Ava',   'weight', '131', 'lbs', '', `${LAST_WEEK}T08:10:00.000Z`],
];
