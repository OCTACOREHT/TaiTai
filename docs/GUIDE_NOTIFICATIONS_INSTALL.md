# Guide d'installation rapide - Notifications

## Installation en 3 étapes

### Étape 1 : Créer la table des notifications

1. Ouvrez **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `database/create-notifications-table.sql`
4. Cliquez sur **Run**

Vous devriez voir :
- ✅ Table `notifications` créée
- ✅ 4 triggers créés
- ✅ Index créé

### Étape 2 : Vérifier l'installation

1. Ouvrez votre navigateur
2. Allez sur `https://votre-site.com/api/notifications/setup`
3. Vous devriez voir : `{"success":true,"message":"Table notifications existe déjà"}`

Si vous voyez `needsSetup: true`, c'est que la table n'existe pas. Retournez à l'étape 1.

### Étape 3 : Tester le système

#### Test 1 : Nouvelle commande
1. Allez sur le site client
2. Passez une commande
3. Retournez sur le panel admin
4. Cliquez sur l'icône **Bell** dans le sidebar
5. Vous devriez voir : "Nouvelle commande - Commande #TT-XXXXX - Nom - XXXX HTG"

#### Test 2 : Stock critique
1. Allez dans `/stocks`
2. Modifiez un stock à **0**
3. Sauvegardez
4. Vérifiez les notifications
5. Vous devriez voir : "Stock critique - Rupture de stock: Nom du plat"

#### Test 3 : Stock faible
1. Modifiez un stock à **5** ou moins
2. Sauvegardez
3. Vérifiez les notifications
4. Vous devriez voir : "Stock faible - Stock bas: Nom du plat (X restants)"

## Dépannage

### Problème : Je ne vois pas l'icône Bell

**Solution :** Vérifiez que vous êtes bien dans le panel admin (`/admin/*`)

### Problème : Les notifications n'apparaissent pas

**Solution 1 :** Vérifiez la console du navigateur (F12)
- Si vous voyez "Table notifications n'existe pas", exécutez le script SQL

**Solution 2 :** Vérifiez que la table existe dans Supabase
- Allez dans **Table Editor**
- Cherchez la table `notifications`
- Si elle n'existe pas, exécutez le script SQL

### Problème : Le badge ne s'affiche pas

**Solution :** Vérifiez que `NotificationProvider` est dans le layout
- Fichier : `src/app/(admin)/layout.tsx`
- Doit contenir : `<NotificationProvider>`

### Problème : Les notifications ne sont pas en temps réel

**Solution 1 :** Vérifiez que Supabase Realtime est activé
- Allez dans Supabase Dashboard
- Settings → API
- Vérifiez que "Realtime" est activé

**Solution 2 :** Vérifiez les permissions RLS
- Allez dans Supabase Dashboard
- Authentication → Policies
- Vérifiez que la table `notifications` a les bonnes policies

## Vérification manuelle

### Vérifier que la table existe

```sql
-- Dans Supabase SQL Editor
SELECT * FROM public.notifications LIMIT 1;
```

### Vérifier que les triggers existent

```sql
-- Dans Supabase SQL Editor
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name LIKE 'trigger_notify_%';
```

Vous devriez voir 3 triggers :
- `trigger_notify_new_order`
- `trigger_notify_stock_critical`
- `trigger_notify_stock_low`

### Tester manuellement une notification

```sql
-- Dans Supabase SQL Editor
INSERT INTO public.notifications (type, title, message, link)
VALUES ('order', 'Test', 'Ceci est un test', '/commandes');
```

Si la notification apparaît dans le panel admin, le système fonctionne !

## Nettoyage

### Supprimer toutes les notifications

```sql
-- Dans Supabase SQL Editor
DELETE FROM public.notifications;
```

### Supprimer la table (si vous voulez désinstaller)

```sql
-- Dans Supabase SQL Editor
DROP TABLE IF EXISTS public.notifications CASCADE;
```

## Support

Si le problème persiste :

1. **Vérifiez les logs Supabase**
   - Allez dans Supabase Dashboard
   - Logs → Postgres Logs
   - Cherchez les erreurs liées à `notifications`

2. **Vérifiez la console du navigateur**
   - F12 → Console
   - Cherchez les erreurs en rouge

3. **Vérifiez les fichiers**
   - `src/context/NotificationContext.tsx` existe
   - `src/layout/AppSidebar.tsx` contient l'icône Bell
   - `src/app/(admin)/layout.tsx` contient `NotificationProvider`

## Fonctionnalités complètes

Une fois installé, vous aurez :

✅ **Badge de notification** dans le sidebar
✅ **Panneau de notifications** cliquable
✅ **Notifications en temps réel** (pas besoin de rafraîchir)
✅ **4 types de notifications** :
   - 🛒 Nouvelle commande
   - 💬 Nouveau commentaire
   - ⚠️ Stock critique (0)
   - ⚠️ Stock faible (≤ 5)

✅ **Actions disponibles** :
   - Marquer comme lu (clic)
   - Tout marquer lu (bouton)
   - Accéder à la page (clic sur lien)

✅ **Couleurs par type** :
   - 🟢 Vert : Commande
   - 🔵 Bleu : Commentaire
   - 🔴 Rouge : Stock critique
   - 🟠 Orange : Stock faible

## Prochaines étapes

1. **Personnaliser les messages** : Modifiez les triggers SQL
2. **Ajouter des types** : Ajoutez dans `NotificationContext.tsx`
3. **Modifier les couleurs** : Modifiez `AppSidebar.tsx`
4. **Ajouter des sons** : Ajoutez dans `NotificationContext.tsx`

Tout est prêt ! Profitez du système de notifications ! 🎉