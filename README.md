# TaiTai Restaurant

## Description du projet

TaiTai Restaurant est une application web de gestion et de commande de repas développée avec Next.js, TypeScript et Supabase.

L'application permet aux clients de :

* consulter le menu du restaurant ;
* ajouter des articles au panier ;
* passer une commande ;
* suivre l'état de leur commande en temps réel ;
* communiquer avec le restaurant via WhatsApp.

Elle inclut également un espace d'administration permettant de gérer les commandes, les plats, les stocks, les clients et les fournisseurs.

L'interface client est disponible en créole haïtien afin d'offrir une meilleure expérience aux utilisateurs locaux.

---

## Installation

### Prérequis

* Node.js 20 ou supérieur recommandé
* npm
* Un projet Supabase configuré

### Cloner le projet

```bash
git clone <repository-url>
cd TaiTai
```

### Installer les dépendances

```bash
npm install
```

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible à l'adresse :

```text
http://localhost:3000
```

---

## Variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
RESEND_API_KEY=
```

### Description des variables

| Variable                        | Description                                            |
| ------------------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL du projet Supabase                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase utilisable côté client           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé privée Supabase à utiliser uniquement côté serveur |
| `DATABASE_URL`                  | URL de connexion PostgreSQL utilisée côté serveur      |
| `RESEND_API_KEY`                | Clé API Resend utilisée pour l'envoi des e-mails       |

Les valeurs Supabase peuvent être récupérées dans :

```text
Supabase → Project Settings → API
```

Ne jamais publier le fichier `.env.local` ni partager les clés privées.

---

## Scripts npm

### Démarrer le projet en mode développement

```bash
npm run dev
```

### Générer la version de production

```bash
npm run build
```

### Démarrer la version de production

```bash
npm run start
```

### Vérifier la qualité du code

```bash
npm run lint
```

---

## Structure du projet

```text
src/
├── app/
│   ├── (client)/
│   │   ├── page.tsx
│   │   ├── menu/
│   │   ├── panier/
│   │   ├── suivi/
│   │   └── confirmation/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── commandes/
│   │   ├── menu-admin/
│   │   ├── stocks/
│   │   ├── clients/
│   │   └── fournisseurs/
│   └── api/
├── components/
├── context/
├── lib/
├── types/
└── app/globals.css
```

### Description des dossiers

* `app/` : pages, routes et API de l'application.
* `components/` : composants réutilisables de l'interface.
* `context/` : gestion des états globaux (authentification, panier, etc.).
* `lib/` : configuration Supabase, services et utilitaires.
* `types/` : définitions TypeScript.
* `app/globals.css` : styles globaux de l'application.

---

## Langue de l'interface

Les principaux textes visibles côté client sont traduits en créole haïtien.

Exemples :

| Français             | Créole haïtien   |
| -------------------- | ---------------- |
| Commander maintenant | Kòmande kounye a |
| Panier               | Panyen           |
| Suivi de commande    | Swivi kòmand     |
| Quantité             | Kantite          |
| Prix                 | Pri              |
| Chargement...        | Ap chaje...      |

---

## État du projet

* Interface client traduite en créole haïtien.
* README restructuré et documenté.
* Application fonctionnelle en mode développement.
* Build de production nécessite une configuration valide de `RESEND_API_KEY`.

---

## Notes

Le build de production nécessite la variable d'environnement `RESEND_API_KEY`.

Sans cette clé, la route API `/api/send-reply` ne peut pas être initialisée et la commande `npm run build` échouera.

Assurez-vous de définir une valeur valide pour `RESEND_API_KEY` dans le fichier `.env.local` avant de générer le build de production.

---

## Auteur

Projet développé pour la plateforme TaiTai Restaurant.

## Licence

Usage interne et éducatif.
