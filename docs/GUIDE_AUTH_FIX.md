# Guide de correction de l'authentification

## Problème résolu

Les utilisateurs ne pouvaient plus se connecter avec leurs anciens identifiants après la mise à jour du système de sécurité.

## Solution implémentée

### 1. Système de double vérification

Le système vérifie maintenant deux types de mots de passe :

- **Nouveaux comptes** : Mot de passe hashé (SHA-256, 64 caractères)
- **Anciens comptes** : Mot de passe en clair (pour compatibilité)

### 2. Migration automatique

Lorsqu'un utilisateur se connecte avec un ancien mot de passe en clair, le système le hash automatiquement pour les prochaines connexions.

### 3. Email unique

Un email ne peut être utilisé qu'une seule fois. Si quelqu'un essaie de créer un compte avec un email existant, il est redirigé vers "Mot de passe oublié".

## Actions à effectuer

### Étape 1 : Supprimer les anciens comptes (optionnel mais recommandé)

Si vous voulez repartir à zéro :

1. Ouvrez Supabase Dashboard
2. Allez dans SQL Editor
3. Exécutez le script `database/delete-all-clients.sql`

**Attention** : Cette action supprime tous les clients et leurs commandes !

### Étape 2 : Tester le système

1. **Créer un nouveau compte** :
   - Allez sur la page d'inscription
   - Remplissez le formulaire
   - Le compte est créé avec un mot de passe hashé

2. **Se connecter** :
   - Utilisez les identifiants du nouveau compte
   - La connexion devrait fonctionner

3. **Tester "Mot de passe oublié"** :
   - Cliquez sur "Ou bliye modpas ou ?"
   - Entrez votre email
   - Définissez un nouveau mot de passe

## Messages d'erreur

- "Imel oswa modpas la pa korek." : Email ou mot de passe incorrect
- "Imel sa a deja itilize. Tanpri klike sou 'Ou bliye modpas ou ?' pou rekòmanse." : Email déjà utilisé
- "Nimewo telefòn sa a deja itilize." : Numéro de téléphone déjà utilisé

## Vérification dans la console

Ouvrez la console du navigateur (F12) pour voir les logs de connexion :

```
Tentative de connexion: { email: "test@example.com", hash: "abc123..." }
Utilisateur trouvé: { userData: {...}, userError: null }
Comparaison hash: { storedHash: "...", hash: "...", match: true }
```

## Sécurité

- Les mots de passe sont hashés avec SHA-256
- Les sessions expirent après 2 heures d'inactivité
- Le mot de passe doit contenir :
  - Minimum 8 caractères
  - Au moins une minuscule
  - Au moins une majuscule
  - Au moins un chiffre
  - Au moins un caractère spécial

## Support

Si le problème persiste :

1. Vérifiez la console du navigateur pour les erreurs
2. Vérifiez que la table `clients` existe dans Supabase
3. Vérifiez que la colonne `mot_de_passe_hash` existe
4. Exécutez le script de suppression si nécessaire