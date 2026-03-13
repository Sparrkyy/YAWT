let counter = 0;
let listener = null;
let minEndTime = 0;
let pendingTimer = null;

const MIN_DISPLAY_MS = 250;

export function startLoading() {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (counter === 0) {
    minEndTime = Date.now() + MIN_DISPLAY_MS;
    listener?.(true);
  }
  counter++;
}

export function stopLoading() {
  counter = Math.max(0, counter - 1);
  if (counter === 0) {
    const remaining = minEndTime - Date.now();
    if (remaining > 0) {
      pendingTimer = setTimeout(() => {
        pendingTimer = null;
        if (counter === 0) listener?.(false);
      }, remaining);
    } else {
      listener?.(false);
    }
  }
}

export function setLoadingListener(fn) {
  listener = fn;
}
