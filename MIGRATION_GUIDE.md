# 🔧 Résolution: Table Fournisseurs Manquante

## Problème
L'erreur `Could not find the table 'public.fournisseurs' in the schema cache` apparaît lors de l'accès à la page des fournisseurs.

## Cause
La table `fournisseurs` n'existe pas dans votre base de données Supabase. Le fichier `schema.sql` local a été mis à jour, mais Supabase cloud n'a pas synchronisé automatiquement.

## ✅ Solution: 2 minutes maximum

### Option 1: Via Supabase SQL Editor (RECOMMANDÉ)

1. **Accédez au SQL Editor de Supabase:**
   - Allez à: https://yuriotdtjubnbumeisdk.supabase.co/sql
   - (Remplacez `yuriotdtjubnbumeisdk` par votre URL Supabase)

2. **Copiez et collez ce SQL:**
```sql
CREATE TABLE IF NOT EXISTS public.fournisseurs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nom text NOT NULL,
  telephone text NOT NULL,
  adresse text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.fournisseurs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fournisseurs_public_read" ON public.fournisseurs;
CREATE POLICY "fournisseurs_public_read" ON public.fournisseurs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "fournisseurs_admin_insert" ON public.fournisseurs;
CREATE POLICY "fournisseurs_admin_insert" ON public.fournisseurs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "fournisseurs_admin_update" ON public.fournisseurs;
CREATE POLICY "fournisseurs_admin_update" ON public.fournisseurs
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "fournisseurs_admin_delete" ON public.fournisseurs;
CREATE POLICY "fournisseurs_admin_delete" ON public.fournisseurs
  FOR DELETE USING (true);
```

3. **Cliquez sur "Exécuter" (Run)**
4. **Actualisez le site** - l'erreur devrait disparaître! ✨

### Option 2: Via Terminal (pour futurs projets)

```bash
# Exécuter toutes les migrations
node scripts/apply-migrations.js
```

## Vérification

Allez à http://localhost:3000/admin/fournisseurs et vérifiez que:
- ✅ La page charge sans erreur
- ✅ Le tableau affiche "0 fournisseur enregistré"
- ✅ Vous pouvez ajouter un fournisseur

## 📝 Prévention Future

Pour éviter ce problème à l'avenir:
1. Exécutez les migrations Supabase via le CLI
2. Gardez les fichiers `database/*.sql` synchronisés
3. Utilisez `scripts/apply-migrations.js` avant de déployer

---
**Questions?** Consultez la documentation Supabase: https://supabase.com/docs/guides/cli/local-development
