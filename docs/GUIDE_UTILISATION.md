# Guide d'Utilisation - TaïTaï

## Table des Matières
1. [Introduction](#introduction)
2. [Partie Client](#partie-client)
3. [Partie Admin](#partie-admin)
4. [FAQ](#faq)

---

## Introduction

**TaïTaï** est une plateforme de commande de nourriture en ligne qui permet aux clients de commander des plats créoles et aux administrateurs de gérer les commandes, le menu, et les opérations du restaurant.

### Accès au Site
- **Site Client:** `https://votre-domaine.com`
- **Interface Admin:** `https://votre-domaine.com/admin`

---

## Partie Client

### 1. Page d'Accueil (`/`)

La page d'accueil présente:
- **Bannière principale** avec le slogan et les boutons d'action rapide
- **Catégories de plats** (Healthy, Fast food) - cliquez pour filtrer le menu
- **Plats populaires** - les meilleures ventes du restaurant
- **Section avis clients** - témoignages et notation
- **Formulaire de review** - laissez votre avis (connecté requis)

**Actions disponibles:**
- Cliquer sur "Kòmande kounye a" pour accéder au menu complet
- Cliquer sur "Swiv kòmann mwen" pour suivre vos commandes
- Parcourir les catégories pour découvrir les plats

### 2. Menu (`/menu`)

Le menu affiche tous les plats disponibles avec:
- **Image du plat**
- **Nom et description**
- **Prix en HTG**
- **Temps de préparation**
- **Jour de disponibilité** (si applicable)
- **Badge "PI VANN"** pour les best-sellers
- **Badge promo** si une réduction est active

**Filtres disponibles:**
- **Catégories:** Tous, Grillades, Signature, Burgers, Pâtes, Desserts, Boissons
- **Jour:** Tous, Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche
- **Recherche:** Barre de recherche par nom ou description

**Indisponibilité:**
- Les plats en rupture de stock (stock = 0) apparaissent grisés
- Un badge "Pa disponib" s'affiche sur l'image
- Le bouton d'ajout au panier est désactivé

**Ajouter au panier:**
- Cliquer sur le bouton orange avec le signe "+"
- Le plat est ajouté automatiquement au panier

### 3. Panier (`/panier`)

Le panier contient:
- **Liste des articles** sélectionnés
- **Quantité** ajustable pour chaque article
- **Prix unitaire** et **prix total** par article
- **Récapitulatif des prix:**
  - Sous-total (somme des articles)
  - Frais de livraison (affichés mais non inclus dans le total)
  - Total (articles uniquement, sans frais de livraison)

**Informations de livraison:**
- **Mode de livraison:** Livraison ou Sur place (sal)
- **Adresse de livraison:** requise pour la livraison
- **Numéro de table:** requis pour les commandes sur place
- **Zone de livraison:** sélection de la zone
- **Instructions spéciales:** notes pour la commande

**Actions:**
- Modifier les quantités
- Supprimer des articles
- Passer la commande (bouton "Pase kòmann")

### 4. Suivi de Commande (`/suivi`)

Permet de suivre les commandes en cours:
- **Numéro de commande**
- **Statut:** En attente, Confirmée, En préparation, En livraison, Livrée, Annulée
- **Articles commandés**
- **Adresse de livraison** ou numéro de table
- **Montant total**
- **Date et heure de commande**

**Mise à jour automatique:** Le statut se met à jour en temps réel

### 5. Historique (`/historique`)

Affiche toutes les commandes passées:
- **Liste chronologique** des commandes
- **Détails de chaque commande** (articles, prix, statut)
- **Filtres par période** (si applicable)
- **Accès au reçu PDF** pour chaque commande

### 6. Confirmation (`/confirmation/[id]`)

Page de confirmation après commande:
- **Numéro de commande**
- **Récapitulatif des articles**
- **Adresse de livraison** confirmée
- **Montant total payé**
- **Statut initial:** En attente
- **Instructions:** "Préparez-vous à recevoir votre commande"

### 7. Contact (`/contact`)

Formulaire de contact pour:
- **Questions générales**
- **Réclamations**
- **Suggestions**
- **Demandes spéciales**

### 8. Authentification

#### Inscription (`signup`)
- **Nom complet**
- **Téléphone** (unique)
- **Email** (unique)
- **Mot de passe** (min 8 caractères, avec majuscule, minuscule, chiffre, caractère spécial)
- **Adresse complète**
- **Ville** (sélection dans une liste)
- **Département** (sélection)

#### Connexion (`login`)
- **Email**
- **Mot de passe**

#### Mot de passe oublié (`reset`)
- **Email**
- **Nouveau mot de passe**
- **Confirmation du mot de passe**

**Menu utilisateur (connecté):**
- Affiche le nom et les initiales
- Informations du compte (téléphone, email, adresse)
- Bouton "Dekonekte" pour se déconnecter

---

## Partie Admin

### Accès Admin

L'interface admin est accessible via `/admin` et nécessite une authentification administrateur.

### 1. Dashboard (`/admin/dashboard`)

Vue d'ensemble des statistiques:
- **Commandes en attente** - nombre de commandes à traiter
- **Commandes du jour** - statistiques journalières
- **Revenus** - chiffre d'affaires
- **Plats populaires** - top des ventes
- **Graphiques** - évolution des commandes

### 2. Gestion des Commandes (`/admin/commandes`)

Liste de toutes les commandes avec:
- **Numéro de commande**
- **Client** (nom, téléphone, email)
- **Adresse de livraison** / numéro de table
- **Articles commandés** (détails)
- **Montant total**
- **Statut** (avec possibilité de modification)
- **Méthode de paiement**
- **Preuve de paiement** (si applicable)
- **Date et heure**

**Actions disponibles:**
- **Voir détails** - modal avec informations complètes
- **Changer le statut** - mettre à jour l'état de la commande
- **Envoyer le reçu** - envoyer le reçu PDF par email au client
- **Filtrer** par statut (En attente, Confirmée, etc.)

### 3. Gestion du Menu (`/admin/menu-admin`)

Interface de gestion des plats:

**Ajouter un plat:**
- **Nom du plat**
- **Catégorie** (Grillades, Signature, Burgers, Pâtes, Desserts, Boissons)
- **Description**
- **Prix** (en HTG)
- **Image** (upload)
- **Temps de préparation** (en minutes)
- **Jour de disponibilité** (optionnel)
- **Disponible** (oui/non)
- **Best-seller** (marquer comme populaire)
- **Stock** (quantité disponible)

**Modifier/Supprimer:**
- Éditer les informations du plat
- Mettre à jour le stock
- Activer/désactiver la disponibilité
- Supprimer le plat (soft delete)

### 4. Gestion des Stocks (`/admin/stocks`)

Vue dédiée à la gestion des inventaires:
- **Liste des plats** avec stock actuel
- **Quantité en stock** pour chaque plat
- **Alertes** pour les stocks bas
- **Mise à jour rapide** des quantités
- **Historique** des mouvements de stock

**Actions:**
- Augmenter/diminuer le stock
- Définir un stock spécifique
- Marquer comme "en rupture"

### 5. Gestion des Fournisseurs (`/admin/fournisseurs`)

Gestion des fournisseurs d'ingrédients:
- **Nom du fournisseur**
- **Numéro de téléphone**
- **Adresse**
- **Photo/Justificatif** (upload, max 5MB)
- **Date d'ajout**

**Actions:**
- Ajouter un nouveau fournisseur
- Voir le document/photo du fournisseur
- Exporter la liste en Excel
- Actualiser la liste

**Limite de fichier:** 5 MB maximum pour les uploads de photos/documents

### 6. Modération des Avis (`/admin/moderation`)

Gestion des avis clients:
- **Liste des avis** soumis
- **Nom du client**
- **Note** (1-5 étoiles)
- **Commentaire**
- **Date de soumission**
- **Statut:** En attente / Approuvé

**Actions:**
- **Approuver** un avis (il apparaîtra sur le site)
- **Rejeter** un avis (il restera en attente)
- **Supprimer** définitivement un avis

### 7. Gestion des Reçus (`/admin/recherche-recu`)

Recherche et gestion des reçus:
- **Recherche par:** numéro de commande, nom de client, email, date
- **Liste des commandes** correspondant aux critères
- **Aperçu du reçu** (PDF)
- **Envoyer par email** - envoi automatique du reçu au client

**Informations du reçu:**
- Numéro de facture
- Date d'émission
- Détails du restaurant (nom, téléphone, email)
- Détails du client (nom, téléphone, email, mode de service)
- Liste des articles commandés
- Récapitulatif des prix (sous-total, frais de livraison, total)
- Note de remerciement

### 8. Validation des Commandes (`/admin/validation-commandes`)

Interface de validation des paiements:
- **Commandes en attente** de validation
- **Preuve de paiement** (image/PDF)
- **Montant payé**
- **Méthode de paiement**

**Actions:**
- Voir la preuve de paiement (agrandissement)
- Valider la commande (changer le statut)
- Rejeter la commande (avec motif)
- Confirmer et notifier le client

---

## FAQ

### Questions Fréquentes - Clients

**Q: Comment passer une commande?**
R: Parcourez le menu, ajoutez des articles au panier, puis cliquez sur "Pase kòmann" et remplissez vos informations de livraison.

**Q: Quels modes de paiement sont acceptés?**
R: Les paiements se font en ligne. Vous devrez envoyer une preuve de paiement lors de la commande.

**Q: Comment suivre ma commande?**
R: Allez dans "Swiv kòmann mwen" ou consultez vos emails pour les mises à jour.

**Q: Puis-je annuler ma commande?**
R: Contactez le restaurant directement. Les annulations sont possibles si la commande n'a pas encore été préparée.

**Q: Pourquoi un plat est-il grisé?**
R: Le plat est en rupture de stock (stock = 0) et n'est pas disponible pour le moment.

**Q: Comment laisser un avis?**
R: Connectez-vous à votre compte, puis utilisez le formulaire "Lèsè yon avi" en bas de la page d'accueil.

### Questions Fréquentes - Administrateurs

**Q: Comment ajouter un nouveau plat au menu?**
R: Allez dans Menu Admin → "Ajouter un plat" et remplissez le formulaire avec tous les détails.

**Q: Comment gérer les stocks?**
R: Utilisez la page "Stocks" pour mettre à jour les quantités. Le système alerte automatiquement en cas de stock bas.

**Q: Comment valider une commande?**
R: Allez dans "Validation des commandes", vérifiez la preuve de paiement, puis validez ou rejetez.

**Q: Comment envoyer un reçu à un client?**
R: Dans "Gestion des reçus", recherchez la commande, cliquez sur "Vue", puis "Envoyer le reçu".

**Q: Quelle est la taille maximale pour les fichiers?**
R: 5 MB pour les photos de fournisseurs et documents.

**Q: Comment exporter les données?**
R: Utilisez le bouton "Exporter Excel" disponible sur plusieurs pages (fournisseurs, commandes, etc.).

---

## Support

Pour toute assistance technique ou question:
- **Email:** contact@taitai.com
- **Téléphone:** +509 XXXX-XXXX
- **Adresse:** [Adresse du restaurant]

---

## Notes Techniques

### Technologies Utilisées
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Supabase (Base de données, Storage, Auth)
- **PDF:** pdf-lib pour la génération de reçus
- **Export:** Excel export pour les rapports

### Navigateurs Supportés
- Chrome (recommandé)
- Firefox
- Safari
- Edge

### Performance
- Images optimisées avec Next.js Image
- Chargement différé (lazy loading)
- Mise en cache des ressources

---

**Dernière mise à jour:** Juillet 2025  
**Version:** 1.0.0