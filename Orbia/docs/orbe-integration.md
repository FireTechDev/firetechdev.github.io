# Notes d'integration Orbe

## Observations techniques

Constat releve le `11 juin 2026` :

- application chargee depuis `https://orbe.aum.bio/#/login`
- SPA `Angular 19.2.14`
- routes observees dans le bundle principal :
  - `homepage`
  - `notifications/manual`
  - `planning/my-planning`
  - `operations/:id`
- navigation interne basee sur le hash router

## Consequence pour la PWA

Une surcouche mobile autonome ne doit pas dependre du DOM existant d'Orbe si elle doit tenir dans le temps.

La bonne separation est :

- `frontend PWA` pour le rendu mobile
- `proxy serveur` pour la session et la traduction des donnees Orbe

## Pourquoi un proxy est prefere

Comme aucune session exploitable n'a ete vue en `localStorage` ou `sessionStorage`, il est probable que l'authentification passe par des mecanismes non directement reutilisables depuis un frontend externe.

Le proxy permet de :

- centraliser la connexion Orbe
- conserver les cookies ou secrets de session cote serveur
- exposer des DTO stables pour l'UI mobile
- eviter de coupler l'app mobile au HTML et aux composants Angular existants

## Strategie de mapping conseillee

### Ecran 1

- source Orbe : `homepage`
- cible Orbia : `Cartes`
- objectif UI : lecture courte, priorites, centres sous tension, indicateurs de disponibilite

### Ecran 2

- source Orbe : `notifications/manual`
- cible Orbia : `Notifications`
- objectif UI : flux vertical simple, priorisation, actions evidentes

### Ecran 3

- source Orbe : `planning/my-planning`
- cible Orbia : `Planning`
- objectif UI : prochain service, timeline, changements critiques
