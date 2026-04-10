# Flag Day - Seed Documentation

## Données ajoutées

Le script seed crée automatiquement:

✅ **25 Équipes**
- Fc TORO Elite
- CSP
- FC Colonne
- PAC
- Jacot Football Passion
- Valencia
- Fc Condor
- et bien d'autres...

✅ **6 Championnats** (un par catégorie)
- Flag Day U9 2026
- Flag Day U11 2026
- Flag Day U13 2026
- Flag Day U15 2026
- Flag Day U17 2026
- Flag Day U21 2026

✅ **Association des équipes**
Chaque championnat a ses équipes associées selon les catégories

✅ **3 Matchs d'exemple**
- Matchs planifiés
- Matchs joués avec scores

## Exécution du seed

### Première exécution (population initiale)
```bash
npm run seed
```

### Réinitialiser et relancer
Si vous voulez recommencer avec des données propres:

1. **Via Supabase Dashboard:**
   - Allez à `SQL Editor`
   - Exécutez les commandes DELETE suivantes:
   ```sql
   DELETE FROM flagday_matches;
   DELETE FROM flagday_competition_teams;
   DELETE FROM flagday_competitions;
   DELETE FROM flagday_teams;
   ```

2. **Puis relancez le seed:**
   ```bash
   npm run seed
   ```

## Structure des données

### flagday_teams
```
- id (UUID)
- name (équipe)
- slug
- logo (URL)
- color (couleur hex)
- active (booléen)
- sort_order
- date_creation
```

### flagday_competitions
```
- id (UUID)
- name (championnat)
- slug
- season (année)
- description
- active
- logo_url
- date_creation
```

### flagday_competition_teams
```
- id (UUID)
- competition_id (lien vers championnat)
- team_id (lien vers équipe)
- logo_url
- sort_order
```

### flagday_matches
```
- id (UUID)
- competition (nom du championnat)
- round (phase du match)
- kickoff (date/heure)
- status (scheduled | finished | cancelled)
- home_team_id
- away_team_id
- home_score
- away_score
- venue (stade)
```

## Prochaines étapes

Une fois le seed exécuté:

1. ✅ La page `/club/flag-day` affichera les 6 championnats
2. ✅ Cliquez sur "Gérer" pour voir les détails
3. ✅ Les onglets "Poules" et "Matchs" afficheront les vraies données
4. ✅ Vous pouvez ajouter des résultats aux matchs

## Troubleshooting

Si le seed échoue:

1. **Vérifiez les variables d'environnement:**
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Assurez-vous que les tables Supabase existent:**
   - `flagday_teams`
   - `flagday_competitions`
   - `flagday_competition_teams`
   - `flagday_matches`

3. **Vérifiez la connexion:** Testez sur le dashboard Supabase
