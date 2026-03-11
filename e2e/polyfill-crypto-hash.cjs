// Polyfill crypto.hash for Node.js < 20.12.0
// Vite 7 (used by @vitest/browser) requires crypto.hash
const crypto = require('node:crypto');
if (typeof crypto.hash !== 'function') {
  crypto.hash = (algorithm, data, outputEncoding) => {
    return crypto.createHash(algorithm).update(data).digest(outputEncoding);
  };
}
