import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

const DEFAULT_TIMEOUT_MS = 6 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 10 * 1000;
const MAX_TIMER_DELAY_MS = 2 ** 31 - 1;
const OPTION_NAMES = new Set(['timeoutMs', 'intervalMs', 'now', 'sleep']);

/**
 * Wait for a validated public version. Only null means it is not visible yet.
 * The deadline bounds polling; it cannot interrupt an inspection already running.
 * Network, integrity and provenance errors must be thrown by inspect unchanged.
 */
export async function waitForPublicVersion(inspect, options = {}) {
  if (typeof inspect !== 'function') {
    throw new TypeError('inspect must be a function');
  }
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object');
  }
  for (const name of Object.keys(options)) {
    if (!OPTION_NAMES.has(name)) throw new TypeError(`Unknown wait option: ${name}`);
  }
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    intervalMs = DEFAULT_INTERVAL_MS,
    now = () => performance.now(),
    sleep = delay,
  } = options;
  for (const [name, value] of [['timeoutMs', timeoutMs], ['intervalMs', intervalMs]]) {
    if (!Number.isSafeInteger(value) || value <= 0 || value > MAX_TIMER_DELAY_MS) {
      throw new RangeError(`${name} must be a positive integer within the timer range`);
    }
  }
  if (typeof now !== 'function' || typeof sleep !== 'function') {
    throw new TypeError('now and sleep must be functions');
  }

  let previousTime;
  const readTime = () => {
    const value = now();
    if (!Number.isFinite(value)) throw new RangeError('Clock must return finite milliseconds');
    if (previousTime !== undefined && value < previousTime) {
      throw new RangeError('Clock must be monotonic');
    }
    previousTime = value;
    return value;
  };
  const startedAt = readTime();
  const deadline = startedAt + timeoutMs;
  if (!Number.isFinite(deadline) || deadline <= startedAt) {
    throw new RangeError('Clock cannot represent the requested deadline');
  }
  let attempts = 0;
  const timeout = time => Object.assign(
    new Error('Public version did not become visible before the polling deadline'),
    { code: 'EPUBLICVERSIONTIMEOUT', attempts, elapsedMs: time - startedAt },
  );

  for (;;) {
    const beforeInspection = readTime();
    if (beforeInspection >= deadline) throw timeout(beforeInspection);
    attempts += 1;
    const result = await inspect();
    if (result !== null) {
      if (typeof result !== 'object' || Array.isArray(result)) {
        throw new TypeError('inspect must return a validated object or null');
      }
      return result;
    }
    const afterInspection = readTime();
    const remainingMs = deadline - afterInspection;
    if (remainingMs <= 0) throw timeout(afterInspection);
    await sleep(Math.min(intervalMs, remainingMs));
  }
}
