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

Assurez-vous que les politiques suivantes existent dans **Storage > Policies** :

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