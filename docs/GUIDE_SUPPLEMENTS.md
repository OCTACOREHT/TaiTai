# Guide des Suppléments - TaïTaï Restaurant

## Vue d'ensemble

Le système de suppléments permet aux clients d'ajouter des options personnalisées à leurs plats (sauces, accompagnements, etc.) directement depuis le menu en ligne.

## Architecture

### 1. Types et Modèles

**Fichier:** `src/types/restaurant.ts`

```typescript
export interface Supplement {
  id: string;
  nom: string;
  prix: number;
  disponible: boolean;
  categorie?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  original_prix?: number;
  promotion_title?: string;
  supplements?: Supplement[];
  supplements_prix_total?: number;
}
```

### 2. Base de Données

**Table:** `supplements`

```sql
CREATE TABLE public.supplements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prix INTEGER NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT true,
  categorie TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Migration:** Exécutez le fichier `database/create-supplements-table.sql` dans Supabase SQL Editor.

### 3. Fonctionnalités Côté Client

#### Page Menu (`src/app/(client)/menu/page.tsx`)

**Comportement:**
- Lorsqu'un utilisateur clique sur "Ajouter au panier" pour un plat
- Le système vérifie s'il existe des suppléments disponibles pour la catégorie du plat
- Si oui, un modal s'ouvre pour permettre la sélection des suppléments
- Si non, le plat est ajouté directement au panier

**Logique de filtrage:**
```typescript
// Les suppléments sans catégorie s'appliquent à tous les plats
// Les suppléments avec une catégorie ne s'appliquent qu'à cette catégorie
const itemSupplements = supplements.filter(s => 
  !s.categorie || s.categorie === item.categorie
);
```

**Calcul du prix:**
```typescript
const supplementsPrixTotal = selectedSupplements.reduce(
  (sum, sup) => sum + sup.prix, 
  0
);

const finalPrice = item.prix - discount + supplementsPrixTotal;
```

#### Page Panier (`src/app/(client)/panier/page.tsx`)

**Affichage:**
- Les suppléments sélectionnés sont affichés sous chaque article du panier
- Le prix total inclut automatiquement le coût des suppléments

**Exemple d'affichage:**
```
Burger Créole
1290 HTG

Akòz (Suppléments)
- Sos tomat +50 HTG
- Fromage +100 HTG
- Laitue +25 HTG
```

### 4. Gestion du Panier (`src/context/CartContext.tsx`)

**Clé unique pour les articles avec suppléments:**
```typescript
// Un article sans supplément: "item-id"
// Un article avec suppléments: "item-id-supp1-supp2-supp3"
const cartKey = supplements.length > 0 
  ? `${item.id}-${supplements.map(s => s.id).sort().join('-')}`
  : item.id;
```

**Cela permet:**
- D'avoir le même plat avec différentes combinaisons de suppléments dans le panier
- D'augmenter la quantité séparément pour chaque combinaison

### 5. Interface Admin

**Page:** `src/app/(admin)/supplements/page.tsx`

**Fonctionnalités:**
- Créer un nouveau supplément
- Modifier un supplément existant
- Supprimer un supplément
- Activer/désactiver la disponibilité
- Assigner une catégorie (optionnel)

**Accès:**
- Lien dans le sidebar: "Suppléments"
- Accessible par: super_admin, admin, caissier
- Chemin: `/supplements`

### 6. Permissions

**Fichier:** `src/lib/admin-access.ts`

```typescript
export const cashierAllowedPaths = [
  "/commandes", 
  "/validation-commandes", 
  "/menu-admin", 
  "/supplements",  // Ajouté
  "/recherche-recu"
];
```

## Installation et Configuration

### Étape 1: Créer la table dans Supabase

1. Ouvrez Supabase Dashboard
2. Allez dans SQL Editor
3. Exécutez le contenu de `database/create-supplements-table.sql`

Ou pour mettre à jour le schéma complet, exécutez `database/schema.sql` (attention, cela recrée toutes les tables).

### Étape 2: Ajouter des suppléments de test

Après avoir créé la table, ajoutez des suppléments via:

**Option A - Interface Admin:**
1. Connectez-vous en tant qu'admin
2. Allez dans "Suppléments"
3. Cliquez sur "Ajouter un supplément"

**Option B - SQL Direct:**
```sql
INSERT INTO public.supplements (nom, prix, disponible, categorie) VALUES
  ('Sos tomat', 50, true, 'Grillades'),
  ('Sos moutard', 50, true, 'Grillades'),
  ('Sos pikliz', 75, true, 'Grillades'),
  ('Laitue', 25, true, 'Burgers'),
  ('Tomate', 25, true, 'Burgers'),
  ('Fromage', 100, true, 'Burgers'),
  ('Bacon', 150, true, 'Burgers'),
  ('Oignon karamelize', 75, true, 'Burgers'),
  ('Ketchup', 25, true, NULL),
  ('Mayo', 25, true, NULL),
  ('Sos pwa', 50, true, NULL),
  ('Sos ti-malice', 75, true, NULL);
```

### Étape 3: Tester la fonctionnalité

1. **Côté Client:**
   - Allez sur `/menu`
   - Cliquez sur le bouton "+" d'un plat
   - Si des suppléments sont disponibles, un modal s'ouvre
   - Sélectionnez les suppléments souhaités
   - Cliquez sur "Ajoute nan panyen"
   - Vérifiez le panier (`/panier`) pour voir les suppléments affichés

2. **Côté Admin:**
   - Connectez-vous sur `/signin`
   - Accédez à `/supplements`
   - Créez, modifiez ou supprimez des suppléments
   - Testez la disponibilité (activer/désactiver)

## Utilisation

### Pour les Clients

1. **Sélectionner un plat** sur la page menu
2. **Choisir les suppléments** dans le modal qui s'ouvre
3. **Vérifier le total** (prix du plat + prix des suppléments)
4. **Ajouter au panier**
5. **Voir le récapitulatif** dans le panier avec le détail des suppléments

### Pour les Administrateurs

1. **Créer un supplément:**
   - Nom: "Sos tomat"
   - Prix: 50 (HTG)
   - Catégorie: "Grillades" (optionnel, laisser vide pour toutes catégories)
   - Disponible: Oui

2. **Assigner une catégorie:**
   - Si catégorie = "Burgers", le supplément n'apparaît que pour les burgers
   - Si catégorie = NULL, le supplément apparaît pour tous les plats

3. **Gérer la disponibilité:**
   - Désactiver un supplément le masque du modal client
   - Réactiver pour le rendre à nouveau disponible

## Structure des Fichiers Modifiés

```
src/
├── types/
│   └── restaurant.ts                    # + Supplement interface, CartItem étendu
├── context/
│   └── CartContext.tsx                  # addToCart accepte maintenant les suppléments
├── app/
│   ├── (client)/
│   │   └── menu/
│   │       └── page.tsx                 # Modal de sélection des suppléments
│   └── (admin)/
│       └── supplements/
│           └── page.tsx                 # Nouvelle page admin
├── layout/
│   └── AppSidebar.tsx                   # + Lien "Suppléments"
└── lib/
    └── admin-access.ts                  # + /supplements dans cashierAllowedPaths

database/
├── schema.sql                           # + Table supplements
└── create-supplements-table.sql         # Script de migration dédié
```

## Notes Techniques

### Gestion des Prix

- Le prix de base du plat est conservé dans `original_prix`
- Le prix final inclut les suppléments: `prix = base_prix - discount + supplements_total`
- Les promotions s'appliquent sur le prix de base, puis les suppléments sont ajoutés

### Persistance

- Les suppléments sont stockés dans le localStorage avec le panier
- Format: `{ ...item, supplements: [...], supplements_prix_total: X }`

### Performance

- Les suppléments sont chargés une fois avec le menu
- Pas de requête supplémentaire lors de l'ajout au panier
- Filtrage côté client pour la catégorie

## Dépannage

### Les suppléments n'apparaissent pas dans le modal

**Vérifications:**
1. La table `supplements` existe dans Supabase
2. Des suppléments ont été créés avec `disponible = true`
3. Le plat a une catégorie qui correspond aux suppléments
4. Vérifiez la console navigateur pour des erreurs

### Erreur de TypeScript

```typescript
// Si addToCart cause une erreur de type:
// Expected 1 arguments, but got 2

// Vérifiez que CartContext.tsx a bien:
addToCart: (item: any, supplements?: any[]) => void;
```

### Les suppléments ne sont pas sauvegardés

**Vérifications:**
1. Le panier est bien sauvegardé dans localStorage
2. Les suppléments ont bien un ID valide
3. Vérifiez les permissions RLS sur la table `supplements`

## Évolutions Futures Possibles

- [ ] Suppléments multiples choix (quantité par supplément)
- [ ] Suppléments obligatoires vs optionnels
- [ ] Groupes de suppléments (choix multiple dans un groupe)
- [ ] Suppléments avec prix négatifs (retraits)
- [ ] Historique des suppléments dans les commandes
- [ ] Statistiques sur les suppléments les plus populaires
- [ ] Import/export de suppléments en CSV

## Support

Pour toute question ou problème:
1. Vérifiez ce guide
2. Consultez les logs de la console navigateur
3. Vérifiez les logs Supabase
4. Contactez l'équipe technique