# Guide de correction de l'authentification

## Problème identifié

Lorsqu'un utilisateur créait un compte et se déconnectait, il ne pouvait plus se reconnecter avec son email. Le message d'erreur indiquait que l'email n'était pas trouvé dans la base de données, même pour "mot de passe oublié".

## Cause du problème

Dans `src/context/AuthContext.tsx`, les fonctions `signIn()` et `resetPassword()` utilisaient la méthode `.single()` de Supabase, qui retourne une erreur lorsque aucun résultat n'est trouvé. Cela causait des problèmes de gestion d'erreur.

## Solution appliquée

Remplacement de `.single()` par `.maybeSingle()` dans les fonctions critiques :

### Avant (ligne 128 et 222)
```typescript
.single();
```

### Après
```typescript
.maybeSingle();
```

## Fichiers modifiés

- **`src/context/AuthContext.tsx`**
  - Ligne 128: `signIn()` - changé `.single()` → `.maybeSingle()`
  - Ligne 222: `resetPassword()` - changé `.single()` → `.maybeSingle()`

## Différence entre `.single()` et `.maybeSingle()`

- **`.single()`**: Retourne une erreur si 0 ou plusieurs résultats sont trouvés
- **`.maybeSingle()`**: Retourne `null` dans `data` si aucun résultat, sans erreur

## Test de la correction

1. **Créer un compte:**
   - Aller sur `/menu`
   - Cliquer sur "Konekte"
   - Sélectionner "Enskripsyon"
   - Remplir le formulaire
   - Créer le compte

2. **Se déconnecter:**
   - Cliquer sur le menu utilisateur
   - Cliquer sur "Dekonekte"

3. **Se reconnecter:**
   - Cliquer sur "Konekte"
   - Entrer l'email et mot de passe
   - La connexion doit fonctionner

4. **Test mot de passe oublié:**
   - Cliquer sur "Konekte"
   - Cliquer sur "Ou bliye modpas ou ?"
   - Entrer l'email
   - Entrer un nouveau mot de passe
   - Le message "Modpas la chanje" doit apparaître
   - Se connecter avec le nouveau mot de passe

## Vérification de la base de données

Pour vérifier que les comptes sont bien créés:

```sql
-- Vérifier les clients dans la base
SELECT id, nom, email, telephone, created_at 
FROM public.clients 
ORDER BY created_at DESC 
LIMIT 10;
```

## Notes importantes

- Les emails sont normalisés (lowercase + trim) avant insertion
- Les mots de passe sont hashés avec SHA-256
- La session expire après 2 heures d'inactivité
- Le token de session est stocké dans localStorage

## Si le problème persiste

1. Vérifier les logs de la console navigateur (F12)
2. Vérifier que la table `clients` existe dans Supabase
3. Vérifier les policies RLS sur la table `clients`
4. Tester la connexion directement avec Supabase Dashboard