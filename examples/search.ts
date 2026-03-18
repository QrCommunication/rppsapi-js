/**
 * Exemple de recherche par nom/prénom/code postal
 * Usage : npx tsx examples/search.ts
 */
import { RppsClient } from '../src/index.js';

const client = new RppsClient();

async function main() {
  // 1. Recherche par nom + code postal
  console.log('─── Recherche : nom=SIGNOL, codePostal=87025 ───');
  const r1 = await client.search({ nom: 'SIGNOL', codePostal: '87025' });
  printResults(r1);

  // 2. Recherche par nom seul (partiel)
  console.log('─── Recherche : nom=DUPO ───');
  const r2 = await client.search({ nom: 'DUPO', codePostal: '75' }, { pageSize: 10 });
  printResults(r2);

  // 3. Recherche par prénom + code postal
  console.log('─── Recherche : prenom=Nicolas, codePostal=87 ───');
  const r3 = await client.search({ prenom: 'Nicolas', codePostal: '87' }, { pageSize: 10 });
  printResults(r3);

  // 4. Enchaîner recherche → profil complet
  if (r1.results.length > 0) {
    const rpps = r1.results[0].rpps;
    console.log(`─── Profil complet pour RPPS ${rpps} ───`);
    const profil = await client.getByRpps(rpps);
    console.log(`  ${profil.identite.civiliteExercice.libelle} ${profil.identite.prenomExercice} ${profil.identite.nomExercice}`);
    console.log(`  Diplômes: ${profil.diplomesEtAutorisations.length} | Activités: ${profil.activites.length}`);
  }
}

function printResults(res: Awaited<ReturnType<typeof client.search>>) {
  console.log(`  Total: ${res.total} | Affichés: ${res.results.length} | ${res.durationMs}ms\n`);
  for (const r of res.results) {
    const lieu = [r.structure.codePostal, r.structure.libelleCommune].filter(Boolean).join(' ');
    console.log(`  ${r.civilite} ${r.prenomExercice} ${r.nomExercice} — ${r.profession.libelle}`);
    console.log(`    RPPS: ${r.rpps} | ${r.structure.raisonSociale || '(pas de structure)'} — ${lieu}`);
  }
  console.log();
}

main().catch(console.error);
