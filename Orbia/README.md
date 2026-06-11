# Orbia

PWA mobile-first pour proposer une vraie surcouche terrain au-dessus d'Orbe, avec trois vues utiles au quotidien :

- `Centre` : liste de garde, disponibilites et armabilite
- `Inters` : carte et flux des interventions en cours
- `Ma dispo` : lecture rapide de l'etat actuel, programmation 1 a 6 h, deprogrammation

## Ce qui est livre

- Un frontend PWA statique sans build.
- Un backend Node leger (`server/orbe-bff.mjs`) qui :
  - ouvre la session Orbe cote serveur
  - conserve les cookies Orbe et le jeton XSRF
  - expose des endpoints UI simples pour le mobile
  - sert aussi la PWA en local sur le meme host
- Un mode `mock` conserve pour les demonstrations hors connexion.

## Lancer le mode reel

Depuis le dossier `work-orbia` :

```bash
npm start
```

Ou directement :

```bash
node server/orbe-bff.mjs
```

Puis ouvrir :

```text
http://127.0.0.1:8787/
```

## Lancer le mode mock

Si la PWA est servie en statique, elle reste utilisable en mode maquette :

```bash
python3 -m http.server 4173
```

Puis :

```text
http://127.0.0.1:4173/?mode=mock
```

## Endpoints exposes par le proxy

- `POST /api/session`
- `GET /api/session`
- `DELETE /api/session`
- `GET /api/dashboard?centerId=104`
- `GET /api/interventions?centerId=104`
- `GET /api/planning`
- `POST /api/planning/quick-shift`
- `DELETE /api/planning/entry/:id`

## Point important de deploiement

GitHub Pages seul ne peut pas faire tourner la vraie data Orbe :

- les cookies Orbe sont geres cote serveur
- l'API Orbe ne se laisse pas consommer proprement depuis un front externe pur
- la programmation / deprogrammation exige un relais backend

En pratique :

- `GitHub Pages` peut continuer a heberger le shell statique
- il faut un backend Node ou serverless a cote pour le mode reel
- le frontend peut viser ce backend via `?mode=proxy&apiBase=https://ton-backend/api`
