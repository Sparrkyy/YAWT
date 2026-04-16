// Routes API calls to mock or real backend depending on DEV_MODE.
// DEV_MODE is active when the URL contains ?dev or VITE_DEV_MODE=true.

import * as realApi from './sheetsApi';
import * as mockApi from './mockApi';

export const DEV_MODE =
  new URLSearchParams(window.location.search).has('dev') ||
  import.meta.env.VITE_DEV_MODE === 'true';

const api = DEV_MODE ? mockApi : realApi;

export const {
  setSheetId,
  setApiErrorHandler,
  createNewSheet,
  validateSheet,
  migrateToGuids,
  getSets,
  addSet,
  deleteSet,
  getExercises,
  addExercise,
  updateExercise,
  renameExercise,
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
} = api;
