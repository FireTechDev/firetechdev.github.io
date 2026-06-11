# Orbia

Prototype de surcouche `PWA` mobile-first pour moderniser l'interface d'Orbe sans re-ecrire son metier.

## Ce qui est deja pret

- Une `PWA` statique sans build, facile a deployer et a tester sur mobile.
- Un shell mobile avec 3 ecrans cibles :
  - `Cartes`
  - `Notifications`
  - `Planning`
- Une installation PWA avec `manifest`, `service worker`, cache offline du shell.
- Une couche d'abstraction `gateway` pour separer l'UI des donnees Orbe.
- Deux modes de donnees :
  - `mock` par defaut pour prototyper l'UX
  - `proxy` via `?mode=proxy` pour brancher un backend reel plus tard

## Lancer le prototype

Servez simplement le dossier en statique, par exemple :

```bash
cd Orbia
python3 -m http.server 4173
```

Puis ouvrez :

- `http://localhost:4173/`
- `http://localhost:4173/?mode=proxy`

## Pourquoi cette architecture

Le 11 juin 2026, l'inspection d'Orbe a montre :

- une SPA `Angular 19`
- des routes applicatives separees comme `#/index/homepage`, `#/index/notifications/manual`, `#/index/planning/my-planning`
- aucune preuve exploitable de token stocke dans `localStorage` ou `sessionStorage`

Conclusion : pour une `PWA` mobile sur un autre domaine, la solution la plus robuste est :

1. `Orbia` en frontend PWA
2. un petit backend `proxy / BFF`
3. ce backend rejoue la session Orbe et expose uniquement les donnees utiles a l'UI

## Contrat de proxy recommande

Le frontend est deja prepare pour consommer ces endpoints :

- `POST /api/session`
- `GET /api/session`
- `DELETE /api/session`
- `GET /api/dashboard`
- `GET /api/notifications`
- `GET /api/planning`

Les appels sont centralises dans [src/data/proxy-orbe-gateway.js](/Users/tael/Documents/FireTechDev/Orbia/src/data/proxy-orbe-gateway.js).

## Prochaine etape recommandee

La suite la plus utile consiste a construire le proxy reel et a mapper progressivement les 3 ecrans prioritaires d'Orbe :

1. `homepage`
2. `notifications/manual`
3. `planning/my-planning`

L'UI actuelle est deja decouplee pour brancher ces flux sans la refaire.
