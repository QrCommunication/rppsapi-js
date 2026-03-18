# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

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
