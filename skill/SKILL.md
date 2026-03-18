---
name: sdk-rpps
description: Use when working with RPPS data, Annuaire Sante, professional de sante lookups, or projects importing @qrcommunication/rppsapi (npm) or qrcommunication/rppsapi (composer). Covers TypeScript and PHP SDKs.
---

# SDK RPPS — Reference

SDK pour interroger les donnees RPPS (Repertoire Partage des Professionnels de Sante) via l'Annuaire Sante ANS et data.gouv.fr. Disponible en TypeScript (npm) et PHP (Packagist).

## Packages

| Langage | Package | Repo |
|---------|---------|------|
| TypeScript | `@qrcommunication/rppsapi` | `QrCommunication/rppsapi-js` |
| PHP | `qrcommunication/rppsapi` | `QrCommunication/rppsapi-php` |

## Quick Start

**TypeScript:**
```typescript
import { RppsClient } from '@qrcommunication/rppsapi';
const client = new RppsClient({ fhirApiKey: process.env.FHIR_API_KEY });
const profil = await client.getByRpps('10005173140');
const results = await client.search({ nom: 'DUPONT', codePostal: '75' });
```

**PHP:**
```php
use QrCommunication\RppsApi\RppsClient;
use QrCommunication\RppsApi\RppsClientOptions;
use QrCommunication\RppsApi\Dto\RppsSearchCriteria;

$client = new RppsClient(new RppsClientOptions(fhirApiKey: $_ENV['FHIR_API_KEY']));
$profil = $client->getByRpps('10005173140');
$results = $client->search(new RppsSearchCriteria(nom: 'DUPONT', codePostal: '75'));
```

## API Methods

### `getByRpps(rpps: string)` — Profil complet

Interroge 6 sources en parallele, retourne un objet unifie :
- `identite` : civilite, nom, prenom d'exercice
- `profession` : code, libelle, categorie
- `activites[]` : structures d'exercice avec adresse complete
- `diplomesEtAutorisations[]` : diplomes et autorisations
- `savoirFaire[]` : specialites, competences
- `cartesCps[]` : cartes CPS/CPF avec dates validite
- `messageriesMssante[]` : boites aux lettres MSSante
- `fhir` : donnees FHIR brutes (Practitioner + PractitionerRole)
- `metadata.sources[]` : statut de chaque source (success, rowCount, durationMs)

### `search(criteria)` — Recherche multicritere

Au moins 1 critere obligatoire. Recherche partielle (`contains`), insensible a la casse.

| Critere | Operateur | Comportement |
|---------|-----------|-------------|
| `nom` | contains | `%valeur%` sur "Nom d'exercice" |
| `prenom` | contains | `%valeur%` sur "Prenom d'exercice" |
| `codePostal` | exact (5 chiffres) ou contains (2-4) | Filtre departemental ou exact |

Retourne des `RppsSearchResult` dedupliques par RPPS.

### `validateRpps(rpps)` — Validation

Verifie que le RPPS contient exactement 11 chiffres. Lance une exception sinon.

## Configuration

| Option | Type | Defaut | Description |
|--------|------|--------|-------------|
| `fhirApiKey` | string? | null | Cle ESANTE-API-KEY (Gravitee). Sans cle, FHIR desactive |
| `fhirBaseUrl` | string | `https://gateway.api.esante.gouv.fr/fhir/v2` | URL API FHIR |
| `tabularBaseUrl` | string | `https://tabular-api.data.gouv.fr/api/resources` | URL Tabular API |
| `timeout` | number | 30000 (ms) / 30.0 (s) | Timeout par requete |
| `tabularPageSize` | number | 100 | Lignes par page |
| `disabledSources` | string[] | [] | Sources a desactiver |

## 6 Sources de Donnees

Pour les colonnes detaillees et resource IDs, voir [references/data-sources.md](references/data-sources.md).

| Source | Resource ID | Rows | Donnees |
|--------|-------------|------|---------|
| personne-activite | `fffda7e9-0ea2-4c35-bba0-4496f3af935d` | 2.2M | Identite, profession, structures |
| diplomes | `41ae70ac-90c8-4c4e-8644-4ef1b100f045` | 2.2M | Diplomes, autorisations |
| savoir-faire | `fb55f15f-bd61-4402-b551-51ef387f2fab` | 430K | Specialites, qualifications |
| carte-cps | `210eb05e-564b-42be-994a-d1800b63e9b7` | 1M | Cartes professionnelles |
| mssante | `afe01105-d9a1-41fe-921f-e40ea48b2ba6` | 542K | Messageries securisees |
| fhir | API FHIR ANS v2 | - | Practitioner + PractitionerRole |

## Cle API FHIR

Obtenir gratuitement sur https://portal.api.esante.gouv.fr :
1. Creer un compte Gravitee
2. Creer une application
3. S'abonner a "API Annuaire Sante en libre acces"
4. Recuperer la cle ESANTE-API-KEY dans Souscriptions

Header HTTP : `ESANTE-API-KEY: <cle>`

## Architecture

```
RppsClient
├── getByRpps(rpps)
│   ├── FhirSource          → API FHIR (si cle fournie)
│   ├── PersonneActiviteSource → Tabular API
│   ├── DiplomesSource       → Tabular API
│   ├── SavoirFaireSource    → Tabular API
│   ├── CarteCpsSource       → Tabular API
│   └── MssanteSource        → Tabular API
│   (toutes en parallele, safeQuery encapsule chaque source)
└── search(criteria)
    └── PersonneActiviteSource.search() → filtres multiples
```

- **Resilience** : `safeQuery()` catch chaque source independamment
- **Performance** : TypeScript = `Promise.all()`, PHP = sequentiel avec Guzzle
- **Pagination** : suit automatiquement les liens `next` de l'API Tabular

## Structure des projets

**TypeScript (`rppsapi-js/`):**
```
src/
├── index.ts, client.ts, types.ts, utils.ts
└── sources/ (fhir.ts, personne-activite.ts, diplomes.ts, savoir-faire.ts, carte-cps.ts, mssante.ts)
```

**PHP (`rppsapi-php/`):**
```
src/
├── RppsClient.php, RppsClientOptions.php
├── Dto/ (CodeLabel, Identite, Profession, Activite, Structure, AdresseStructure,
│         DiplomeEtAutorisation, SavoirFaire, CarteCps, MessagerieMssante,
│         FhirData, SourceStatus, RppsFullProfile, RppsSearchCriteria,
│         RppsSearchResult, RppsSearchResponse)
├── Source/ (TabularSource, FhirSource, PersonneActiviteSource, DiplomesSource,
│           SavoirFaireSource, CarteCpsSource, MssanteSource)
├── Enum/ (SourceName)
└── Exception/ (RppsException)
```

## Erreurs courantes

| Erreur | Cause | Fix |
|--------|-------|-----|
| RPPS invalide | Pas 11 chiffres | Utiliser `validateRpps()` avant |
| FHIR 401/403 | Cle API manquante/invalide | Verifier cle Gravitee |
| FHIR desactive silencieusement | Pas de `fhirApiKey` | Normal — les 5 autres sources marchent |
| 0 resultats search | Criteres trop restrictifs | Reduire le code postal a 2 chiffres |
| Timeout | API Tabular lente | Augmenter `timeout` |
