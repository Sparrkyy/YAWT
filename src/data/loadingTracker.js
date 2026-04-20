let counter = 0;
let listener = null;
let minEndTime = 0;
let pendingTimer = null;

const MIN_DISPLAY_MS = 250;

function clearPendingTimer() {
  if (!pendingTimer) return;
  clearTimeout(pendingTimer);
  pendingTimer = null;
}

function maybeStartTimer() {
  if (counter === 0) {
    minEndTime = Date.now() + MIN_DISPLAY_MS;
    listener?.(true);
  }
}

export function startLoading() {
  clearPendingTimer();
  maybeStartTimer();
  counter++;
}

function fireStop() {
  if (counter === 0) listener?.(false);
}

function scheduleStop() {
  const remaining = minEndTime - Date.now();
  if (remaining > 0) {
    pendingTimer = setTimeout(() => { pendingTimer = null; fireStop(); }, remaining);
  } else {
    fireStop();
  }
}

export function stopLoading() {
  counter = Math.max(0, counter - 1);
  if (counter === 0) scheduleStop();
}

export function setLoadingListener(fn) {
  listener = fn;
}
