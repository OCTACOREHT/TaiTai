# Guide - Notification de nouvelle commande

## 🎯 Objectif

Recevoir une alerte visuelle immédiate dans le panel admin quand un client passe une commande.

## ✨ Fonctionnalités

- **Popup automatique** en haut à droite de l'écran
- **Animation** de glissement depuis la droite
- **Icône clignotante** pour attirer l'attention
- **Fermeture automatique** après 10 secondes
- **Bouton "Voir la commande"** pour accéder directement à la commande
- **Temps réel** : pas besoin de rafraîchir la page

## 🚀 Installation

### Étape 1 : Aucune installation nécessaire !

Le système fonctionne **sans base de données** ni script SQL. Il utilise directement Supabase Realtime pour écouter les nouvelles commandes.

### Étape 2 : Tester

1. Ouvrez le panel admin : `https://votre-site.com/dashboard`
2. Ouvrez un autre onglet sur le site client
3. Passez une commande
4. **Une popup verte apparaît immédiatement** dans le panel admin !

## 📱 Comment ça marche

### Popup de notification

Quand une nouvelle commande est créée :

```
┌─────────────────────────────────────┐
│ 🔔 NOUVELLE COMMANDE !            ✕ │
├─────────────────────────────────────┤
│ 🛒 Commande #TT-12345              │
│ Client: Jean Dupont                 │
│ 2500 HTG                           │
│ 14:32                               │
│                                     │
│ [    Voir la commande    ]          │
└─────────────────────────────────────┘
```

### Actions possibles

- **Cliquer sur "Voir la commande"** : Redirige vers `/commandes`
- **Cliquer sur ✕** : Ferme la popup
- **Attendre 10 secondes** : La popup se ferme automatiquement

## 🎨 Design

- **Couleur** : Vert (pour indiquer une nouvelle commande)
- **Position** : Haut à droite de l'écran
- **Animation** : Glissement depuis la droite (0.3s)
- **Icône** : Cloche clignotante + panier

## 🔧 Dépannage

### La popup n'apparaît pas

**Vérification 1 : Supabase Realtime est activé**
1. Allez dans Supabase Dashboard
2. Settings → API
3. Vérifiez que "Realtime" est activé

**Vérification 2 : La table commandes est bien écoutée**
- Ouvrez la console du navigateur (F12)
- Cherchez "new-orders" dans les logs
- Vous devriez voir : "PostgresChanges channel subscribed"

**Vérification 3 : Testez manuellement**
```javascript
// Dans la console du navigateur (F12)
// Allez sur le panel admin, puis exécutez :

// Créer une commande test
fetch('/api/notifications/create', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    type: 'order',
    title: 'Test',
    message: 'Test notification',
    link: '/commandes'
  })
});
```

### La popup apparaît en double

Le système détecte automatiquement les doublons grâce à `lastOrderId`. Si vous voyez des doublons, vérifiez que :
- Vous n'avez pas plusieurs onglets ouverts
- Le composant n'est pas monté plusieurs fois

### La popup ne se ferme pas

Le timeout de 10 secondes devrait la fermer automatiquement. Si ce n'est pas le cas :
1. Cliquez sur ✕ pour fermer manuellement
2. Vérifiez la console pour les erreurs

## 🎯 Cas d'usage

### Restaurant qui reçoit une commande
1. Admin est sur le dashboard
2. Client passe une commande sur le site
3. **Popup apparaît immédiatement** : "NOUVELLE COMMANDE !"
4. Admin voit : numéro, client, montant, heure
5. Admin clique sur "Voir la commande"
6. Admin est redirigé vers la liste des commandes

### Admin qui travaille sur autre chose
1. Admin est en train de gérer le menu
2. Une commande arrive
3. **Popup apparaît** en haut à droite
4. Admin peut :
   - Cliquer pour voir la commande
   - Fermer et continuer son travail
   - Laisser fermer automatiquement après 10s

## 🔄 Flux technique

```
Client passe commande
    ↓
INSERT INTO commandes
    ↓
Supabase Realtime détecte l'INSERT
    ↓
Channel "new-orders" reçoit l'événement
    ↓
NewOrderNotification component reçoit le payload
    ↓
Popup s'affiche avec les détails de la commande
    ↓
Admin clique sur "Voir la commande"
    ↓
Redirection vers /commandes
```

## 📊 Avantages

✅ **Temps réel** : Pas de délai, notification immédiate  
✅ **Non intrusif** : La popup ne bloque pas le travail  
✅ **Automatique** : Pas d'action manuelle nécessaire  
✅ **Simple** : Pas de configuration complexe  
✅ **Efficace** : L'admin voit instantly les nouvelles commandes  

## 🎓 Personnalisation

### Changer la durée d'affichage

Dans `NewOrderNotification.tsx`, ligne 47 :
```typescript
setTimeout(() => {
  setShowPopup(false);
}, 10000); // 10000ms = 10 secondes
```

Changez `10000` par la durée souhaitée en millisecondes.

### Changer la position

Dans `NewOrderNotification.tsx`, ligne 73 :
```typescript
<div className="fixed top-20 right-4 z-50 animate-slide-in">
```

- `top-20` : Distance depuis le haut
- `right-4` : Distance depuis la droite

### Changer les couleurs

Dans `NewOrderNotification.tsx` :
- `border-green-500` : Couleur de la bordure
- `bg-green-50` : Couleur de fond de l'en-tête
- `text-green-800` : Couleur du titre
- `bg-green-500` : Couleur du bouton

## 📝 Notes importantes

- Le système fonctionne **uniquement quand le panel admin est ouvert**
- Si l'admin ferme le navigateur, il ne reçoit pas les notifications
- Pour recevoir des notifications 24/7, il faudrait un système de push notifications (futur)
- Les notifications ne sont pas stockées (pas d'historique)

## 🚀 Évolutions possibles

- [ ] Ajouter un son de notification
- [ ] Afficher les articles de la commande dans la popup
- [ ] Bouton "Accepter" / "Refuser" directement dans la popup
- [ ] Historique des notifications
- [ ] Notifications pour autres événements (commentaires, stocks)

## Support

Si la popup n'apparaît pas :
1. Vérifiez la console du navigateur (F12)
2. Vérifiez que Supabase Realtime est activé
3. Vérifiez que vous êtes bien sur le panel admin
4. Testez avec une commande manuelle via l'API