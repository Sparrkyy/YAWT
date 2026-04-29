import { describe, it, expect, beforeEach } from 'vitest';
import {
  isOfflineEnabled,
  setOfflineEnabled,
  saveOfflineCache,
  loadCachedExercises,
  loadCachedUsers,
  hasOfflineCache,
  findCachedUserSub,
  getPendingQueue,
  enqueuePendingSet,
  clearPendingQueue,
  pendingCount,
} from '../data/offlineStorage';

const EXERCISES = [
  { id: 'ex-1', name: 'Bench Press', muscles: {}, archived: false },
  { id: 'ex-2', name: 'Squat', muscles: {}, archived: false },
];
const USERS = ['Ethan', 'Ava'];

beforeEach(() => {
  localStorage.clear();
});

describe('isOfflineEnabled / setOfflineEnabled', () => {
  it('returns false when no key is set', () => {
    expect(isOfflineEnabled('sub1')).toBe(false);
  });

  it('returns true after setOfflineEnabled(true)', () => {
    setOfflineEnabled('sub1', true);
    expect(isOfflineEnabled('sub1')).toBe(true);
  });

  it('returns false after setOfflineEnabled(false)', () => {
    setOfflineEnabled('sub1', true);
    setOfflineEnabled('sub1', false);
    expect(isOfflineEnabled('sub1')).toBe(false);
  });

  it('isolates subs — enabling for sub1 does not affect sub2', () => {
    setOfflineEnabled('sub1', true);
    expect(isOfflineEnabled('sub2')).toBe(false);
  });
});

describe('saveOfflineCache / loadCachedExercises / loadCachedUsers', () => {
  it('roundtrips exercises', () => {
    saveOfflineCache('sub1', EXERCISES, USERS);
    expect(loadCachedExercises('sub1')).toEqual(EXERCISES);
  });

  it('roundtrips users', () => {
    saveOfflineCache('sub1', EXERCISES, USERS);
    expect(loadCachedUsers('sub1')).toEqual(USERS);
  });

  it('returns null for unknown sub (exercises)', () => {
    expect(loadCachedExercises('unknown')).toBeNull();
  });

  it('returns null for unknown sub (users)', () => {
    expect(loadCachedUsers('unknown')).toBeNull();
  });

  it('different subs are isolated', () => {
    saveOfflineCache('sub1', EXERCISES, USERS);
    expect(loadCachedExercises('sub2')).toBeNull();
  });
});

describe('hasOfflineCache', () => {
  it('returns false when localStorage is empty', () => {
    expect(hasOfflineCache()).toBe(false);
  });

  it('returns true after saveOfflineCache', () => {
    saveOfflineCache('sub1', EXERCISES, USERS);
    expect(hasOfflineCache()).toBe(true);
  });

  it('returns false after manually deleting the exercise key', () => {
    saveOfflineCache('sub1', EXERCISES, USERS);
    localStorage.removeItem('yawt_offline_exercises_sub1');
    expect(hasOfflineCache()).toBe(false);
  });
});

describe('findCachedUserSub', () => {
  it('returns null when no cache exists', () => {
    expect(findCachedUserSub()).toBeNull();
  });

  it('returns the userSub string after saveOfflineCache', () => {
    saveOfflineCache('sub1', EXERCISES, USERS);
    expect(findCachedUserSub()).toBe('sub1');
  });
});

describe('getPendingQueue / enqueuePendingSet / clearPendingQueue / pendingCount', () => {
  const SET_A = { exercise: 'Bench Press', weight: 135, reps: 8, user: 'Ethan' };
  const SET_B = { exercise: 'Squat', weight: 225, reps: 5, user: 'Ava' };

  it('getPendingQueue returns [] when no key exists', () => {
    expect(getPendingQueue()).toEqual([]);
  });

  it('enqueuePendingSet appends one set', () => {
    enqueuePendingSet(SET_A);
    expect(getPendingQueue()).toEqual([SET_A]);
  });

  it('enqueuePendingSet appends multiple sets in order', () => {
    enqueuePendingSet(SET_A);
    enqueuePendingSet(SET_B);
    expect(getPendingQueue()).toEqual([SET_A, SET_B]);
  });

  it('clearPendingQueue empties the queue', () => {
    enqueuePendingSet(SET_A);
    clearPendingQueue();
    expect(getPendingQueue()).toEqual([]);
  });

  it('pendingCount returns 0 when empty', () => {
    expect(pendingCount()).toBe(0);
  });

  it('pendingCount returns correct count after enqueue', () => {
    enqueuePendingSet(SET_A);
    enqueuePendingSet(SET_B);
    expect(pendingCount()).toBe(2);
  });

  it('getPendingQueue returns [] after clearPendingQueue', () => {
    enqueuePendingSet(SET_A);
    clearPendingQueue();
    expect(getPendingQueue()).toEqual([]);
  });
});
