import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitForPublicVersion } from '../scripts/wait-for-public-version.mjs';

test('an already validated public version returns immediately without sleeping', async () => {
  const version = { name: '@qrcommunication/rppsapi', validated: true };
  let inspections = 0;
  const sleeps = [];
  const result = await waitForPublicVersion(() => {
    inspections += 1;
    return version;
  }, {
    now: () => 0,
    sleep: async ms => { sleeps.push(ms); throw new Error('Unexpected sleep'); },
  });
  assert.equal(result, version);
  assert.equal(inspections, 1);
  assert.deepEqual(sleeps, []);
});

test('a version becoming visible after 217 seconds succeeds on the 220-second poll', async () => {
  let time = 0;
  const inspectionTimes = [];
  const sleeps = [];
  const version = { validated: true };
  const result = await waitForPublicVersion(() => {
    inspectionTimes.push(time);
    return time >= 217_000 ? version : null;
  }, {
    now: () => time,
    sleep: async ms => { sleeps.push(ms); time += ms; },
  });
  assert.equal(result, version);
  assert.equal(time, 220_000);
  assert.equal(inspectionTimes.length, 23);
  assert.equal(inspectionTimes.at(-1), 220_000);
  assert.equal(sleeps.length, 22);
  assert.ok(sleeps.every(ms => ms === 10_000));
});

test('persistent absence stops at the deadline and inspection time consumes its budget', async () => {
  let time = 0;
  const inspectionTimes = [];
  const sleeps = [];
  await assert.rejects(waitForPublicVersion(() => {
    inspectionTimes.push(time);
    return null;
  }, {
    now: () => time,
    sleep: async ms => { sleeps.push(ms); time += ms; },
  }), error => {
    assert.equal(error.code, 'EPUBLICVERSIONTIMEOUT');
    assert.equal(error.attempts, 36);
    assert.equal(error.elapsedMs, 360_000);
    return true;
  });
  assert.equal(time, 360_000);
  assert.equal(inspectionTimes.length, 36);
  assert.ok(inspectionTimes.every(instant => instant < 360_000));
  assert.equal(sleeps.length, 36);
  assert.equal(sleeps.reduce((sum, ms) => sum + ms, 0), 360_000);

  let slowerTime = 0;
  let slowerInspections = 0;
  const shorterSleeps = [];
  await assert.rejects(waitForPublicVersion(() => {
    slowerInspections += 1;
    slowerTime += 3_000;
    return null;
  }, {
    timeoutMs: 25_000,
    intervalMs: 10_000,
    now: () => slowerTime,
    sleep: async ms => { shorterSleeps.push(ms); slowerTime += ms; },
  }), error => error.code === 'EPUBLICVERSIONTIMEOUT' && error.elapsedMs === 25_000);
  assert.equal(slowerInspections, 2);
  assert.equal(slowerTime, 25_000);
  assert.deepEqual(shorterSleeps, [10_000, 9_000]);
});

test('inspection errors propagate by identity and only null can trigger a retry', async () => {
  for (const message of ['HTTP 401', 'HTTP 403', 'HTTP 500', 'Network failure', 'SRI mismatch', 'Provenance mismatch']) {
    const failure = new Error(message);
    let inspections = 0;
    const sleeps = [];
    await assert.rejects(waitForPublicVersion(() => {
      inspections += 1;
      throw failure;
    }, {
      now: () => 0,
      sleep: async ms => { sleeps.push(ms); throw new Error('Unexpected retry sleep'); },
    }), error => error === failure);
    assert.equal(inspections, 1);
    assert.deepEqual(sleeps, []);
  }
  for (const result of [false, undefined]) {
    let inspections = 0;
    const sleeps = [];
    await assert.rejects(waitForPublicVersion(() => {
      inspections += 1;
      return result;
    }, {
      now: () => 0,
      sleep: async ms => { sleeps.push(ms); throw new Error('Unexpected retry sleep'); },
    }), TypeError);
    assert.equal(inspections, 1);
    assert.deepEqual(sleeps, []);
  }
});
