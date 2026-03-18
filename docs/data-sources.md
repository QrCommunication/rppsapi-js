# Sources de donnees RPPS

Ce document decrit en detail les six sources de donnees exploitees par le SDK pour constituer le profil complet d'un professionnel de sante identifie par son numero RPPS.

Cinq sources proviennent de l'**API Tabular de data.gouv.fr** (fichiers de l'Annuaire Sante en libre acces). La sixieme est l'**API FHIR R4 de l'Annuaire Sante** operee par l'ANS (Agence du Numerique en Sante).

---

## Sommaire

1. [Personne-Activite](#1-personne-activite)
2. [Diplomes et Autorisations](#2-diplomes-et-autorisations)
3. [Savoir-faire](#3-savoir-faire)
4. [Cartes CPS / CPF](#4-cartes-cps--cpf)
5. [MSSante](#5-mssante)
6. [API FHIR Annuaire Sante](#6-api-fhir-annuaire-sante)

---

## 1. Personne-Activite

| Propriete | Valeur |
|-----------|--------|
| **Source** | Annuaire Sante RPPS - data.gouv.fr |
| **Fichier d'origine** | `ps-libreacces-personne-activite.txt` |
| **Resource ID** | `fffda7e9-0ea2-4c35-bba0-4496f3af935d` |
| **Volume** | environ 2.2 millions de lignes |
| **Mise a jour** | Quotidienne |
| **Filtre SDK** | `Identifiant PP__exact={rpps}` |

Cette source est la plus volumineuse et la plus riche. Elle contient l'identite du praticien, sa profession, et surtout la liste de ses activites (structures d'exercice). Chaque ligne represente une activite distincte : un praticien exerçant dans trois cabinets produira trois lignes.

### Colonnes

Le tableau ci-dessous liste toutes les colonnes exploitees par le SDK, regroupees par categorie.

#### Identification

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identifiant PP` | Numero RPPS a 11 chiffres | `RppsFullProfile.rpps` |
| `Identification nationale PP` | Prefixe type identification + RPPS (ex. `0` + RPPS pour les medecins) | `RppsFullProfile.identificationNationale` |

#### Identite

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Code civilite` | Code de la civilite d'etat civil (M, MME...) | `Identite.civilite.code` |
| `Libelle civilite` | Libelle en clair | `Identite.civilite.libelle` |
| `Code civilite d'exercice` | Code de la civilite d'exercice (DR, PR...) | `Identite.civiliteExercice.code` |
| `Libelle civilite d'exercice` | Libelle en clair | `Identite.civiliteExercice.libelle` |
| `Nom d'exercice` | Nom sous lequel le praticien exerce | `Identite.nomExercice` |
| `Prenom d'exercice` | Prenom sous lequel le praticien exerce | `Identite.prenomExercice` |

#### Profession

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Code profession` | Code de la profession exercee (ex. `1` = Medecin) | `Profession.code` |
| `Libelle profession` | Libelle de la profession | `Profession.libelle` |
| `Code categorie professionnelle` | Code categorie (civil, militaire...) | `Profession.categorie.code` |
| `Libelle categorie professionnelle` | Libelle de la categorie | `Profession.categorie.libelle` |

#### Activite

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Code mode exercice` | Mode d'exercice (liberal, salarie...) | `Activite.modeExercice.code` |
| `Libelle mode exercice` | Libelle du mode | `Activite.modeExercice.libelle` |
| `Code savoir-faire` | Specialite exercee dans cette activite | `Activite.savoirFaire.code` |
| `Libelle savoir-faire` | Libelle de la specialite | `Activite.savoirFaire.libelle` |
| `Code type savoir-faire` | Type de savoir-faire (specialite, competence...) | `Activite.typeSavoirFaire.code` |
| `Libelle type savoir-faire` | Libelle du type | `Activite.typeSavoirFaire.libelle` |
| `Code secteur d'activite` | Secteur (cabinet, hopital, pharmacie...) | `Activite.secteurActivite.code` |
| `Libelle secteur d'activite` | Libelle du secteur | `Activite.secteurActivite.libelle` |
| `Code section tableau pharmaciens` | Section du tableau de l'Ordre des pharmaciens | `Activite.sectionTableauPharmaciens.code` |
| `Libelle section tableau pharmaciens` | Libelle de la section | `Activite.sectionTableauPharmaciens.libelle` |
| `Code role` | Role dans la structure (titulaire, remplaçant...) | `Activite.role.code` |
| `Libelle role` | Libelle du role | `Activite.role.libelle` |
| `Code genre activite` | Genre d'activite | `Activite.genreActivite.code` |
| `Libelle genre activite` | Libelle du genre | `Activite.genreActivite.libelle` |
| `Autorite d'enregistrement` | Organisme ayant enregistre l'activite | `Activite.autoriteEnregistrement` |

#### Structure d'exercice

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identifiant technique de la structure` | Identifiant interne de la structure | `Structure.identifiantTechnique` |
| `Raison sociale site` | Nom legal de la structure | `Structure.raisonSociale` |
| `Enseigne commerciale site` | Nom commercial | `Structure.enseigneCommerciale` |
| `Numero SIRET site` | Numero SIRET (14 chiffres) | `Structure.numeroSiret` |
| `Numero SIREN site` | Numero SIREN (9 chiffres) | `Structure.numeroSiren` |
| `Numero FINESS site` | Numero FINESS du site geographique | `Structure.numeroFinessSite` |
| `Numero FINESS etablissement juridique` | Numero FINESS de l'entite juridique | `Structure.numeroFinessEtablissementJuridique` |
| `Telephone (coord. structure)` | Telephone principal | `Structure.telephone` |
| `Telephone 2 (coord. structure)` | Telephone secondaire | `Structure.telephone2` |
| `Telecopie (coord. structure)` | Numero de fax | `Structure.telecopie` |
| `Adresse e-mail (coord. structure)` | Adresse email de la structure | `Structure.email` |
| `Code Departement (structure)` | Code departement (2 ou 3 chiffres) | `Structure.codeDepartement` |
| `Libelle Departement (structure)` | Nom du departement | `Structure.libelleDepartement` |
| `Ancien identifiant de la structure` | Identifiant historique | `Structure.ancienIdentifiant` |

#### Adresse de la structure

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Complement destinataire (coord. structure)` | Complement d'adresse destinataire | `AdresseStructure.complementDestinataire` |
| `Complement point geographique (coord. structure)` | Batiment, residence, ZI... | `AdresseStructure.complementPointGeographique` |
| `Numero Voie (coord. structure)` | Numero dans la voie | `AdresseStructure.numeroVoie` |
| `Indice repetition voie (coord. structure)` | Bis, ter, quater... | `AdresseStructure.indiceRepetitionVoie` |
| `Code type de voie (coord. structure)` | Code du type de voie (R, AV, BD...) | `AdresseStructure.codeTypeVoie` |
| `Libelle type de voie (coord. structure)` | Rue, Avenue, Boulevard... | `AdresseStructure.libelleTypeVoie` |
| `Libelle Voie (coord. structure)` | Nom de la voie | `AdresseStructure.libelleVoie` |
| `Mention distribution (coord. structure)` | BP, CS, cedex... | `AdresseStructure.mentionDistribution` |
| `Bureau cedex (coord. structure)` | Bureau distributeur | `AdresseStructure.bureauCedex` |
| `Code postal (coord. structure)` | Code postal (5 chiffres) | `AdresseStructure.codePostal` |
| `Code commune (coord. structure)` | Code INSEE de la commune | `AdresseStructure.codeCommune` |
| `Libelle commune (coord. structure)` | Nom de la commune | `AdresseStructure.libelleCommune` |
| `Code pays (coord. structure)` | Code ISO du pays | `AdresseStructure.codePays` |
| `Libelle pays (coord. structure)` | Nom du pays | `AdresseStructure.libellePays` |

### Exemple de donnees

```json
{
  "identite": {
    "civilite": { "code": "M", "libelle": "Monsieur" },
    "civiliteExercice": { "code": "DR", "libelle": "Docteur" },
    "nomExercice": "DUPONT",
    "prenomExercice": "Jean"
  },
  "profession": {
    "code": "1",
    "libelle": "Medecin",
    "categorie": { "code": "C", "libelle": "Civil" }
  },
  "activites": [
    {
      "modeExercice": { "code": "L", "libelle": "Liberal" },
      "savoirFaire": { "code": "SM26", "libelle": "Medecine generale" },
      "typeSavoirFaire": { "code": "S", "libelle": "Specialite ordinale" },
      "secteurActivite": { "code": "SA01", "libelle": "Cabinet individuel" },
      "sectionTableauPharmaciens": { "code": "", "libelle": "" },
      "role": { "code": "", "libelle": "" },
      "genreActivite": { "code": "GENR01", "libelle": "Activite de soins" },
      "autoriteEnregistrement": "CNOM/CNOM75",
      "structure": {
        "identifiantTechnique": "R12345",
        "raisonSociale": "CABINET MEDICAL DUPONT",
        "enseigneCommerciale": "",
        "numeroSiret": "12345678901234",
        "numeroSiren": "123456789",
        "numeroFinessSite": "",
        "numeroFinessEtablissementJuridique": "",
        "telephone": "0145678901",
        "telephone2": "",
        "telecopie": "",
        "email": "cabinet.dupont@gmail.com",
        "codeDepartement": "75",
        "libelleDepartement": "PARIS",
        "ancienIdentifiant": "",
        "adresse": {
          "complementDestinataire": "",
          "complementPointGeographique": "",
          "numeroVoie": "12",
          "indiceRepetitionVoie": "",
          "codeTypeVoie": "R",
          "libelleTypeVoie": "Rue",
          "libelleVoie": "DE LA PAIX",
          "mentionDistribution": "",
          "bureauCedex": "",
          "codePostal": "75002",
          "codeCommune": "75102",
          "libelleCommune": "PARIS 02",
          "codePays": "99100",
          "libellePays": "FRANCE"
        }
      }
    }
  ]
}
```

---

## 2. Diplomes et Autorisations

| Propriete | Valeur |
|-----------|--------|
| **Source** | Annuaire Sante RPPS - data.gouv.fr |
| **Fichier d'origine** | `ps-libreacces-dipl-autexerc.txt` |
| **Resource ID** | `41ae70ac-90c8-4c4e-8644-4ef1b100f045` |
| **Volume** | environ 2.2 millions de lignes |
| **Mise a jour** | Quotidienne |
| **Filtre SDK** | `Identifiant PP__exact={rpps}` |

Cette source regroupe les diplomes obtenus et les autorisations d'exercice de chaque praticien. Une meme ligne peut contenir un diplome, une autorisation, ou les deux. Le SDK separe ces deux notions dans le type `DiplomeEtAutorisation` : si le code diplome est vide, le champ `diplome` est `null` ; de meme pour l'autorisation.

### Colonnes

#### Identification

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identifiant PP` | Numero RPPS a 11 chiffres | Cle de filtre (non mappe dans le type de sortie) |

#### Diplome

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Code type diplome obtenu` | Type de diplome (DE, CES, DES, DESC...) | `Diplome.typeDiplome.code` |
| `Libelle type diplome obtenu` | Libelle du type de diplome | `Diplome.typeDiplome.libelle` |
| `Code diplome obtenu` | Code specifique du diplome | `Diplome.diplome.code` |
| `Libelle diplome obtenu` | Intitule complet du diplome | `Diplome.diplome.libelle` |

#### Autorisation

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Code type autorisation` | Type d'autorisation (exercice, remplacement...) | `Autorisation.typeAutorisation.code` |
| `Libelle type autorisation` | Libelle du type d'autorisation | `Autorisation.typeAutorisation.libelle` |
| `Code discipline autorisation` | Discipline concernee par l'autorisation | `Autorisation.disciplineAutorisation.code` |
| `Libelle discipline autorisation` | Libelle de la discipline | `Autorisation.disciplineAutorisation.libelle` |

### Exemple de donnees

```json
{
  "diplomesEtAutorisations": [
    {
      "diplome": {
        "typeDiplome": { "code": "DE", "libelle": "Diplome d'Etat" },
        "diplome": { "code": "DE01", "libelle": "Diplome d'Etat de docteur en medecine" }
      },
      "autorisation": null
    },
    {
      "diplome": {
        "typeDiplome": { "code": "DES", "libelle": "Diplome d'Etudes Specialisees" },
        "diplome": { "code": "DES38", "libelle": "DES Medecine generale" }
      },
      "autorisation": null
    },
    {
      "diplome": null,
      "autorisation": {
        "typeAutorisation": { "code": "AE", "libelle": "Autorisation d'exercice" },
        "disciplineAutorisation": { "code": "MG", "libelle": "Medecine generale" }
      }
    }
  ]
}
```

---

## 3. Savoir-faire

| Propriete | Valeur |
|-----------|--------|
| **Source** | Annuaire Sante RPPS - data.gouv.fr |
| **Fichier d'origine** | `ps-libreacces-savoirfaire.txt` |
| **Resource ID** | `fb55f15f-bd61-4402-b551-51ef387f2fab` |
| **Volume** | environ 430 000 lignes |
| **Mise a jour** | Quotidienne |
| **Filtre SDK** | `Identifiant PP__exact={rpps}` |

Cette source detaille les savoir-faire declares par chaque praticien. Il s'agit des specialites, competences, qualifications specifiques et orientations reconnues par les instances ordinales. Un praticien peut avoir plusieurs savoir-faire (ex. un medecin generaliste avec une competence en medecine du sport).

### Colonnes

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identifiant PP` | Numero RPPS a 11 chiffres | Cle de filtre |
| `Code profession` | Code de la profession | `SavoirFaire.profession.code` |
| `Libelle profession` | Libelle de la profession | `SavoirFaire.profession.libelle` |
| `Code categorie professionnelle` | Categorie professionnelle (civil, militaire...) | `SavoirFaire.categorieProfessionnelle.code` |
| `Libelle categorie professionnelle` | Libelle de la categorie | `SavoirFaire.categorieProfessionnelle.libelle` |
| `Code type savoir-faire` | Type : specialite ordinale (S), competence (C), qualification specifique (Q), orientation (O)... | `SavoirFaire.typeSavoirFaire.code` |
| `Libelle type savoir-faire` | Libelle du type de savoir-faire | `SavoirFaire.typeSavoirFaire.libelle` |
| `Code savoir-faire` | Code du savoir-faire | `SavoirFaire.savoirFaire.code` |
| `Libelle savoir-faire` | Libelle complet du savoir-faire | `SavoirFaire.savoirFaire.libelle` |

### Exemple de donnees

```json
{
  "savoirFaire": [
    {
      "profession": { "code": "1", "libelle": "Medecin" },
      "categorieProfessionnelle": { "code": "C", "libelle": "Civil" },
      "typeSavoirFaire": { "code": "S", "libelle": "Specialite ordinale" },
      "savoirFaire": { "code": "SM26", "libelle": "Medecine generale" }
    },
    {
      "profession": { "code": "1", "libelle": "Medecin" },
      "categorieProfessionnelle": { "code": "C", "libelle": "Civil" },
      "typeSavoirFaire": { "code": "C", "libelle": "Competence" },
      "savoirFaire": { "code": "SC14", "libelle": "Medecine du sport" }
    }
  ]
}
```

---

## 4. Cartes CPS / CPF

| Propriete | Valeur |
|-----------|--------|
| **Source** | Annuaire Sante RPPS - data.gouv.fr |
| **Fichier d'origine** | `porteurs-cps-cpf.txt` |
| **Resource ID** | `210eb05e-564b-42be-994a-d1800b63e9b7` |
| **Volume** | environ 1 million de lignes |
| **Mise a jour** | Quotidienne |
| **Filtre SDK** | `Identifiant PP__exact={rpps}` |

Cette source recense les cartes de professionnel de sante (CPS) et cartes de personnel de formation (CPF) attribuees a chaque praticien. Une carte CPS permet l'authentification forte et la signature electronique dans les systemes de sante. Un praticien peut avoir plusieurs cartes (remplacement, renouvellement, opposition...).

### Colonnes

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identifiant PP` | Numero RPPS a 11 chiffres | Cle de filtre |
| `Code type de carte` | Code du type de carte (CPS, CPF, CPE...) | `CarteCps.typeCarte.code` |
| `Libelle type de carte` | Libelle du type de carte | `CarteCps.typeCarte.libelle` |
| `Numero carte` | Numero physique de la carte | `CarteCps.numeroCarte` |
| `Identifiant national contenu dans la carte` | Identifiant stocke dans la puce de la carte | `CarteCps.identifiantNationalCarte` |
| `Date debut validite` | Date de debut de validite de la carte (format AAAAMMJJ) | `CarteCps.dateDebutValidite` |
| `Date fin validite` | Date d'expiration de la carte (format AAAAMMJJ) | `CarteCps.dateFinValidite` |
| `Date opposition` | Date de mise en opposition (vide si carte active) | `CarteCps.dateOpposition` |
| `Date de mise a jour` | Derniere date de modification de l'enregistrement | `CarteCps.dateMiseAJour` |

### Exemple de donnees

```json
{
  "cartesCps": [
    {
      "typeCarte": { "code": "1", "libelle": "CPS" },
      "numeroCarte": "1234567890123456",
      "identifiantNationalCarte": "810012345678901",
      "dateDebutValidite": "20220315",
      "dateFinValidite": "20250315",
      "dateOpposition": "",
      "dateMiseAJour": "20220316"
    },
    {
      "typeCarte": { "code": "1", "libelle": "CPS" },
      "numeroCarte": "9876543210987654",
      "identifiantNationalCarte": "810012345678901",
      "dateDebutValidite": "20190101",
      "dateFinValidite": "20220101",
      "dateOpposition": "20211215",
      "dateMiseAJour": "20211215"
    }
  ]
}
```

---

## 5. MSSante

| Propriete | Valeur |
|-----------|--------|
| **Source** | Annuaire Sante RPPS - data.gouv.fr |
| **Fichier d'origine** | `extraction-correspondance-mssante.txt` |
| **Resource ID** | `afe01105-d9a1-41fe-921f-e40ea48b2ba6` |
| **Volume** | environ 542 000 lignes |
| **Mise a jour** | Quotidienne |
| **Filtre SDK** | `Identifiant PP__exact={rpps}` |

Cette source contient les boites aux lettres MSSante (Messagerie Securisee de Sante) associees a chaque praticien. MSSante est le systeme de messagerie securisee du monde de la sante en France, utilise pour les echanges de documents medicaux entre professionnels. Un praticien peut disposer de plusieurs boites (personnelle, organisationnelle, de rattachement...).

### Colonnes

#### Boite aux lettres

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identifiant PP` | Numero RPPS a 11 chiffres | Cle de filtre |
| `Type de BAL` | Type de boite : PER (personnelle), ORG (organisationnelle), APP (applicative) | `MessagerieMssante.typeBal` |
| `Adresse BAL` | Adresse email MSSante complete | `MessagerieMssante.adresseBal` |
| `Dematerialisation` | Indique si la BAL accepte les documents dematerialises (True/False) | `MessagerieMssante.dematerialisation` |
| `Code savoir-faire` | Code du savoir-faire associe a la BAL | `MessagerieMssante.savoirFaire.code` |
| `Libelle savoir-faire` | Libelle du savoir-faire | `MessagerieMssante.savoirFaire.libelle` |

#### Structure rattachee a la BAL

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `Identification Structure` | Identifiant de la structure (FINESS, SIRET...) | `MessagerieMssante.structure.identifiant` |
| `Type identifiant structure` | Type de l'identifiant (FINESS, SIRET, RPPS...) | `MessagerieMssante.structure.typeIdentifiant` |
| `Service de rattachement` | Service au sein de la structure | `MessagerieMssante.structure.serviceRattachement` |
| `Raison Sociale structure BAL` | Nom legal de la structure | `MessagerieMssante.structure.raisonSociale` |
| `Enseigne commerciale structure BAL` | Nom commercial de la structure | `MessagerieMssante.structure.enseigneCommerciale` |

#### Adresse de la structure rattachee

| Colonne data.gouv | Description | Mapping TypeScript |
|--------------------|-------------|-------------------|
| `L2COMPLEMENTLOCALISATION structure BAL` | Complement de localisation (batiment, etage...) | `MessagerieMssante.structure.adresse.complementLocalisation` |
| `L3COMPLEMENTDISTRIBUTION structure BAL` | Complement de distribution (BP, CS...) | `MessagerieMssante.structure.adresse.complementDistribution` |
| `L4NUMEROVOIE structure BAL` | Numero dans la voie | `MessagerieMssante.structure.adresse.numeroVoie` |
| `L4COMPLEMENTNUMEROVOIE structure BAL` | Complement numero (bis, ter...) | `MessagerieMssante.structure.adresse.complementNumeroVoie` |
| `NL4TYPEVOIE structure BAL` | Type de voie (R, AV, BD...) | `MessagerieMssante.structure.adresse.typeVoie` |
| `L4LIBELLEVOIE structure BAL` | Nom de la voie | `MessagerieMssante.structure.adresse.libelleVoie` |
| `L5LIEUDITMENTION structure BAL` | Lieu-dit ou mention speciale | `MessagerieMssante.structure.adresse.lieuDit` |
| `L6LIGNEACHEMINEMENT structure BAL` | Ligne d'acheminement postal | `MessagerieMssante.structure.adresse.ligneAcheminement` |
| `Code postal structure BAL` | Code postal (5 chiffres) | `MessagerieMssante.structure.adresse.codePostal` |
| `Departement structure BAL` | Code departement | `MessagerieMssante.structure.adresse.departement` |
| `Pays structure BAL` | Code pays | `MessagerieMssante.structure.adresse.pays` |

### Exemple de donnees

```json
{
  "messageriesMssante": [
    {
      "typeBal": "PER",
      "adresseBal": "jean.dupont@medecin.mssante.fr",
      "dematerialisation": true,
      "savoirFaire": { "code": "SM26", "libelle": "Medecine generale" },
      "structure": {
        "identifiant": "12345678901234",
        "typeIdentifiant": "SIRET",
        "serviceRattachement": "",
        "raisonSociale": "CABINET MEDICAL DUPONT",
        "enseigneCommerciale": "",
        "adresse": {
          "complementLocalisation": "",
          "complementDistribution": "",
          "numeroVoie": "12",
          "complementNumeroVoie": "",
          "typeVoie": "R",
          "libelleVoie": "DE LA PAIX",
          "lieuDit": "",
          "ligneAcheminement": "75002 PARIS",
          "codePostal": "75002",
          "departement": "75",
          "pays": "99100"
        }
      }
    }
  ]
}
```

---

## 6. API FHIR Annuaire Sante

| Propriete | Valeur |
|-----------|--------|
| **Source** | API FHIR R4 de l'Annuaire Sante (ANS) |
| **Standard** | HL7 FHIR R4 |
| **URL de base** | `https://gateway.api.esante.gouv.fr/fhir/v2` |
| **Authentification** | Cle API via header `ESANTE-API-KEY` |
| **Portail** | [https://portal.api.esante.gouv.fr](https://portal.api.esante.gouv.fr) |
| **Mise a jour** | Continue (temps reel) |

L'API FHIR fournit les donnees de l'Annuaire Sante au format standardise HL7 FHIR R4. Elle offre des informations structurees, normalisees, et interoperables. Le SDK l'utilise comme source complementaire pour obtenir des donnees enrichies ou des champs absents des fichiers plats.

Sans cle API, le SDK desactive automatiquement cette source. Les cinq autres sources restent pleinement fonctionnelles.

### Obtenir une cle API

1. Se rendre sur le portail Gravitee : [https://portal.api.esante.gouv.fr](https://portal.api.esante.gouv.fr)
2. Creer un compte ou se connecter
3. Souscrire a l'API "Annuaire Sante FHIR" (plan gratuit disponible)
4. Generer une cle d'application
5. Recuperer la valeur de la cle (format : chaine alphanumérique)
6. La passer au SDK via l'option `fhirApiKey`

```typescript
const client = createRppsClient({
  fhirApiKey: 'votre-cle-api-ici',
});
```

### Ressources interrogees

Le SDK interroge deux ressources FHIR pour un numero RPPS donne.

#### Practitioner

Requete : `GET /Practitioner?identifier={rpps}&_count=1`

| Champ FHIR | Description | Mapping TypeScript |
|-------------|-------------|-------------------|
| `id` | Identifiant technique FHIR | `FhirPractitioner.id` |
| `identifier` | Liste des identifiants (RPPS, ADELI...) avec systeme et type | `FhirPractitioner.identifier[]` |
| `active` | Indique si le praticien est actif | `FhirPractitioner.active` |
| `name` | Noms du praticien (famille, prenom, prefixe, suffixe, usage) | `FhirPractitioner.name[]` |
| `telecom` | Coordonnees (telephone, email, fax) avec systeme et usage | `FhirPractitioner.telecom[]` |
| `qualification` | Diplomes et qualifications avec codes et identifiants | `FhirPractitioner.qualification[]` |

#### PractitionerRole

Requete : `GET /PractitionerRole?practitioner={id}&_count=50`

Cette ressource decrit les roles professionnels, c'est-a-dire les activites du praticien dans differentes structures. Elle n'est interrogee que si le Practitioner a ete trouve.

| Champ FHIR | Description | Mapping TypeScript |
|-------------|-------------|-------------------|
| `id` | Identifiant technique FHIR | `FhirPractitionerRole.id` |
| `practitioner` | Reference vers le Practitioner | `FhirPractitionerRole.practitioner` |
| `organization` | Reference et nom de l'organisation | `FhirPractitionerRole.organization` |
| `code` | Codes de profession et de categorie | `FhirPractitionerRole.code[]` |
| `specialty` | Specialites exercees | `FhirPractitionerRole.specialty[]` |
| `location` | Lieux d'exercice | `FhirPractitionerRole.location[]` |

### Exemple de donnees

```json
{
  "fhir": {
    "practitioner": {
      "resourceType": "Practitioner",
      "id": "003-12345678901",
      "identifier": [
        {
          "system": "urn:oid:1.2.250.1.71.4.2.1",
          "value": "810012345678901",
          "type": {
            "coding": [
              {
                "system": "https://hl7.fr/ig/fhir/core/CodeSystem/fr-core-cs-v2-0203",
                "code": "IDNPS"
              }
            ]
          }
        },
        {
          "system": "urn:oid:1.2.250.1.71.4.2.1",
          "value": "12345678901",
          "type": {
            "coding": [
              {
                "system": "https://hl7.fr/ig/fhir/core/CodeSystem/fr-core-cs-v2-0203",
                "code": "RPPS"
              }
            ]
          }
        }
      ],
      "active": true,
      "name": [
        {
          "use": "official",
          "family": "DUPONT",
          "given": ["Jean"],
          "prefix": ["DR"]
        }
      ],
      "telecom": [
        {
          "system": "phone",
          "value": "0145678901",
          "use": "work"
        }
      ],
      "qualification": [
        {
          "code": {
            "coding": [
              {
                "system": "urn:oid:1.2.250.1.213.1.6.1.118",
                "code": "SM26",
                "display": "Medecine generale"
              }
            ],
            "text": "Medecine generale"
          }
        }
      ]
    },
    "practitionerRoles": [
      {
        "resourceType": "PractitionerRole",
        "id": "role-001",
        "practitioner": {
          "reference": "Practitioner/003-12345678901"
        },
        "organization": {
          "reference": "Organization/org-456",
          "display": "CABINET MEDICAL DUPONT"
        },
        "code": [
          {
            "coding": [
              {
                "system": "urn:oid:1.2.250.1.213.1.6.1.4",
                "code": "1",
                "display": "Medecin"
              }
            ]
          }
        ],
        "specialty": [
          {
            "coding": [
              {
                "system": "urn:oid:1.2.250.1.213.1.6.1.118",
                "code": "SM26",
                "display": "Medecine generale"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Recapitulatif des sources

| Source | Resource ID | Volume | API | Authentification |
|--------|-------------|--------|-----|-----------------|
| Personne-Activite | `fffda7e9-0ea2-4c35-bba0-4496f3af935d` | 2.2M lignes | Tabular data.gouv.fr | Aucune |
| Diplomes | `41ae70ac-90c8-4c4e-8644-4ef1b100f045` | 2.2M lignes | Tabular data.gouv.fr | Aucune |
| Savoir-faire | `fb55f15f-bd61-4402-b551-51ef387f2fab` | 430K lignes | Tabular data.gouv.fr | Aucune |
| Cartes CPS/CPF | `210eb05e-564b-42be-994a-d1800b63e9b7` | 1M lignes | Tabular data.gouv.fr | Aucune |
| MSSante | `afe01105-d9a1-41fe-921f-e40ea48b2ba6` | 542K lignes | Tabular data.gouv.fr | Aucune |
| FHIR | N/A | Temps reel | FHIR R4 ANS | Cle API (ESANTE-API-KEY) |

Toutes les sources Tabular sont interrogeables sans authentification et mises a jour quotidiennement. La source FHIR necessite une cle API gratuite et fournit des donnees en temps reel.

### URLs de base par defaut

| Source | URL |
|--------|-----|
| Tabular API | `https://tabular-api.data.gouv.fr/api/resources/{resource_id}/data/` |
| FHIR API | `https://gateway.api.esante.gouv.fr/fhir/v2/` |
