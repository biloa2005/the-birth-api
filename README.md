# Birth API

API de gestion des actes de naissance pour le projet SIVEC.

## Description

Ce projet expose une API REST pour :
- créer des actes de naissance
- lister toutes les naissances
- récupérer une naissance par son ID
- ajouter des pièces jointes
- consulter l'historique d'une naissance
- valider un acte
- générer un PDF d'acte validé
- rechercher par numéro d'acte
- mettre à jour un acte

## Structure du projet

- `app.js` : point d'entrée Express
- `src/routes` : définitions des routes
- `src/controllers` : logique métier pour chaque route
- `src/config/prisma.js` : configuration Prisma
- `prisma/schema.prisma` : modèle de données
- `docs/swagger.yaml` : documentation OpenAPI
- `uploads/births` : dossier d'upload des fichiers

## Prérequis

- Node.js 18+ recommandé
- npm
- base de données MySQL/MariaDB
- Prisma CLI installé localement dans le projet via `npm install`

## Installation

Ouvrez un terminal dans le dossier du projet puis exécutez :

```bash
npm install
```

## Configuration de la base de données

Le projet utilise Prisma avec un provider `mysql` dans `prisma/schema.prisma`.

Ajoutez une variable d'environnement `DATABASE_URL` dans un fichier `.env` à la racine du projet, par exemple :

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Puis exécutez :

```bash
npx prisma db push
```

ou si vous avez déjà une migration configurée :

```bash
npx prisma migrate deploy
```

## Démarrage

```bash
npm run dev
```

ou en production :

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`.

## Documentation Swagger

La documentation OpenAPI est disponible à :

- `http://localhost:3000/api-docs`

Note : l'API est exposée avec le préfixe `/api`.

## Endpoints principaux

- `POST /api/births` : créer une nouvelle naissance
- `GET /api/births` : récupérer toutes les naissances
- `POST /api/births/:id` : récupérer une naissance par son ID
- `POST /api/births/:id/attachments` : ajouter une pièce jointe à une naissance
- `GET /api/births/:id/history` : récupérer l'historique d'une naissance
- `POST /api/births/:id/print` : générer le PDF d'une naissance validée
- `POST /api/births/:id/validate` : valider un acte de naissance
- `POST /api/births/search/:actNumber` : rechercher un acte par numéro
- `PUT /api/birth/:id` : mettre à jour un acte de naissance

## Upload de fichiers

L'upload de fichier utilise Multer et le champ form-data doit être nommé `file`.

Les fichiers sont stockés dans :

- `uploads/births`

## Remarques

- La route de mise à jour actuelle est définie sur `/api/birth/:id` (singulier).
- Si vous souhaitez uniformiser toutes les routes, vous pouvez renommer cette route en `/api/births/:id` dans `src/routes/updateBirth.routes.js`.

## Génération Prisma

Si nécessaire, régénérez le client Prisma avec :

```bash
npx prisma generate
```

## Licence

Projet sans licence précisée.

## lien pour la docs swagger
http://localhost:4000/api-docs/#/