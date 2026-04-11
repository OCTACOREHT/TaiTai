# Guide d'Intégration : CMS → Site Public 🚀

Ce document est destiné au développeur du site public pour connecter les données dynamiques saisies dans le CMS.

## 1. Configuration de la Base de Données
Le CMS et le Site partagent la même instance **Supabase**. Vous devez configurer vos variables d'environnement avec les clés fournies par l'administrateur :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Structure des Données (Tables SQL)

Les données du tournoi **Flag Day** sont stockées dans les tables suivantes :

- `articles` : Actualités et blog du site.
- `club_events` : Calendrier des matchs, entraînements et réunions du club.
- `stages` : Offres de stages ou de missions.
- `club_players` : Base de données des joueurs de votre club.
- `club_staff` : Membres du staff technique et administratif.
- `flagday_*` : Tout ce qui concerne le tournoi Flag Day (voir section dédiée).
- `site_settings` : Textes globaux du site (taglines, titres de sections).

---

## 3. Exemples de Requêtes (Côté Site)

### A. Récupérer le classement d'une catégorie
Vous pouvez recalculer le classement à partir des matchs terminés pour être sûr qu'il est à jour.

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function getStandings(tournamentId, category) {
  const { data, error } = await supabase
    .from('flagday_matches')
    .select(`
      *,
      home_team:home_team_id(id, name, logo_url),
      away_team:away_team_id(id, name, logo_url)
    `)
    .eq('competition_id', tournamentId)
    .eq('status', 'finished')
    .ilike('round', `%${category}%`) // Filtre par catégorie U9, U11, etc.

  // Logique de calcul des points (3 pts gagne, 1 nul, 0 perdu)
  return calculateStandings(data)
}
```

### B. Récupérer les Meilleurs Buteurs
C'est la nouvelle fonctionnalité ajoutée. On agrège les buts par nom de joueur.

```javascript
async function getTopScorers(tournamentId, category) {
  const { data, error } = await supabase
    .from('flagday_match_scorers')
    .select(`
      player_name,
      team_name,
      goals,
      flagday_matches!inner(round, competition_id)
    `)
    .eq('flagday_matches.competition_id', tournamentId)
    .ilike('flagday_matches.round', `%${category}%`)

  // Agréger les buts par joueur
  const ranking = data.reduce((acc, current) => {
    const key = `${current.player_name}-${current.team_name}`
    if (!acc[key]) acc[key] = { name: current.player_name, team: current.team_name, goals: 0 }
    acc[key].goals += current.goals
    return acc
  }, {})

  return Object.values(ranking).sort((a, b) => b.goals - a.goals)
}
```

### C. Récupérer les prochains matchs
```javascript
const { data: matches } = await supabase
  .from('flagday_matches')
  .select('*')
  .eq('status', 'scheduled')
  .order('kickoff', { ascending: true })
```

---

---

## 4. Gestion du Contenu (Articles, Événements, Stages)

### A. Récupérer les derniers articles (Actualités)
```javascript
// Récupérer les 3 derniers articles publiés
const { data: articles } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .limit(3)
```

### B. Calendrier du Club (Événements)
```javascript
const { data: events } = await supabase
  .from('club_events')
  .select('*')
  .order('event_date', { ascending: true })
```

### C. Offres de Stages
```javascript
const { data: stages } = await supabase
  .from('stages')
  .select('*')
  .eq('status', 'published')
```

---

## 5. Membres et Staff (Joueurs & Équipe)

### A. Liste des Joueurs par Catégorie
```javascript
const { data: players } = await supabase
  .from('club_players')
  .select('*')
  .eq('category', 'U11') // Exemple
  .eq('status', 'actif')
```

### B. Organigramme du Staff
```javascript
const { data: staff } = await supabase
  .from('club_staff')
  .select('*')
  .order('start_date', { ascending: true })
```

---

## 6. Tracking et Statistiques (Analytics)

Le CMS permet de suivre les performances. Vous devez incrémenter ces valeurs via une fonction SQL Supabase (RPC) ou une simple mise à jour.

### A. Incrémenter les vues d'un article
```javascript
// À appeler quand quelqu'un ouvre la page de l'article
await supabase.rpc('increment_article_views', { article_id: id })
// OU via update simple (moins précis en cas de forte charge)
await supabase.from('articles').update({ views: old_views + 1 }).eq('id', id)
```

### B. Suivre les metrics du Hero (Accueil)
La table `home_hero_metrics` définit les chiffres clés affichés en haut de la page (ex: "500 licenciés", "20 trophées").
```javascript
const { data: metrics } = await supabase.from('home_hero_metrics').select('*').order('sort_order')
```

---

## 7. Configuration Globale
Pour éviter de changer le texte du site manuellement, utilisez la table `site_settings` :
```javascript
const { data: settings } = await supabase.from('site_settings').select('*').single()
// Contient : site_name, public_tagline, primary_email, etc.
```

---

## 8. Conseils pour l'ami Développeur
- **Logo des équipes** : Utilisez le champ `logo_url` des tables d'équipes.
- **Statut des matchs** : Un match est soit `scheduled` (à venir) soit `finished` (terminé).
- **Phases Finales** : Le champ `round` contient le nom de la phase (ex: "U9 - Groupe A", "Quart de finale", etc.).

---
*Ce guide a été généré automatiquement pour faciliter la synchronisation entre le CMS et le Site Public.*
