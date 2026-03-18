# Sources de donnees RPPS — Reference detaillee

## API Tabular data.gouv.fr

Base URL : `https://tabular-api.data.gouv.fr/api/resources/{resource_id}/data/`

Filtres : `?{colonne}__exact={valeur}` ou `?{colonne}__contains={valeur}`
Pagination : `page=1&page_size=100`, liens `next`/`prev` dans la reponse.
Le `contains` est insensible a la casse.

---

## 1. Personne-Activite

**Resource ID** : `fffda7e9-0ea2-4c35-bba0-4496f3af935d`
**Dataset** : Annuaire Sante RPPS (data.gouv.fr ID: `69025e6c73d1f9b79ca3c365`)
**MAJ** : quotidienne | **Lignes** : ~2.2M

### Colonnes

| Colonne | Mapping TS/PHP |
|---------|---------------|
| Identifiant PP | rpps |
| Identification nationale PP | identificationNationale |
| Code civilite / Libelle civilite | identite.civilite |
| Code civilite d'exercice / Libelle civilite d'exercice | identite.civiliteExercice |
| Nom d'exercice | identite.nomExercice |
| Prenom d'exercice | identite.prenomExercice |
| Code profession / Libelle profession | profession.code/libelle |
| Code categorie professionnelle / Libelle | profession.categorie |
| Code mode exercice / Libelle | activite.modeExercice |
| Code savoir-faire / Libelle | activite.savoirFaire |
| Code type savoir-faire / Libelle | activite.typeSavoirFaire |
| Code secteur d'activite / Libelle | activite.secteurActivite |
| Code role / Libelle role | activite.role |
| Code genre activite / Libelle | activite.genreActivite |
| Autorite d'enregistrement | activite.autoriteEnregistrement |
| Identifiant technique de la structure | structure.identifiantTechnique |
| Raison sociale site | structure.raisonSociale |
| Numero SIRET/SIREN/FINESS site | structure.numero* |
| Telephone/Telecopie/Email (coord. structure) | structure.telephone/email |
| Code postal / Libelle commune (coord. structure) | structure.adresse.* |
| Code Departement / Libelle Departement | structure.codeDepartement |

Chaque ligne = 1 activite. Un praticien peut avoir plusieurs lignes (multi-activites).

---

## 2. Diplomes & Autorisations

**Resource ID** : `41ae70ac-90c8-4c4e-8644-4ef1b100f045`
**MAJ** : quotidienne | **Lignes** : ~2.2M

| Colonne | Mapping |
|---------|---------|
| Code type diplome obtenu / Libelle | typeDiplome |
| Code diplome obtenu / Libelle | diplome |
| Code type autorisation / Libelle | typeAutorisation |
| Code discipline autorisation / Libelle | disciplineAutorisation |

Un enregistrement peut avoir un diplome, une autorisation, ou les deux. Les champs vides sont mappes a null.

---

## 3. Savoir-faire

**Resource ID** : `fb55f15f-bd61-4402-b551-51ef387f2fab`
**MAJ** : quotidienne | **Lignes** : ~430K

| Colonne | Mapping |
|---------|---------|
| Code profession / Libelle | profession |
| Code categorie professionnelle / Libelle | categorieProfessionnelle |
| Code type savoir-faire / Libelle | typeSavoirFaire |
| Code savoir-faire / Libelle | savoirFaire |

Types de savoir-faire : S (Specialite ordinale), C (Competence), CAPA (Capacite), FQ (Fonction Qualifiee).

---

## 4. Cartes CPS/CPF

**Resource ID** : `210eb05e-564b-42be-994a-d1800b63e9b7`
**MAJ** : quotidienne | **Lignes** : ~1M

| Colonne | Mapping |
|---------|---------|
| Code type de carte / Libelle | typeCarte |
| Numero carte | numeroCarte |
| Identifiant national contenu dans la carte | identifiantNationalCarte |
| Date debut validite | dateDebutValidite (YYYY-MM-DD) |
| Date fin validite | dateFinValidite |
| Date opposition | dateOpposition |
| Date de mise a jour | dateMiseAJour |

---

## 5. MSSante

**Resource ID** : `afe01105-d9a1-41fe-921f-e40ea48b2ba6`
**MAJ** : quotidienne | **Lignes** : ~542K

| Colonne | Mapping |
|---------|---------|
| Type de BAL | typeBal (PER=personnelle, ORG=organisationnelle) |
| Adresse BAL | adresseBal |
| Dematerialisation | dematerialisation (boolean) |
| Code savoir-faire / Libelle | savoirFaire |
| Identification Structure | structureIdentifiant |
| Raison Sociale structure BAL | raisonSociale |
| Code postal / Departement structure BAL | codePostal/departement |

Filtrage par Identifiant PP retourne uniquement les BAL personnelles (PER).

---

## 6. API FHIR Annuaire Sante

**Base URL** : `https://gateway.api.esante.gouv.fr/fhir/v2`
**Standard** : HL7 FHIR R4
**Auth** : Header `ESANTE-API-KEY` (cle Gravitee)

### Endpoints utilises

| Endpoint | Params | Usage |
|----------|--------|-------|
| GET /Practitioner | `identifier={rpps}&_count=1` | Recherche par RPPS |
| GET /PractitionerRole | `practitioner={id}&_count=50` | Roles du praticien |
| GET /metadata | - | CapabilityStatement |

### Donnees FHIR retournees

**Practitioner** : identifier (RPPS, IDNPS), name, telecom (MSSante), qualification (diplomes, profession, savoir-faire), smartcard extension (CPS).

**PractitionerRole** : code (profession), specialty, organization, location.
