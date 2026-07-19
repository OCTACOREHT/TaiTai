# Guide du système de notifications admin

## Vue d'ensemble

Le système de notifications permet aux administrateurs de recevoir des alertes en temps réel pour :
- 🛒 Nouvelles commandes
- 💬 Commentaires à modérer
- ⚠️ Stocks critiques (rupture)
- ⚠️ Stocks faibles (≤ 5 unités)

## Installation

### Étape 1 : Créer la table des notifications

1. Ouvrez Supabase Dashboard
2. Allez dans **SQL Editor**
3. Exécutez le script `database/create-notifications-table.sql`

Cela va créer :
- La table `notifications`
- Les triggers pour les nouvelles commandes
- Les triggers pour les stocks critiques et faibles
- Un index pour améliorer les performances

### Étape 2 : Vérifier les triggers

Les triggers suivants sont automatiquement créés :

1. **trigger_notify_new_order** : Se déclenche après chaque nouvelle commande
2. **trigger_notify_stock_critical** : Se déclenche quand un stock passe à 0
3. **trigger_notify_stock_low** : Se déclenche quand un stock passe à ≤ 5

### Étape 3 : Tester le système

1. **Tester une nouvelle commande** :
   - Créez une commande depuis le site client
   - Une notification apparaît dans le sidebar admin

2. **Tester un stock critique** :
   - Allez dans `/stocks`
   - Modifiez un stock à 0
   - Une notification "Stock critique" apparaît

3. **Tester un stock faible** :
   - Modifiez un stock à 5 ou moins
   - Une notification "Stock faible" apparaît

## Fonctionnalités

### Badge de notification

- **Icône Bell** dans le sidebar admin
- **Badge rouge** avec le nombre de notifications non lues
- Affiche "9+" si plus de 9 notifications

### Panneau de notifications

Cliquez sur l'icône Bell pour ouvrir le panneau :

- **Notifications non lues** : Fond bleu clair
- **Notifications lues** : Fond blanc
- **Couleurs par type** :
  - 🟢 Vert : Nouvelle commande
  - 🔵 Bleu : Commentaire à modérer
  - 🔴 Rouge : Stock critique
  - 🟠 Orange : Stock faible

### Actions disponibles

- **Marquer comme lu** : Cliquez sur une notification
- **Tout marquer lu** : Bouton en haut à droite
- **Accéder à la page** : Cliquez sur le lien de la notification

## Types de notifications

### 1. Nouvelle commande (`order`)

**Déclencheur** : Nouvelle commande créée
**Titre** : "Nouvelle commande"
**Message** : "Commande #TT-12345 - Jean Dupont - 2500 HTG"
**Lien** : `/commandes`

### 2. Commentaire à modérer (`comment`)

**Déclencheur** : À implémenter dans le système de commentaires
**Titre** : "Nouveau commentaire"
**Message** : "Commentaire de Jean Dupont sur Burger TaïTaï"
**Lien** : `/moderation`

### 3. Stock critique (`stock_critical`)

**Déclencheur** : Stock passe à 0
**Titre** : "Stock critique"
**Message** : "Rupture de stock: Poulet Grillé"
**Lien** : `/stocks`

### 4. Stock faible (`stock_low`)

**Déclencheur** : Stock passe à ≤ 5
**Titre** : "Stock faible"
**Message** : "Stock bas: Burger TaïTaï (3 restants)"
**Lien** : `/stocks`

## Architecture technique

### Context API

```typescript
// src/context/NotificationContext.tsx
export interface Notification {
  id: string;
  type: "order" | "comment" | "stock_critical" | "stock_low";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}
```

### Realtime subscription

```typescript
// Écoute les nouvelles notifications en temps réel
const channel = supabase
  .channel("notifications-realtime")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "notifications",
  }, (payload) => {
    // Ajoute la notification à la liste
  })
  .subscribe();
```

### Triggers SQL

```sql
-- Exemple: Trigger pour nouvelle commande
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link)
  VALUES ('order', 'Nouvelle commande', ...);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Nettoyage automatique

Les notifications sont automatiquement supprimées après 30 jours si elles sont lues :

```sql
SELECT clean_old_notifications();
```

Pour exécuter ce nettoyage périodiquement, vous pouvez créer un cron job dans Supabase.

## Personnalisation

### Ajouter un nouveau type de notification

1. **Modifiez le type** dans `NotificationContext.tsx` :
   ```typescript
   type: "order" | "comment" | "stock_critical" | "stock_low" | "nouveau_type";
   ```

2. **Ajoutez la couleur** dans `AppSidebar.tsx` :
   ```typescript
   notif.type === "nouveau_type" ? "bg-purple-500" : ...
   ```

3. **Créez le trigger SQL** dans `create-notifications-table.sql`

### Modifier le nombre de notifications affichées

Dans `AppSidebar.tsx`, ligne 165 :
```typescript
notifications.slice(0, 10).map((notif) => ...)
```

Changez `10` par le nombre souhaité.

## Dépannage

### Les notifications n'apparaissent pas

1. Vérifiez que la table `notifications` existe dans Supabase
2. Vérifiez que les triggers sont créés
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

### Les notifications ne sont pas en temps réel

1. Vérifiez que Supabase Realtime est activé
2. Vérifiez que le channel `notifications-realtime` est bien créé
3. Vérifiez les permissions RLS sur la table `notifications`

### Le badge ne s'affiche pas

1. Vérifiez que `NotificationProvider` est bien dans le layout
2. Vérifiez que `useNotifications()` est bien appelé dans `AppSidebar`
3. Vérifiez la console pour les erreurs

## Sécurité

- Les notifications sont accessibles uniquement aux admins connectés
- Le contexte est fourni uniquement dans le layout admin
- Les triggers SQL s'exécutent côté serveur (sécurisé)

## Support

Pour toute question ou problème :
1. Vérifiez la console du navigateur
2. Vérifiez les logs Supabase
3. Consultez le guide d'installation