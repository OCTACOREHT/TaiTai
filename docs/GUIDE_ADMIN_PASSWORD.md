# Guide - Changement de mot de passe administrateur

## 📋 Vue d'ensemble

Le système de changement de mot de passe pour l'administrateur principal est maintenant entièrement fonctionnel et persistant. Le mot de passe est sauvegardé dans la base de données Supabase.

## 🔐 Configuration initiale

### 1. Créer la table dans Supabase

Exécutez le fichier SQL suivant dans votre dashboard Supabase (SQL Editor) :

```sql
-- Fichier: database/create-admin-passwords-table.sql

-- Table pour stocker les mots de passe des administrateurs
CREATE TABLE IF NOT EXISTS admin_passwords (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer le mot de passe par défaut pour l'admin principal
-- Mot de passe par défaut: "taitai2024"
INSERT INTO admin_passwords (id, email, password_hash, updated_at)
VALUES ('owner-01', 'taitai@gmail.com', 'taitai2024', NOW())
ON CONFLICT (id) DO NOTHING;

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_admin_passwords_email ON admin_passwords(email);
```

### 2. Vérifier la création de la table

Après exécution, vérifiez que la table `admin_passwords` existe dans votre base de données avec :
- 1 ligne pour l'administrateur principal
- Mot de passe par défaut: `taitai2024`

## 🎯 Utilisation

### Changer le mot de passe administrateur principal

1. **Se connecter** à l'administration avec le mot de passe actuel
2. **Aller** dans la page "Équipe" (menu latéral)
3. **Repérer** la ligne "TaïTaï Admin" (administrateur principal)
4. **Cliquer** sur le bouton "Modifier" (avec icône crayon)
5. **Saisir** le nouveau mot de passe
6. **Cliquer** sur "Enregistrer"

### Résultat

- ✅ Le mot de passe est sauvegardé dans la base de données
- ✅ La session courante est mise à jour
- ✅ Un message de succès s'affiche
- ✅ Vous pouvez vous déconnecter et vous reconnecter avec le nouveau mot de passe

## 🔍 Fonctionnement technique

### Architecture

```
┌─────────────────────────────────────────┐
│  Page Équipe (equipe/page.tsx)          │
│  - Bouton "Modifier"                    │
│  - Modal de changement de mot de passe  │
└──────────────┬──────────────────────────┘
               │
               ├──> updateAdminPassword() (admin-passwords.ts)
               │    - Met à jour la table admin_passwords
               │    - Retourne true/false
               │
               ├──> getAdminSession() (admin-auth.ts)
               │    - Récupère le mot de passe depuis la BD
               │    - Met à jour la session locale
               │
               └──> localStorage/sessionStorage
                    - Stocke la session avec le nouveau mot de passe
```

### Fichiers modifiés

1. **database/create-admin-passwords-table.sql** - Nouvelle table pour les mots de passe
2. **src/lib/admin-passwords.ts** - Service pour gérer les mots de passe
3. **src/lib/admin-auth.ts** - Chargement du mot de passe depuis la BD
4. **src/app/(admin)/equipe/page.tsx** - Interface de changement de mot de passe

## ⚠️ Important

- Le mot de passe est stocké en **clair** dans la base de données (pour simplifier)
- L'administrateur principal a l'ID `owner-01`
- L'email de l'administrateur principal est `taitai@gmail.com`
- Le mot de passe par défaut est `taitai2024`

## 🔒 Sécurité

Pour améliorer la sécurité en production :

1. **Hacher les mots de passe** avec bcrypt ou argon2
2. **Utiliser HTTPS** pour toutes les communications
3. **Implémenter une politique de mot de passe fort** (min 8 caractères, majuscules, chiffres, etc.)
4. **Ajouter une confirmation** par email lors du changement
5. **Logger** tous les changements de mot de passe

## 🐛 Dépannage

### Le mot de passe ne change pas

1. Vérifiez que la table `admin_passwords` existe dans Supabase
2. Vérifiez que la ligne avec `id = 'owner-01'` existe
3. Videz le cache du navigateur (Ctrl+Shift+R)
4. Déconnectez-vous et reconnectez-vous

### Erreur de connexion après changement

- Le nouveau mot de passe est bien pris en compte
- Vérifiez que vous utilisez bien le nouveau mot de passe
- Le mot de passe est sensible à la casse (majuscules/minuscules)

## 📞 Support

Si le problème persiste, contactez le support technique avec :
- La date et l'heure du changement
- Le navigateur utilisé
- Les messages d'erreur éventuels