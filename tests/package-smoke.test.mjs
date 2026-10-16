/**
 * Packaging checks only: no practitioner lookup or other business API call.
 * Build dist first, then run node --test tests/package-smoke.test.mjs.
 * RPPS_SMOKE_TARBALL accepts an already built archive for consumer matrices.
 * RPPS_SMOKE_RUNTIME_ONLY=1 explicitly omits the separate compiler check.
 * RPPS_SMOKE_TYPESCRIPT can select the build job's external tsc JS entry.
 */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { access, lstat, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runtimeOnly = process.env.RPPS_SMOKE_RUNTIME_ONLY === '1';
const publicName = '@qrcommunication/rppsapi';
const runtimeExports = [
  'RppsClient', 'fetchFhirByRpps', 'fetchPersonneActivite', 'searchPersonneActivite',
  'fetchDiplomes', 'fetchSavoirFaire', 'fetchCartesCps', 'fetchMssante', 'validateRpps',
];
const publicTypes = [
  'RppsFullProfile', 'RppsClientOptions', 'Identite', 'Profession', 'Activite',
  'Structure', 'AdresseStructure', 'Diplome', 'Autorisation', 'DiplomeEtAutorisation',
  'SavoirFaire', 'CarteCps', 'MessagerieMssante', 'CodeLabel', 'SourceName',
  'SourceStatus', 'RppsSearchCriteria', 'RppsSearchResult', 'RppsSearchResponse',
  'FhirData', 'FhirPractitioner', 'FhirPractitionerRole', 'FhirBundle',
  'FhirIdentifier', 'FhirHumanName', 'FhirQualification',
];
let workspace;
let consumer;
let installed;
let expected;
let environment;

function run(command, args, cwd = consumer) {
  const result = spawnSync(command, args, {
    cwd, env: environment, encoding: 'utf8', timeout: 90_000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(result.error, undefined, `${command} did not finish: ${result.error?.message}`);
  assert.equal(result.status, 0, `${command} failed (${result.status}):\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

async function exists(path) {
  try { await access(path); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

function packedArchive(result) {
  let record;
  if (Array.isArray(result)) {
    // npm 11 and the native npm supplied with older consumer runtimes.
    assert.equal(result.length, 1, 'Expected one real npm archive');
    [record] = result;
  } else {
    // npm 12 keys the single package record by its public name.
    assert.ok(result !== null && typeof result === 'object', 'Expected npm pack array or package map');
    assert.deepEqual(Object.keys(result), [publicName], 'Expected exactly the public package map entry');
    record = result[publicName];
  }
  assert.ok(record !== null && typeof record === 'object' && !Array.isArray(record), 'Expected a package record');
  assert.equal(record.id, `${publicName}@${expected.version}`);
  assert.equal(record.name, publicName);
  assert.equal(record.version, expected.version);
  assert.equal(record.filename, `${publicName.replace('@', '').replace('/', '-')}-${expected.version}.tgz`);
  return record;
}

before(async () => {
  expected = JSON.parse(await readFile(join(repository, 'package.json'), 'utf8'));
  assert.equal(expected.name, publicName);
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    assert.deepEqual(Object.keys(expected[field] ?? {}), [], `Revisit offline consumer setup for ${field}`);
  }
  workspace = await mkdtemp(join(tmpdir(), 'rppsapi-package-smoke-'));
  const { mkdir } = await import('node:fs/promises');
  consumer = join(workspace, 'consumer');
  await mkdir(consumer);
  await writeFile(join(workspace, 'user.npmrc'), '');
  await writeFile(join(workspace, 'global.npmrc'), '');
  environment = {
    PATH: dirname(process.execPath) + delimiter + (process.env.PATH ?? ''),
    LANG: 'C.UTF-8',
    npm_config_userconfig: join(workspace, 'user.npmrc'),
    npm_config_globalconfig: join(workspace, 'global.npmrc'),
    npm_config_cache: join(workspace, 'npm-cache'),
    npm_config_offline: 'true',
    npm_config_ignore_scripts: 'true',
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false',
  };
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  let archive;
  if (process.env.RPPS_SMOKE_TARBALL) {
    archive = resolve(process.env.RPPS_SMOKE_TARBALL);
    const info = await lstat(archive);
    assert.ok(info.isFile() && !info.isSymbolicLink(), 'Archive must be a regular file');
  } else {
    const packed = packedArchive(JSON.parse(run(npm, [
      'pack', '--ignore-scripts', '--offline', '--json', '--pack-destination', workspace,
    ], repository)));
    archive = join(workspace, packed.filename);
  }
  await writeFile(join(consumer, 'package.json'), JSON.stringify({
    name: 'rppsapi-independent-consumer', private: true, type: 'module',
  }));
  run(npm, [
    'install', '--ignore-scripts', '--offline', '--omit=dev', '--no-audit', '--no-fund',
    '--package-lock=false', archive,
  ]);
  installed = join(consumer, 'node_modules', '@qrcommunication', 'rppsapi');
}, { timeout: 120_000 });

after(async () => {
  if (workspace) await rm(workspace, { recursive: true, force: true });
});

test('real archive preserves its ESM and declaration entry points without dev dependencies', async () => {
  const manifest = JSON.parse(await readFile(join(installed, 'package.json'), 'utf8'));
  assert.equal(manifest.name, publicName);
  assert.equal(manifest.version, expected.version);
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.main, 'dist/index.js');
  assert.equal(manifest.types, 'dist/index.d.ts');
  assert.deepEqual(manifest.exports['.'], { types: './dist/index.d.ts', import: './dist/index.js' });
  for (const path of ['dist/index.js', 'dist/index.d.ts']) {
    const info = await lstat(join(installed, path));
    assert.ok(info.isFile() && !info.isSymbolicLink() && info.size > 0, `Missing real packaged ${path}`);
  }
  const top = (await readdir(join(consumer, 'node_modules'))).filter(name => !name.startsWith('.'));
  assert.deepEqual(top, ['@qrcommunication']);
  assert.deepEqual(await readdir(join(consumer, 'node_modules', '@qrcommunication')), ['rppsapi']);
  for (const name of Object.keys(expected.devDependencies ?? {})) {
    assert.equal(await exists(join(consumer, 'node_modules', name)), false, `Consumer installed dev dependency ${name}`);
  }
});

test('archive imports from a fresh consumer cwd on the selected Node runtime without API calls', () => {
  const program = `
    import assert from 'node:assert/strict';
    let requests = 0;
    globalThis.fetch = () => { requests++; throw new Error('Business API calls are forbidden in package smoke'); };
    const sdk = await import(${JSON.stringify(publicName)});
    for (const name of ${JSON.stringify(runtimeExports)}) {
      assert.equal(typeof sdk[name], 'function', 'Missing runnable public export ' + name);
    }
    assert.equal(requests, 0);
    console.log(JSON.stringify({ node: process.version, exports: Object.keys(sdk).sort(), requests }));
  `;
  const observation = JSON.parse(run(process.execPath, ['--input-type=module', '--eval', program]));
  assert.equal(observation.node, process.version);
  assert.equal(observation.requests, 0);
});

test('a strict independent TypeScript consumer resolves the archive declarations', {
  skip: runtimeOnly ? 'Explicit runtime-only matrix: declarations are compiled in the build job' : false,
}, async () => {
  const compiler = process.env.RPPS_SMOKE_TYPESCRIPT
    ? resolve(process.env.RPPS_SMOKE_TYPESCRIPT)
    : join(repository, 'node_modules', 'typescript', 'bin', 'tsc');
  assert.equal(await exists(compiler), true, 'Build job must provide TypeScript; use explicit runtime-only mode for consumer jobs');
  const fixture = [
    `import { ${runtimeExports.join(', ')} } from '${publicName}';`,
    `import type { ${publicTypes.join(', ')} } from '${publicName}';`,
    `export type PublicContracts = [${publicTypes.join(', ')}];`,
    `export const publicFunctions = [${runtimeExports.join(', ')}];`,
  ].join('\n') + '\n';
  await writeFile(join(consumer, 'consumer.ts'), fixture);
  await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
      lib: ['ES2022', 'DOM'], types: [], strict: true, skipLibCheck: false, noEmit: true,
    },
    files: ['consumer.ts'],
  }));
  run(process.execPath, [compiler, '--project', join(consumer, 'tsconfig.json')]);
});
