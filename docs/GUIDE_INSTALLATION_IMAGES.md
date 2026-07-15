# Guide d'installation - Fonctionnalités du système

## Résumé des modifications

Ce guide vous explique comment configurer les nouvelles fonctionnalités du système TaïTaï :

1. **Upload d'images pour les plats** (avec ou sans Supabase Pro)
2. **Gestion dynamique des prix de livraison** depuis le dashboard admin

## Fichiers modifiés/créés

1. **`src/app/api/uploads/menu-image/route.ts`** - API d'upload d'images (créé)
2. **`database/create-menu-images-bucket.sql`** - Script SQL pour le bucket Supabase (créé)
3. **`src/lib/data.ts`** - Corrigé l'incohérence `image` → `image_url`
4. **`src/app/(admin)/menu-admin/page.tsx`** - Ajouté option URL externe + corrigé incohérence
5. **`src/components/dashboard/MenuGrid.tsx`** - Corrigé l'incohérence `image` → `image_url`

## Deux méthodes pour ajouter des images

### Méthode 1 : Upload vers Supabase Storage (Recommandé)

Cette méthode nécessite un bucket Supabase Storage.

#### Étape 1.1 : Créer le bucket dans Supabase

1. **Ouvrez votre projet Supabase** : https://app.supabase.com
2. **Allez dans Storage** (menu latéral gauche)
3. **Cliquez sur "New bucket"**
4. **Remplissez les informations** :
   - **Name** : `menu-images`
   - **Public bucket** : ✅ Activé
   - **File size limit** : `5242880` (5 MB)
   - **Allowed MIME types** : `image/jpeg, image/jpg, image/png, image/webp`

5. **Cliquez sur "Create bucket"**

**OU** exécutez le script SQL fourni dans `database/create-menu-images-bucket.sql` dans l'éditeur SQL de Supabase.

#### Étape 1.2 : Configurer les politiques de sécurité (RLS)

Dans Supabase, allez dans **Storage > Policies** et assurez-vous que les politiques suivantes existent pour le bucket `menu-images` :

- **SELECT** : Autoriser la lecture publique
- **INSERT** : Autoriser l'insertion (pour l'API)
- **UPDATE** : Autoriser la mise à jour
- **DELETE** : Autoriser la suppression

Si vous avez exécuté le script SQL, ces politiques sont déjà créées.

#### Étape 1.3 : Vérifier les variables d'environnement

Assurez-vous que votre fichier `.env.local` contient les variables Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### Méthode 2 : URL externe (Sans Supabase Storage)

Si vous n'avez pas Supabase Pro ou si vous préférez utiliser des images hébergées ailleurs, vous pouvez simplement utiliser des URLs externes.

**Aucune configuration supplémentaire n'est nécessaire !**

## Comment ajouter des images dans le menu admin

### Option A : Upload depuis votre ordinateur

1. **Allez dans** : http://localhost:3000/admin/menu-admin

2. **Cliquez sur "Ajouter un plat"** ou **modifiez un plat existant**

3. **Dans le formulaire** :
   - Cliquez sur la zone "Cliquez pour uploader une image"
   - Sélectionnez une image depuis votre ordinateur
   - L'aperçu s'affiche automatiquement
   - Formats acceptés : JPG, PNG, WEBP
   - Taille max : 5 MB

4. **Enregistrez le plat** :
   - Si Supabase Storage est configuré → l'image est uploadée
   - Sinon → une erreur s'affiche (passez à l'option B)

### Option B : URL externe (Alternative)

Si vous n'avez pas Supabase Storage configuré :

1. **Hébergez votre image** sur un service externe :
   - Cloudinary (gratuit jusqu'à 25 GB)
   - Imgur
   - Votre propre serveur
   - Ou tout autre service d'hébergement d'images

2. **Copiez l'URL de l'image** (ex: `https://votre-site.com/images/plat.jpg`)

3. **Dans le formulaire du plat** :
   - Descendez jusqu'à "URL de l'image (alternative)"
   - Collez l'URL de votre image
   - L'aperçu s'affiche automatiquement

4. **Enregistrez le plat** :
   - L'URL est sauvegardée dans la base de données
   - L'image s'affiche sur le site client

## Tester l'application

1. **Démarrez votre application** :
   ```bash
   npm run dev
   ```

2. **Allez dans** : http://localhost:3000/admin/menu-admin

3. **Ajoutez ou modifiez un plat** avec une image (upload ou URL)

4. **Vérifiez sur le site client** : http://localhost:3000/menu
   - Les images doivent s'afficher correctement

## Résolution des problèmes courants

### Erreur : "Upload échoué: bucket not found"

**Solution** : Le bucket `menu-images` n'existe pas dans Supabase. Utilisez l'Option B (URL externe) ou suivez l'Étape 1.1.

### Erreur : "Permission denied"

**Solution** : Les politiques RLS ne sont pas configurées. Utilisez l'Option B (URL externe) ou suivez l'Étape 1.2.

### Erreur : "Aucun fichier fourni"

**Solution** : Vérifiez que vous avez bien sélectionné un fichier avant de soumettre.

### L'image ne s'affiche pas après l'upload

**Solutions possibles** :
1. **Si upload Supabase** : Vérifiez que le bucket est public
2. **Si URL externe** : Vérifiez que l'URL est accessible publiquement
3. Vérifiez l'URL de l'image dans la base de données (table `menu_items`, colonne `image_url`)
4. Vérifiez la console du navigateur pour les erreurs CORS

### L'upload Supabase ne fonctionne pas

**Solution temporaire** : Utilisez l'Option B (URL externe) en attendant de configurer Supabase Storage.

## Structure du stockage

Les images sont stockées dans le bucket `menu-images` avec le format de nom :

```
menu-images/menu_[timestamp]_[random].jpg
```

Exemple : `menu-images/menu_1718400000000_abc123.jpg`

## Notes importantes

- **Pas de fonctionnalité "modifier commande"** : Cette fonctionnalité n'existait pas dans le code, donc rien n'a été supprimé.
- **Cohérence des types** : Toutes les références à `image` ont été remplacées par `image_url` pour correspondre au schéma de la base de données.
- **Deux méthodes disponibles** : Upload Supabase ou URL externe, au choix !
- **Sans Supabase Pro** : Utilisez simplement des URLs externes (Option B), c'est gratuit et fonctionnel.
- **Sauvegarde** : Si vous utilisez Supabase Storage, pensez à sauvegarder vos images régulièrement.

## Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs de la console navigateur (F12)
2. Les logs du serveur Next.js
3. Les logs Supabase (Dashboard > Logs)

## Prochaines étapes possibles

- Ajouter un système de redimensionnement d'images
- Ajouter des filtres/effets sur les images
- Permettre la suppression d'images
- Ajouter un aperçu en temps réel lors de l'upload

---

# Guide d'installation - Gestion des zones de livraison

## Résumé

Cette fonctionnalité permet à l'admin de gérer dynamiquement les prix de livraison depuis le dashboard. Les modifications sont automatiquement répercutées dans le panier client.

## Fichiers créés/modifiés

1. **`database/create-delivery-zones.sql`** - Script SQL pour créer la table des zones
2. **`src/components/dashboard/DeliveryManagement.tsx`** - Interface de gestion des zones
3. **`src/app/(admin)/dashboard/page.tsx`** - Intégration dans le dashboard
4. **`src/app/(client)/panier/page.tsx`** - Chargement dynamique des zones

## Installation

### Étape 1 : Créer la table des zones de livraison

1. **Ouvrez Supabase** : https://app.supabase.com
2. **Allez dans SQL Editor**
3. **Exécutez le script** `database/create-delivery-zones.sql`

Ce script va :
- Créer la table `delivery_zones`
- Insérer les 12 zones par défaut avec leurs prix
- Configurer les politiques RLS (lecture publique, modification admin)
- Créer un trigger pour mettre à jour automatiquement `updated_at`

### Étape 2 : Vérifier les politiques RLS

Assurez-vous que les politiques suivantes existent pour la table `delivery_zones` :

- **SELECT** : Lecture publique (pour que le panier client fonctionne)
- **INSERT/UPDATE/DELETE** : Modifications autorisées (pour l'admin)

Si vous avez exécuté le script SQL, ces politiques sont déjà créées.

### Étape 3 : Tester la fonctionnalité

1. **Démarrez votre application** :
   ```bash
   npm run dev
   ```

2. **Allez dans le dashboard admin** : http://localhost:3000/admin/dashboard

3. **Scrollez vers la section "Gestion des zones de livraison"**

4. **Testez les fonctionnalités** :
   - Ajoutez une nouvelle zone
   - Modifiez le prix d'une zone existante
   - Désactivez/activez une zone
   - Supprimez une zone

5. **Vérifiez dans le panier client** : http://localhost:3000/menu
   - Les nouvelles zones et prix doivent apparaître automatiquement
   - Pas besoin de recharger la page

## Fonctionnalités

### Dashboard Admin

**Ajouter une zone** :
- Code de la zone (ex: "Tabarre")
- Label (ex: "Tabarre - 750 HTG")
- Frais de livraison en HTG
- Département

**Modifier une zone** :
- Modifiez le label directement dans le tableau
- Modifiez le prix directement dans le tableau
- Activez/désactivez la zone avec le bouton statut

**Supprimer une zone** :
- Cliquez sur l'icône corbeille
- Confirmez la suppression

### Panier Client

**Chargement automatique** :
- Les zones sont chargées depuis Supabase au démarrage
- Si Supabase n'est pas disponible, fallback sur les valeurs par défaut
- Mise à jour en temps réel lors des modifications admin

**Affichage** :
- Liste déroulante avec toutes les zones actives
- Affichage du prix de livraison
- Calcul automatique du total

## Structure de la table

```sql
delivery_zones (
  id UUID PRIMARY KEY,
  zone TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  frais INTEGER NOT NULL,
  departement TEXT NOT NULL DEFAULT 'Ouest',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## Zones par défaut

| Zone | Frais HTG | Département |
|------|-----------|-------------|
| PV | 300 | Ouest |
| Puits B | 300 | Ouest |
| Routes Freres | 300 | Ouest |
| Delmas | 350 | Ouest |
| Limite Turgeau | 400 | Ouest |
| Centre Ville | 500 | Ouest |
| Rte Aeroport | 500 | Ouest |
| Cazeau | 500 | Ouest |
| Gerald Bataille | 500 | Ouest |
| Tabarre | 875 | Ouest |
| Clercine | 875 | Ouest |
| Thomassin | 875 | Ouest |

## Notes importantes

- **Synchronisation automatique** : Les modifications dans le dashboard sont immédiatement visibles dans le panier client
- **Zones inactives** : Les zones désactivées n'apparaissent pas dans le panier client
- **Fallback** : Si Supabase est indisponible, le panier utilise les valeurs par défaut codées en dur
- **Départements** : Seul le département "Ouest" permet la livraison pour le moment

## Dépannage

### Les zones ne s'affichent pas dans le panier

**Vérifications** :
1. La table `delivery_zones` existe dans Supabase
2. Les politiques RLS sont configurées
3. Les zones ont `active = true`
4. Console navigateur (F12) pour les erreurs

### Les modifications ne sont pas sauvegardées

**Vérifications** :
1. Vous êtes connecté en tant qu'admin
2. Les politiques UPDATE/INSERT sont autorisées
3. Pas d'erreur dans la console

### Erreur de connexion Supabase

**Solution temporaire** : Le panier utilisera automatiquement les zones par défaut.

## Évolutions possibles

- Ajouter des zones par département (actuellement seul Ouest est actif)
- Gérer des horaires de livraison par zone
- Ajouter des frais supplémentaires pour les zones éloignées
- Importer/exporter les zones en CSV
- Historique des modifications de prix
