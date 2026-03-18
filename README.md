# @qrcommunication/rppsapi

[![npm version](https://img.shields.io/npm/v/@qrcommunication/rppsapi.svg)](https://www.npmjs.com/package/@qrcommunication/rppsapi)
[![license](https://img.shields.io/npm/l/@qrcommunication/rppsapi.svg)](https://github.com/QrCommunication/rppsapi-js/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@qrcommunication/rppsapi.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@qrcommunication/rppsapi)](https://bundlephobia.com/package/@qrcommunication/rppsapi)

SDK TypeScript pour interroger l'ensemble des sources de donnees RPPS (Repertoire Partage des Professionnels de Sante) de l'Annuaire Sante, publiees par l'ANS (Agence du Numerique en Sante) et data.gouv.fr.

En un seul appel, le SDK recupere et fusionne les donnees de **6 sources publiques** pour constituer le profil complet d'un professionnel de sante : identite, activites, diplomes, savoir-faire, cartes CPS et messageries MSSante.

---

## Table des matieres

- [Fonctionnalites](#fonctionnalites)
- [Sources de donnees](#sources-de-donnees)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [RppsClient](#rppsclientoptions)
  - [getByRpps](#clientgetbyrppsrpps)
  - [search](#clientsearchcriteria-options)
  - [Sources individuelles](#sources-individuelles)
  - [validateRpps](#validaterppsrpps)
- [Types](#types)
- [Exemples avances](#exemples-avances)
- [Configuration FHIR](#configuration-fhir)
- [Donnees retournees](#donnees-retournees)
- [Performance](#performance)
- [Compatibilite](#compatibilite)
- [Licence](#licence)
- [Contribuer](#contribuer)
- [Changelog](#changelog)

---

## Fonctionnalites

- **Profil complet en un appel** : fusionne 6 sources de donnees pour un numero RPPS donne
- **Recherche multicritere** : recherche par nom, prenom et/ou code postal avec pagination
- **Requetes paralleles** : toutes les sources sont interrogees simultanement via `Promise.all`
- **Zero dependance** : utilise uniquement `fetch` natif (Node 18+)
- **TypeScript natif** : types complets pour l'autocompletion et la surete de type
- **Gestion d'erreurs resiliente** : chaque source est isolee, un echec ne bloque pas les autres
- **Metadonnees detaillees** : statut, nombre de resultats et duree de chaque source
- **Sources desactivables** : possibilite de desactiver individuellement chaque source
- **FHIR optionnel** : la source FHIR est automatiquement desactivee sans cle API
- **ESM natif** : module ES moderne, compatible avec les bundlers actuels

---

## Sources de donnees

Le SDK interroge 6 sources publiques distinctes :

| Source | API | Description | Donnees |
|--------|-----|-------------|---------|
| **Personne-Activite** | Tabular API data.gouv.fr | Fichier principal de l'Annuaire Sante | Identite, profession, structures d'exercice, adresses |
| **Diplomes & Autorisations** | Tabular API data.gouv.fr | Diplomes obtenus et autorisations d'exercice | Type de diplome, discipline, autorisations |
| **Savoir-faire** | Tabular API data.gouv.fr | Competences et specialites declarees | Specialites, competences, qualifications |
| **Cartes CPS/CPF** | Tabular API data.gouv.fr | Cartes de professionnel de sante | Numero de carte, type, dates de validite |
| **Messageries MSSante** | Tabular API data.gouv.fr | Boites aux lettres securisees MSSante | Adresses BAL, structures de rattachement |
| **FHIR Annuaire Sante** | API FHIR ANS (Gravitee) | Standard FHIR R4 de l'ANS | Practitioner, PractitionerRole (necessite une cle API) |

Les 5 sources Tabular API sont en acces libre, sans authentification. Seule la source FHIR necessite une cle API Gravitee.

---

## Installation

```bash
# npm
npm install @qrcommunication/rppsapi

# pnpm
pnpm add @qrcommunication/rppsapi

# yarn
yarn add @qrcommunication/rppsapi

# bun
bun add @qrcommunication/rppsapi
```

---

## Quick Start

```typescript
import { RppsClient } from '@qrcommunication/rppsapi';

const client = new RppsClient();

// Recuperer le profil complet d'un praticien
const profil = await client.getByRpps('10000001866');

console.log(profil.identite.nomExercice);       // Nom du praticien
console.log(profil.profession.libelle);          // Ex: "Medecin"
console.log(profil.activites.length);            // Nombre de structures d'exercice
console.log(profil.diplomesEtAutorisations);     // Diplomes et autorisations
console.log(profil.metadata.totalDurationMs);    // Temps total en ms
```

---

## API Reference

### `new RppsClient(options?)`

Cree une instance du client SDK. Tous les parametres sont optionnels.

```typescript
import { RppsClient } from '@qrcommunication/rppsapi';

const client = new RppsClient({
  fhirApiKey: process.env.FHIR_API_KEY,
  timeout: 60_000,
});
```

#### Options de configuration

| Parametre | Type | Defaut | Description |
|-----------|------|--------|-------------|
| `fhirBaseUrl` | `string` | `https://gateway.api.esante.gouv.fr/fhir/v2` | URL de base de l'API FHIR Annuaire Sante |
| `fhirApiKey` | `string` | `''` | Cle API FHIR (header `ESANTE-API-KEY`). Sans cette cle, la source FHIR est automatiquement desactivee |
| `tabularBaseUrl` | `string` | `https://tabular-api.data.gouv.fr/api/resources` | URL de base de l'API Tabular data.gouv.fr |
| `timeout` | `number` | `30000` | Timeout en millisecondes pour chaque requete HTTP |
| `tabularPageSize` | `number` | `100` | Nombre maximum de lignes par requete vers l'API Tabular |
| `disabledSources` | `SourceName[]` | `[]` | Liste des sources a desactiver. Valeurs possibles : `'fhir'`, `'personne-activite'`, `'diplomes'`, `'savoir-faire'`, `'carte-cps'`, `'mssante'` |
| `headers` | `Record<string, string>` | `{}` | Headers HTTP supplementaires appliques a toutes les requetes |

> **Note** : Si `fhirApiKey` n'est pas fournie, la source `'fhir'` est automatiquement ajoutee a `disabledSources`. Il n'est pas necessaire de la desactiver manuellement.

---

### `client.getByRpps(rpps)`

Recupere le profil complet d'un professionnel de sante a partir de son numero RPPS. Interroge toutes les sources activees en parallele et fusionne les resultats.

```typescript
const profil = await client.getByRpps('10000001866');
```

#### Parametres

| Parametre | Type | Description |
|-----------|------|-------------|
| `rpps` | `string` | Numero RPPS du praticien (exactement 11 chiffres) |

#### Retour : `Promise<RppsFullProfile>`

```typescript
interface RppsFullProfile {
  rpps: string;                              // Numero RPPS (11 chiffres)
  identificationNationale: string;           // Identification nationale PP (prefixe + RPPS)
  identite: Identite;                        // Civilite, nom, prenom
  profession: Profession;                    // Profession et categorie professionnelle
  activites: Activite[];                     // Structures d'exercice avec adresses
  diplomesEtAutorisations: DiplomeEtAutorisation[]; // Diplomes et autorisations
  savoirFaire: SavoirFaire[];               // Specialites et competences
  cartesCps: CarteCps[];                    // Cartes CPS/CPF
  messageriesMssante: MessagerieMssante[];  // Boites aux lettres MSSante
  fhir: FhirData;                           // Donnees FHIR brutes
  metadata: {
    sources: SourceStatus[];                // Statut de chaque source
    queriedAt: string;                      // Horodatage ISO 8601
    totalDurationMs: number;                // Duree totale en ms
  };
}
```

#### Erreurs

| Condition | Message |
|-----------|---------|
| RPPS invalide (pas 11 chiffres) | `Numero RPPS invalide : "xxx". Le RPPS doit contenir exactement 11 chiffres.` |

> **Comportement resilient** : si une source echoue (timeout, erreur HTTP), les autres sources retournent leurs resultats normalement. Le champ `metadata.sources` permet d'identifier les sources en echec.

---

### `client.search(criteria, options?)`

Recherche des praticiens par nom, prenom et/ou code postal. La recherche s'effectue sur la source Personne-Activite via l'API Tabular.

```typescript
const resultats = await client.search(
  { nom: 'DUPONT', codePostal: '75' },
  { page: 1, pageSize: 20 },
);
```

#### Parametres

| Parametre | Type | Description |
|-----------|------|-------------|
| `criteria` | `RppsSearchCriteria` | Criteres de recherche (au moins un champ obligatoire) |
| `options.page` | `number` | Numero de page (defaut : `1`) |
| `options.pageSize` | `number` | Nombre de resultats par page (defaut : valeur de `tabularPageSize` du client) |

#### Criteres de recherche

| Champ | Type | Operateur | Description |
|-------|------|-----------|-------------|
| `nom` | `string` | `contains` (insensible a la casse) | Nom d'exercice du praticien (recherche partielle) |
| `prenom` | `string` | `contains` (insensible a la casse) | Prenom d'exercice (recherche partielle) |
| `codePostal` | `string` | `exact` si 5 chiffres, `contains` sinon | Code postal de la structure d'exercice |

> **Important** : Au moins un critere doit etre fourni, sinon une erreur est levee.

#### Retour : `Promise<RppsSearchResponse>`

```typescript
interface RppsSearchResponse {
  results: RppsSearchResult[];  // Resultats dedupliques par RPPS
  total: number;                // Nombre total de resultats cote serveur
  page: number;                 // Page courante
  pageSize: number;             // Taille de page utilisee
  durationMs: number;           // Duree de la requete en ms
  criteria: RppsSearchCriteria; // Criteres utilises
}

interface RppsSearchResult {
  rpps: string;
  identificationNationale: string;
  civilite: string;
  nomExercice: string;
  prenomExercice: string;
  profession: CodeLabel;
  categorieProfessionnelle: CodeLabel;
  modeExercice: CodeLabel;
  savoirFaire: CodeLabel;
  structure: {
    raisonSociale: string;
    codePostal: string;
    libelleCommune: string;
    departement: string;
  };
}
```

> **Deduplication** : Les resultats sont automatiquement dedupliques par numero RPPS. Un praticien exerCant dans plusieurs structures n'apparait qu'une seule fois (premiere occurrence conservee).

#### Erreurs

| Condition | Message |
|-----------|---------|
| Aucun critere fourni | `Au moins un critere de recherche est obligatoire (nom, prenom ou codePostal).` |

---

### Sources individuelles

Pour un usage avance, chaque source est exportee individuellement. Ces fonctions permettent d'interroger une source specifique sans passer par le client.

#### `fetchFhirByRpps(rpps, options?)`

Interroge l'API FHIR Annuaire Sante pour obtenir les ressources `Practitioner` et `PractitionerRole`.

```typescript
import { fetchFhirByRpps } from '@qrcommunication/rppsapi';

const fhir = await fetchFhirByRpps('10000001866', {
  headers: { 'ESANTE-API-KEY': 'votre-cle-api' },
});

console.log(fhir.practitioner);       // FhirPractitioner | null
console.log(fhir.practitionerRoles);  // FhirPractitionerRole[]
```

| Parametre | Type | Description |
|-----------|------|-------------|
| `rpps` | `string` | Numero RPPS |
| `options.baseUrl` | `string` | URL de base FHIR |
| `options.timeout` | `number` | Timeout en ms |
| `options.headers` | `Record<string, string>` | Headers HTTP (doit inclure `ESANTE-API-KEY`) |

#### `fetchPersonneActivite(rpps, options?)`

Recupere l'identite, la profession et les activites (structures d'exercice) d'un praticien.

```typescript
import { fetchPersonneActivite } from '@qrcommunication/rppsapi';

const result = await fetchPersonneActivite('10000001866');

console.log(result.identite);    // Identite
console.log(result.profession);  // Profession
console.log(result.activites);   // Activite[]
```

#### `searchPersonneActivite(criteria, options?)`

Recherche directe dans la source Personne-Activite, avec filtres et pagination.

```typescript
import { searchPersonneActivite } from '@qrcommunication/rppsapi';

const result = await searchPersonneActivite(
  { nom: 'MARTIN', codePostal: '75015' },
  { pageSize: 50, page: 1 },
);

console.log(result.results);  // RppsSearchResult[]
console.log(result.total);    // number
```

#### `fetchDiplomes(rpps, options?)`

Recupere les diplomes obtenus et les autorisations d'exercice.

```typescript
import { fetchDiplomes } from '@qrcommunication/rppsapi';

const diplomes = await fetchDiplomes('10000001866');
// DiplomeEtAutorisation[]
```

#### `fetchSavoirFaire(rpps, options?)`

Recupere les savoir-faire (specialites, competences, qualifications).

```typescript
import { fetchSavoirFaire } from '@qrcommunication/rppsapi';

const sf = await fetchSavoirFaire('10000001866');
// SavoirFaire[]
```

#### `fetchCartesCps(rpps, options?)`

Recupere les cartes CPS et CPF associees au praticien.

```typescript
import { fetchCartesCps } from '@qrcommunication/rppsapi';

const cartes = await fetchCartesCps('10000001866');
// CarteCps[]
```

#### `fetchMssante(rpps, options?)`

Recupere les boites aux lettres MSSante du praticien.

```typescript
import { fetchMssante } from '@qrcommunication/rppsapi';

const messageries = await fetchMssante('10000001866');
// MessagerieMssante[]
```

#### Options communes des sources Tabular

Toutes les fonctions `fetchPersonneActivite`, `fetchDiplomes`, `fetchSavoirFaire`, `fetchCartesCps` et `fetchMssante` acceptent les memes options :

| Parametre | Type | Defaut | Description |
|-----------|------|--------|-------------|
| `baseUrl` | `string` | `https://tabular-api.data.gouv.fr/api/resources` | URL de base de l'API Tabular |
| `timeout` | `number` | `30000` | Timeout en ms |
| `pageSize` | `number` | `100` | Nombre de lignes par page |
| `headers` | `Record<string, string>` | `{}` | Headers HTTP supplementaires |

---

### `validateRpps(rpps)`

Utilitaire de validation d'un numero RPPS. Verifie que la chaine contient exactement 11 chiffres apres nettoyage des espaces.

```typescript
import { validateRpps } from '@qrcommunication/rppsapi';

const clean = validateRpps('10000001866');  // '10000001866'
validateRpps('123');                         // throw Error
validateRpps('1234567890A');                 // throw Error
```

| Parametre | Type | Description |
|-----------|------|-------------|
| `rpps` | `string` | Numero RPPS a valider |

**Retour** : `string` - Le numero RPPS nettoye (trimmed).

**Erreur** : `Error` avec le message `Numero RPPS invalide : "xxx". Le RPPS doit contenir exactement 11 chiffres.`

---

## Types

Le SDK exporte l'ensemble des interfaces TypeScript necessaires.

### RppsFullProfile

Type de retour principal de `getByRpps`. Voir la section [API Reference > getByRpps](#clientgetbyrppsrpps) pour la structure complete.

### Identite

Identite civile et d'exercice du praticien.

| Champ | Type | Description |
|-------|------|-------------|
| `civilite` | `CodeLabel` | Civilite de l'etat civil (ex: `{ code: "M", libelle: "Monsieur" }`) |
| `civiliteExercice` | `CodeLabel` | Civilite d'exercice (ex: `{ code: "DR", libelle: "Docteur" }`) |
| `nomExercice` | `string` | Nom d'exercice |
| `prenomExercice` | `string` | Prenom d'exercice |

### Profession

Profession exercee et categorie professionnelle.

| Champ | Type | Description |
|-------|------|-------------|
| `code` | `string` | Code profession (nomenclature ANS) |
| `libelle` | `string` | Libelle de la profession (ex: `"Medecin"`, `"Pharmacien"`) |
| `categorie` | `CodeLabel` | Categorie professionnelle (ex: civil, militaire) |

### Activite

Structure d'exercice et conditions d'activite du praticien.

| Champ | Type | Description |
|-------|------|-------------|
| `modeExercice` | `CodeLabel` | Mode d'exercice (liberal, salarie, benevole) |
| `savoirFaire` | `CodeLabel` | Savoir-faire lie a l'activite |
| `typeSavoirFaire` | `CodeLabel` | Type de savoir-faire (specialite, competence, etc.) |
| `secteurActivite` | `CodeLabel` | Secteur d'activite (cabinet, hopital, etc.) |
| `sectionTableauPharmaciens` | `CodeLabel` | Section du tableau de l'Ordre des pharmaciens |
| `role` | `CodeLabel` | Role dans la structure |
| `genreActivite` | `CodeLabel` | Genre d'activite |
| `autoriteEnregistrement` | `string` | Autorite d'enregistrement |
| `structure` | `Structure` | Structure d'exercice (voir ci-dessous) |

### Structure

Structure d'exercice (cabinet, etablissement, pharmacie, etc.).

| Champ | Type | Description |
|-------|------|-------------|
| `identifiantTechnique` | `string` | Identifiant technique de la structure |
| `raisonSociale` | `string` | Raison sociale du site |
| `enseigneCommerciale` | `string` | Enseigne commerciale |
| `numeroSiret` | `string` | Numero SIRET |
| `numeroSiren` | `string` | Numero SIREN |
| `numeroFinessSite` | `string` | Numero FINESS du site |
| `numeroFinessEtablissementJuridique` | `string` | Numero FINESS de l'etablissement juridique |
| `telephone` | `string` | Telephone principal |
| `telephone2` | `string` | Telephone secondaire |
| `telecopie` | `string` | Numero de telecopie (fax) |
| `email` | `string` | Adresse email |
| `codeDepartement` | `string` | Code departement |
| `libelleDepartement` | `string` | Nom du departement |
| `ancienIdentifiant` | `string` | Ancien identifiant de la structure |
| `adresse` | `AdresseStructure` | Adresse postale complete |

### AdresseStructure

Adresse postale d'une structure d'exercice.

| Champ | Type | Description |
|-------|------|-------------|
| `complementDestinataire` | `string` | Complement destinataire |
| `complementPointGeographique` | `string` | Complement geographique |
| `numeroVoie` | `string` | Numero de voie |
| `indiceRepetitionVoie` | `string` | Indice de repetition (bis, ter, etc.) |
| `codeTypeVoie` | `string` | Code type de voie |
| `libelleTypeVoie` | `string` | Libelle du type de voie (rue, avenue, etc.) |
| `libelleVoie` | `string` | Nom de la voie |
| `mentionDistribution` | `string` | Mention de distribution |
| `bureauCedex` | `string` | Bureau cedex |
| `codePostal` | `string` | Code postal |
| `codeCommune` | `string` | Code commune INSEE |
| `libelleCommune` | `string` | Nom de la commune |
| `codePays` | `string` | Code pays |
| `libellePays` | `string` | Nom du pays |

### Diplome et Autorisation

```typescript
interface DiplomeEtAutorisation {
  diplome: Diplome | null;
  autorisation: Autorisation | null;
}

interface Diplome {
  typeDiplome: CodeLabel;   // Type (ex: certificat, diplome d'Etat)
  diplome: CodeLabel;       // Intitule du diplome
}

interface Autorisation {
  typeAutorisation: CodeLabel;         // Type d'autorisation
  disciplineAutorisation: CodeLabel;   // Discipline autorisee
}
```

### SavoirFaire

Savoir-faire declare d'un praticien.

| Champ | Type | Description |
|-------|------|-------------|
| `profession` | `CodeLabel` | Profession associee |
| `categorieProfessionnelle` | `CodeLabel` | Categorie professionnelle |
| `typeSavoirFaire` | `CodeLabel` | Type (specialite ordinale, competence, etc.) |
| `savoirFaire` | `CodeLabel` | Intitule du savoir-faire |

### CarteCps

Carte de professionnel de sante (CPS) ou de professionnel en formation (CPF).

| Champ | Type | Description |
|-------|------|-------------|
| `typeCarte` | `CodeLabel` | Type de carte (CPS, CPF) |
| `numeroCarte` | `string` | Numero de la carte |
| `identifiantNationalCarte` | `string` | Identifiant national contenu dans la carte |
| `dateDebutValidite` | `string` | Date de debut de validite |
| `dateFinValidite` | `string` | Date de fin de validite |
| `dateOpposition` | `string` | Date d'opposition (si opposee) |
| `dateMiseAJour` | `string` | Date de derniere mise a jour |

### MessagerieMssante

Boite aux lettres MSSante (Messagerie Securisee de Sante).

| Champ | Type | Description |
|-------|------|-------------|
| `typeBal` | `string` | Type de BAL (PER = personnelle, ORG = organisationnelle) |
| `adresseBal` | `string` | Adresse de la boite aux lettres |
| `dematerialisation` | `boolean` | Si la BAL accepte la dematerialisation |
| `savoirFaire` | `CodeLabel` | Savoir-faire associe |
| `structure` | `object` | Structure de rattachement (identifiant, raison sociale, adresse) |

### FhirData, FhirPractitioner, FhirPractitionerRole

Structures conformes au standard FHIR R4, simplifiees pour l'usage TypeScript.

```typescript
interface FhirData {
  practitioner: FhirPractitioner | null;
  practitionerRoles: FhirPractitionerRole[];
}

interface FhirPractitioner {
  resourceType: 'Practitioner';
  id?: string;
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: Array<{ system?: string; value?: string; use?: string }>;
  qualification?: FhirQualification[];
  [key: string]: unknown;  // Extensions FHIR supplementaires
}

interface FhirPractitionerRole {
  resourceType: 'PractitionerRole';
  id?: string;
  practitioner?: { reference?: string };
  organization?: { reference?: string; display?: string };
  code?: Array<{ coding?: Array<{ system?: string; code?: string; display?: string }> }>;
  specialty?: Array<{ coding?: Array<{ system?: string; code?: string; display?: string }> }>;
  location?: Array<{ reference?: string; display?: string }>;
  [key: string]: unknown;  // Extensions FHIR supplementaires
}
```

### CodeLabel

Paire code/libelle omnipresente dans les donnees RPPS.

```typescript
interface CodeLabel {
  code: string;
  libelle: string;
}
```

### SourceStatus

Metadonnees de statut pour chaque source interrogee.

| Champ | Type | Description |
|-------|------|-------------|
| `source` | `SourceName` | Nom de la source (`'fhir'`, `'personne-activite'`, `'diplomes'`, `'savoir-faire'`, `'carte-cps'`, `'mssante'`) |
| `success` | `boolean` | `true` si la requete a abouti |
| `rowCount` | `number` | Nombre d'enregistrements retournes |
| `durationMs` | `number` | Duree de la requete en ms |
| `error` | `string` | Message d'erreur (si echec) ou `'disabled'` (si source desactivee) |

### RppsSearchCriteria et RppsSearchResponse

Voir la section [API Reference > search](#clientsearchcriteria-options) pour la documentation complete de ces types.

---

## Exemples avances

### Recherche par nom partiel et code postal

```typescript
import { RppsClient } from '@qrcommunication/rppsapi';

const client = new RppsClient();

// Recherche partielle : tous les "DUPO" dans Paris (75)
const resultats = await client.search(
  { nom: 'DUPO', codePostal: '75' },
  { pageSize: 20 },
);

for (const r of resultats.results) {
  console.log(`${r.civilite} ${r.prenomExercice} ${r.nomExercice}`);
  console.log(`  ${r.profession.libelle} - ${r.structure.libelleCommune}`);
}
```

### Recherche puis profil complet (chaining)

```typescript
import { RppsClient } from '@qrcommunication/rppsapi';

const client = new RppsClient({
  fhirApiKey: process.env.FHIR_API_KEY,
});

// Etape 1 : chercher le praticien
const recherche = await client.search({ nom: 'SIGNOL', codePostal: '87025' });

if (recherche.results.length > 0) {
  // Etape 2 : recuperer le profil complet du premier resultat
  const rpps = recherche.results[0].rpps;
  const profil = await client.getByRpps(rpps);

  console.log(`${profil.identite.civiliteExercice.libelle} ${profil.identite.prenomExercice} ${profil.identite.nomExercice}`);
  console.log(`Diplomes : ${profil.diplomesEtAutorisations.length}`);
  console.log(`Activites : ${profil.activites.length}`);
  console.log(`Cartes CPS : ${profil.cartesCps.length}`);
}
```

### Desactiver certaines sources

```typescript
import { RppsClient } from '@qrcommunication/rppsapi';

// Ne recuperer que l'identite et les diplomes
const client = new RppsClient({
  disabledSources: ['savoir-faire', 'carte-cps', 'mssante'],
});

const profil = await client.getByRpps('10000001866');

// Les sources desactivees retournent des tableaux vides
console.log(profil.savoirFaire);        // []
console.log(profil.cartesCps);          // []
console.log(profil.messageriesMssante); // []

// Les metadonnees indiquent "disabled"
for (const s of profil.metadata.sources) {
  if (s.error === 'disabled') {
    console.log(`${s.source} : desactivee`);
  }
}
```

### Gestion d'erreurs

```typescript
import { RppsClient, validateRpps } from '@qrcommunication/rppsapi';

const client = new RppsClient();

// Valider le RPPS avant l'appel
try {
  validateRpps(inputUtilisateur);
} catch (error) {
  console.error('Numero RPPS invalide :', error.message);
  // Afficher un message a l'utilisateur
}

// Gerer les erreurs de l'appel principal
try {
  const profil = await client.getByRpps('10000001866');

  // Verifier les sources en echec
  const echecs = profil.metadata.sources.filter(s => !s.success);
  if (echecs.length > 0) {
    console.warn('Certaines sources ont echoue :');
    for (const s of echecs) {
      console.warn(`  ${s.source} : ${s.error}`);
    }
  }
} catch (error) {
  // Erreur fatale (RPPS invalide, etc.)
  console.error('Erreur lors de la recuperation :', error.message);
}
```

### Utilisation avec la cle FHIR

```typescript
import { RppsClient } from '@qrcommunication/rppsapi';

const client = new RppsClient({
  fhirApiKey: process.env.FHIR_API_KEY, // Cle Gravitee
  timeout: 60_000,                       // Timeout plus genereux pour FHIR
});

const profil = await client.getByRpps('10000001866');

// Donnees FHIR disponibles
if (profil.fhir.practitioner) {
  console.log('ID FHIR :', profil.fhir.practitioner.id);
  console.log('Actif :', profil.fhir.practitioner.active);
  console.log('Qualifications :', profil.fhir.practitioner.qualification?.length);
  console.log('Roles :', profil.fhir.practitionerRoles.length);

  for (const role of profil.fhir.practitionerRoles) {
    console.log('  Organisation :', role.organization?.display);
    console.log('  Specialites :', role.specialty?.map(s => s.coding?.[0]?.display).join(', '));
  }
}
```

---

## Configuration FHIR

La source FHIR interroge l'API officielle de l'Annuaire Sante operee par l'ANS. Elle necessite une cle API gratuite.

### Obtenir une cle API

1. Creer un compte sur le portail Gravitee de l'ANS : [https://portal.api.esante.gouv.fr](https://portal.api.esante.gouv.fr)
2. S'abonner a l'API **"Annuaire Sante FHIR"**
3. Generer une cle API dans la section "Subscriptions"
4. Utiliser cette cle dans le parametre `fhirApiKey` du client

### Variables d'environnement recommandees

```bash
# .env
FHIR_API_KEY=votre-cle-gravitee-ici
```

```typescript
const client = new RppsClient({
  fhirApiKey: process.env.FHIR_API_KEY,
});
```

> **Sans cle FHIR** : le SDK fonctionne normalement avec les 5 autres sources. La source FHIR est simplement ignoree et `profil.fhir` contient `{ practitioner: null, practitionerRoles: [] }`.

---

## Donnees retournees

### Structure du profil complet

Lorsque vous appelez `getByRpps`, le SDK retourne un objet `RppsFullProfile` dont chaque champ provient d'une source specifique :

| Champ | Source | Description |
|-------|--------|-------------|
| `rpps` | Validation locale | Numero RPPS nettoye (11 chiffres) |
| `identificationNationale` | Personne-Activite | Identifiant national PP (prefixe type + RPPS, ex: `"810000001866"`) |
| `identite` | Personne-Activite | Civilite, nom et prenom d'exercice |
| `profession` | Personne-Activite | Code et libelle de la profession, categorie professionnelle |
| `activites` | Personne-Activite | Tableau des structures d'exercice avec adresse, mode d'exercice, role et secteur d'activite. Chaque ligne du fichier source correspond a une activite distincte |
| `diplomesEtAutorisations` | Diplomes | Tableau mixte : chaque entree peut contenir un diplome, une autorisation, ou les deux |
| `savoirFaire` | Savoir-faire | Specialites, competences et qualifications declarees aupres de l'Ordre |
| `cartesCps` | Carte CPS | Cartes physiques CPS/CPF avec numeros et dates de validite |
| `messageriesMssante` | MSSante | Boites aux lettres securisees MSSante avec adresses et structures de rattachement |
| `fhir` | FHIR ANS | Ressources FHIR R4 brutes : `Practitioner` et `PractitionerRole[]` |
| `metadata` | Calcul local | Statut de chaque source, horodatage et duree totale |

### Valeurs par defaut

Si une source echoue ou est desactivee, les champs correspondants prennent des valeurs par defaut :

| Type de champ | Valeur par defaut |
|---------------|-------------------|
| Tableaux (`activites`, `diplomesEtAutorisations`, etc.) | `[]` (tableau vide) |
| `identite` | Objet avec des chaines vides et des `CodeLabel` vides |
| `profession` | Objet avec des chaines vides |
| `fhir` | `{ practitioner: null, practitionerRoles: [] }` |

---

## Performance

### Parallelisme

Le SDK interroge toutes les sources activees simultanement via `Promise.all`. Le temps total d'un appel `getByRpps` correspond au temps de la source la plus lente, pas a la somme des temps.

Exemple de temps typiques :

| Source | Duree moyenne |
|--------|--------------|
| Personne-Activite | 200-500 ms |
| Diplomes | 200-400 ms |
| Savoir-faire | 200-400 ms |
| Carte CPS | 200-400 ms |
| MSSante | 200-400 ms |
| FHIR | 300-800 ms |
| **Total (parallele)** | **300-800 ms** |

### Pagination automatique

Les sources Tabular gerent automatiquement la pagination. Si un praticien possede plus de lignes que la `pageSize` configuree, le SDK recupere toutes les pages de maniere transparente.

### Optimisation des requetes

Pour reduire le temps de reponse :

- Desactiver les sources inutiles via `disabledSources`
- Ajuster le `timeout` selon votre contexte reseau
- Utiliser `tabularPageSize` eleve si vous attendez beaucoup de resultats par source

---

## Compatibilite

| Requirement | Version |
|-------------|---------|
| Node.js | >= 18.0.0 |
| TypeScript | >= 5.0 (recommande 5.7+) |
| Format de module | ESM uniquement (`"type": "module"`) |

Le SDK utilise l'API `fetch` native de Node.js (disponible depuis Node 18) et ne depend d'aucune librairie tierce.

> **Note** : Ce package est distribue uniquement en ESM. Si votre projet utilise CommonJS (`require`), vous devez utiliser un import dynamique : `const { RppsClient } = await import('@qrcommunication/rppsapi')`.

---

## Licence

PolyForm Noncommercial 1.0.0 -- Voir le fichier [LICENSE](./LICENSE) pour les details.

---

## Contribuer

Les contributions sont les bienvenues. Voici les etapes pour participer :

1. Forker le depot
2. Creer une branche pour votre fonctionnalite (`git checkout -b feature/ma-fonctionnalite`)
3. Ecrire le code et les tests correspondants
4. Verifier que les tests passent : `npm test`
5. Verifier le typage : `npm run lint`
6. Soumettre une Pull Request avec une description claire

### Commandes de developpement

```bash
npm run build       # Compile TypeScript vers dist/
npm run dev         # Compile en mode watch
npm test            # Lance les tests (vitest)
npm run test:watch  # Lance les tests en mode watch
npm run lint        # Verifie le typage (tsc --noEmit)
```

### Structure du projet

```
@qrcommunication/rppsapi/
  src/
    index.ts              # Exports publics
    client.ts             # Classe RppsClient
    types.ts              # Interfaces et types
    utils.ts              # Utilitaires (fetch, validation, etc.)
    sources/
      fhir.ts             # Source FHIR Annuaire Sante
      personne-activite.ts # Source Personne-Activite
      diplomes.ts         # Source Diplomes & Autorisations
      savoir-faire.ts     # Source Savoir-faire
      carte-cps.ts        # Source Cartes CPS/CPF
      mssante.ts          # Source Messageries MSSante
  examples/
    basic-usage.ts        # Exemple : profil complet
    search.ts             # Exemple : recherche
  dist/                   # Build (genere)
  package.json
  tsconfig.json
```

---

## Changelog

### 1.0.0

- Publication initiale
- 6 sources de donnees RPPS (FHIR, Personne-Activite, Diplomes, Savoir-faire, Carte CPS, MSSante)
- Methode `getByRpps` : profil complet par numero RPPS
- Methode `search` : recherche multicritere avec pagination
- Sources individuelles exportees pour usage avance
- Utilitaire `validateRpps`
- Zero dependance, TypeScript natif, ESM
