# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [1.1.6] - 2026-10-16

### Modifié

- TypeScript 7.0.2 et types Node.js 26.6.5 épinglés, avec npm 12.2.0 et déclarations Undici 8.12.2.
- Suppression de Vitest inutilisé et remplacement par le runner Node natif : tests d’une vraie archive npm installée sans dépendances de développement, de ses imports ESM et de ses déclarations TypeScript strictes, sans appel aux API métier.
- Réduction du verrou à 23 résolutions aux dernières versions stables vérifiées ; graphe complet, audit toutes gravités, build, contrôle des types et trois tests du paquet validés localement.
- CI séparant la recette d’outillage sous Node 22/24/26 et les consommateurs du paquet sous Node 18/20/22/24/26, avec conservation de l’archive exacte lors du changement de runtime.
- Livraison conditionnée aux matrices de tests, à un tag stable cohérent avec le manifeste et le verrou, à la présence de son commit dans main et à une entrée de changelog unique et non vide.
- Publication du tarball testé avec `gitHead` dérivé du commit et provenance OIDC obligatoire ; une version publique existante doit correspondre au commit, au SRI et aux octets attendus avant réutilisation. Création de la GitHub Release après vérification de la publication npm.

## [1.0.1] - 2026-03-18

### Corrige

- URLs repository/homepage/bugs corrigees vers QrCommunication/rppsapi-js
- Licence corrigee : MIT → PolyForm Noncommercial 1.0.0
- Auteur : QrCommunication

## [1.0.0] - 2026-03-18

### Ajouté

- Client `RppsClient` avec méthode `getByRpps()` pour récupérer le profil complet d'un praticien
- Méthode `search()` pour rechercher par nom, prénom et/ou code postal (recherche partielle insensible à la casse)
- 6 sources de données interrogées en parallèle :
  - API FHIR Annuaire Santé (ANS) — nécessite clé Gravitee
  - Fichier personne-activité (data.gouv.fr Tabular API)
  - Fichier diplômes et autorisations (data.gouv.fr Tabular API)
  - Fichier savoir-faire (data.gouv.fr Tabular API)
  - Fichier cartes CPS/CPF (data.gouv.fr Tabular API)
  - Fichier messageries MSSanté (data.gouv.fr Tabular API)
- Types TypeScript complets pour toutes les structures de données
- Gestion d'erreurs avec `safeQuery()` — une source en erreur ne bloque pas les autres
- Validation du numéro RPPS (11 chiffres)
- Auto-désactivation de la source FHIR sans clé API
- Pagination automatique des résultats Tabular API
- Déduplications par RPPS dans les résultats de recherche
- Exemples d'utilisation (basic-usage.ts, search.ts)
- Spec OpenAPI 3.1 documentant les APIs sous-jacentes
- Documentation complète (README.md)
