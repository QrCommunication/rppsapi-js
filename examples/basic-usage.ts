/**
 * Exemple d'utilisation du SDK RPPS
 * Usage : npx tsx examples/basic-usage.ts [RPPS_NUMBER]
 */
import { RppsClient } from '../src/index.js';

const rpps = process.argv[2] ?? '10000001866';

async function main() {
  const client = new RppsClient({
    timeout: 60_000,
    fhirApiKey: process.env.FHIR_API_KEY,
  });

  console.log(`\nRecherche RPPS : ${rpps}\n${'─'.repeat(50)}`);

  const profile = await client.getByRpps(rpps);

  console.log(`\nIdentité :`);
  console.log(`  ${profile.identite.civiliteExercice.libelle} ${profile.identite.prenomExercice} ${profile.identite.nomExercice}`);
  console.log(`  RPPS : ${profile.rpps}`);
  console.log(`  ID nationale : ${profile.identificationNationale}`);

  console.log(`\nProfession :`);
  console.log(`  ${profile.profession.libelle} (${profile.profession.code})`);
  console.log(`  Catégorie : ${profile.profession.categorie.libelle}`);

  console.log(`\nActivités (${profile.activites.length}) :`);
  for (const activite of profile.activites) {
    console.log(`  - ${activite.structure.raisonSociale || '(sans nom)'}`);
    console.log(`    Mode : ${activite.modeExercice.libelle || 'N/A'}`);
    console.log(`    Rôle : ${activite.role.libelle || 'N/A'}`);
    console.log(`    Adresse : ${activite.structure.adresse.libelleVoie}, ${activite.structure.adresse.codePostal} ${activite.structure.adresse.libelleCommune}`);
  }

  console.log(`\nDiplômes & Autorisations (${profile.diplomesEtAutorisations.length}) :`);
  for (const da of profile.diplomesEtAutorisations) {
    if (da.diplome) {
      console.log(`  - [Diplôme] ${da.diplome.diplome.libelle} (${da.diplome.typeDiplome.libelle})`);
    }
    if (da.autorisation) {
      console.log(`  - [Autorisation] ${da.autorisation.disciplineAutorisation.libelle} (${da.autorisation.typeAutorisation.libelle})`);
    }
  }

  console.log(`\nSavoir-faire (${profile.savoirFaire.length}) :`);
  for (const sf of profile.savoirFaire) {
    console.log(`  - ${sf.savoirFaire.libelle} (${sf.typeSavoirFaire.libelle})`);
  }

  console.log(`\nCartes CPS/CPF (${profile.cartesCps.length}) :`);
  for (const carte of profile.cartesCps) {
    console.log(`  - ${carte.typeCarte.libelle} n°${carte.numeroCarte}`);
    console.log(`    Validité : ${carte.dateDebutValidite} → ${carte.dateFinValidite}`);
  }

  console.log(`\nMessageries MSSanté (${profile.messageriesMssante.length}) :`);
  for (const bal of profile.messageriesMssante) {
    console.log(`  - ${bal.adresseBal} (${bal.typeBal})`);
  }

  console.log(`\nFHIR :`);
  if (profile.fhir.practitioner) {
    console.log(`  Practitioner trouvé : id=${profile.fhir.practitioner.id}`);
    console.log(`  PractitionerRoles : ${profile.fhir.practitionerRoles.length}`);
  } else {
    console.log(`  Practitioner non trouvé via FHIR`);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Métadonnées :`);
  console.log(`  Interrogé le : ${profile.metadata.queriedAt}`);
  console.log(`  Durée totale : ${profile.metadata.totalDurationMs}ms`);
  console.log(`  Sources :`);
  for (const s of profile.metadata.sources) {
    const status = s.success ? `OK (${s.rowCount} rows, ${s.durationMs}ms)` : `ERREUR: ${s.error}`;
    console.log(`    ${s.source}: ${status}`);
  }
}

main().catch(console.error);
