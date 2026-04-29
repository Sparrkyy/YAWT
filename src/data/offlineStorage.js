const EXERCISES_PREFIX = 'yawt_offline_exercises_';
const USERS_PREFIX = 'yawt_offline_users_';
const ENABLED_PREFIX = 'yawt_offline_enabled_';
const PENDING_KEY = 'yawt_offline_pending';

function exerciseKey(userSub) {
  return `${EXERCISES_PREFIX}${userSub}`;
}

function usersKey(userSub) {
  return `${USERS_PREFIX}${userSub}`;
}

function enabledKey(userSub) {
  return `${ENABLED_PREFIX}${userSub}`;
}

function isExerciseCacheKey(key) {
  return key.startsWith(EXERCISES_PREFIX);
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function isOfflineEnabled(userSub) {
  return localStorage.getItem(enabledKey(userSub)) === 'true';
}

export function setOfflineEnabled(userSub, enabled) {
  if (enabled) {
    localStorage.setItem(enabledKey(userSub), 'true');
  } else {
    localStorage.removeItem(enabledKey(userSub));
  }
}

export function saveOfflineCache(userSub, exercises, users) {
  localStorage.setItem(exerciseKey(userSub), JSON.stringify(exercises));
  localStorage.setItem(usersKey(userSub), JSON.stringify(users));
}

export function loadCachedExercises(userSub) {
  try {
    return JSON.parse(localStorage.getItem(exerciseKey(userSub)));
  } catch {
    return null;
  }
}

export function loadCachedUsers(userSub) {
  try {
    return JSON.parse(localStorage.getItem(usersKey(userSub)));
  } catch {
    return null;
  }
}

export function hasOfflineCache() {
  return Object.keys(localStorage).some(isExerciseCacheKey);
}

export function findCachedUserSub() {
  const key = Object.keys(localStorage).find(isExerciseCacheKey);
  return key ? key.replace(EXERCISES_PREFIX, '') : null;
}

export function getPendingQueue() {
  return readQueue();
}

export function enqueuePendingSet(set) {
  localStorage.setItem(PENDING_KEY, JSON.stringify([...readQueue(), set]));
}

export function clearPendingQueue() {
  localStorage.removeItem(PENDING_KEY);
}

export function pendingCount() {
  return readQueue().length;
}
