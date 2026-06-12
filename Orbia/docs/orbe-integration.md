# Notes d'integration Orbe

## Architecture retenue

La vraie PWA s'appuie sur deux briques :

- un `frontend PWA` mobile-first
- un `BFF` Orbia qui relaie la session Orbe et reformate les donnees

Le backend vit dans [server/orbe-bff.mjs](/Users/tael/Documents/Orbia/work-orbia/server/orbe-bff.mjs).

## Pourquoi un backend est obligatoire

Constats releves le `11 juin 2026` :

- Orbe est une SPA `Angular 19`
- l'authentification passe par cookies serveur
- les appels utiles ne sont pas consommables proprement depuis un frontend externe pur
- les ecritures de planning demandent aussi la conservation du jeton `XSRF`

Conclusion : `GitHub Pages` seul ne suffit pas pour la vraie data.

## Endpoints Orbe utilises

Lecture :

- `POST /api/auth/cookie`
- `GET /api/me/user/details`
- `GET /api/me/centers`
- `GET /api/me/centers/:id/details`
- `GET /api/me/operations`
- `GET /api/me/planning`
- `GET /api/nexsis/v1/disponibilites/en-cours`
- `GET /api/me/planning/date-limits`

Ecriture :

- `POST /api/nexsis/v1/disponibilites/demande`
- `DELETE /api/me/planning/entry/:id`

Payload officiel observe dans le service Angular Orbe pour `POST /api/nexsis/v1/disponibilites/demande` :

```json
{
  "dateDeDebut": "2026-06-11T16:52:00.000Z",
  "dateDeFin": "2026-06-11T20:52:00.000Z",
  "idPositionAdministrative": null,
  "idAffectation": "uuid-affectation",
  "etatDisponibilite": "INDISPONIBLE_0"
}
```

## DTO exposes au frontend

Le frontend ne parle plus directement le modele Orbe brut. Le BFF expose des DTO centres sur l'usage mobile :

- `dashboard`
- `interventions`
- `planning`

L'objectif est d'avoir des objets stables, plus faciles a faire evoluer cote UI.

## Limites connues a ce stade

- le flux `planning/quick-shift` utilise le payload officiel Orbe observe dans les bundles publics le 11 juin 2026
- le comptage `24 h` et la carte des inters reposent sur `GET /api/me/operations`, qui depend des droits reels du compte connecte
- pour un deploiement public hors localhost, il faudra heberger le BFF sur un host HTTPS si le frontend reste sur un domaine distinct
