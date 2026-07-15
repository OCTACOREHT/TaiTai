# Guide d'installation - Upload d'images pour les plats

## Résumé des modifications

Ce guide vous explique comment configurer le système d'upload d'images pour les plats du menu. **Deux méthodes sont disponibles** : upload vers Supabase Storage ou utilisation d'URLs externes.

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