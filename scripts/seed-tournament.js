/**
 * Seed script pour Flag Day
 * Remplit la base de données avec des données de test
 * 
 * Usage: npm run seed
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Variables d'environnement Supabase manquantes!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Données des équipes
const teamsData = [
  { name: "Fc TORO Elite", logo: "/images/logo/fc-toro.png", color: "#d11829" },
  { name: "CSP", logo: "/images/logo/csp.png", color: "#1e40af" },
  { name: "FC Colonne", logo: "/images/logo/fc-colonne.png", color: "#059669" },
  { name: "PAC", logo: "/images/logo/pac.png", color: "#f59e0b" },
  { name: "Jacot Football Passion", logo: "/images/logo/jacot.png", color: "#7c3aed" },
  { name: "Valencia", logo: "/images/logo/valencia.png", color: "#0891b2" },
  { name: "Fc Condor", logo: "/images/logo/condor.png", color: "#ec4899" },
  { name: "ASF", logo: "/images/logo/asf.png", color: "#06b6d4" },
  { name: "Fc TORO Pv", logo: "/images/logo/fc-toro-pv.png", color: "#d11829" },
  { name: "A.S.F", logo: "/images/logo/asf-2.png", color: "#06b6d4" },
  { name: "FC M.D.M", logo: "/images/logo/mdm.png", color: "#8b5cf6" },
  { name: "A.S.T", logo: "/images/logo/ast.png", color: "#ef4444" },
  { name: "Star des Jeunes", logo: "/images/logo/star.png", color: "#fbbf24" },
  { name: "FC Seth", logo: "/images/logo/seth.png", color: "#10b981" },
  { name: "FC Flambo", logo: "/images/logo/flambo.png", color: "#f97316" },
  { name: "Perfection FC", logo: "/images/logo/perfection.png", color: "#6366f1" },
  { name: "Idelo", logo: "/images/logo/idelo.png", color: "#14b8a6" },
  { name: "FC Legend", logo: "/images/logo/legend.png", color: "#a855f7" },
  { name: "Condor EF", logo: "/images/logo/condor-ef.png", color: "#ec4899" },
  { name: "SLG Academie", logo: "/images/logo/slg.png", color: "#6b7280" },
  { name: "Rev United", logo: "/images/logo/rev.png", color: "#3b82f6" },
  { name: "Violette", logo: "/images/logo/violette.png", color: "#a78bfa" },
  { name: "Academie Perfection", logo: "/images/logo/ap.png", color: "#6366f1" },
  { name: "ADE30", logo: "/images/logo/ade30.png", color: "#fbbf24" },
  { name: "Aigle Noir", logo: "/images/logo/aigle.png", color: "#1f2937" },
];

// Catégories
const categories = ["U9", "U11", "U13", "U15", "U17", "U21"];

async function seedDatabase() {
  try {
    console.log("🌱 Démarrage du seed...\n");

    // 1. Insérer les équipes
    console.log("📋 Création des équipes...");
    const { data: teams, error: teamsError } = await supabase
      .from("flagday_teams")
      .upsert(
        teamsData.map((team) => ({
          name: team.name,
          slug: team.name.toLowerCase().replace(/\s+/g, "-"),
          logo: team.logo,
          color: team.color,
          active: true,
        })),
        { onConflict: "name" }
      )
      .select();

    if (teamsError) {
      console.error("❌ Erreur lors de la création des équipes:", teamsError.message);
      return;
    }

    console.log(`✅ ${teams.length} équipes créées\n`);

    // 2. Créer les championnats
    console.log("🏆 Création des championnats par catégorie...");
    const competitions = [];

    for (const category of categories) {
      const { data: competition, error: compError } = await supabase
        .from("flagday_competitions")
        .upsert(
          {
            name: `Flag Day ${category} 2026`,
            slug: `flag-day-${category.toLowerCase()}-2026`,
            season: "2026",
            description: `Championnat Flag Day catégorie ${category}`,
            active: true,
            logo_url: "/images/logo/flag-day.png",
          },
          { onConflict: "name" }
        )
        .select()
        .single();

      if (compError) {
        console.error(`❌ Erreur pour ${category}:`, compError.message);
        continue;
      }

      competitions.push({ ...competition, category });
      console.log(`  ✅ Flag Day ${category} créé`);
    }

    console.log();

    // 3. Associer les équipes aux championnats
    console.log("🔗 Association des équipes aux championnats...");

    // Distribution des équipes par catégorie
    const teamsByCategory = {
      U9: [
        "Fc TORO Elite",
        "CSP",
        "FC Colonne",
        "PAC",
        "Jacot Football Passion",
        "Valencia",
        "Fc Condor",
        "ASF",
      ],
      U11: [
        "Fc TORO Elite",
        "Fc TORO Pv",
        "Valencia",
        "A.S.T",
        "Jacot Football Passion",
        "A.S.F",
        "FC M.D.M",
        "Star des Jeunes",
      ],
      U13: [
        "Fc TORO Elite",
        "FC Seth",
        "FC Flambo",
        "Perfection FC",
        "Valencia",
        "PAC",
        "Fc M.D.M",
        "A.S.F",
      ],
      U15: [
        "Fc TORO Elite",
        "A.S.F",
        "Idelo",
        "FC Legend",
        "Fc Flambo",
        "Condor EF",
        "FC M.D.M",
        "Fc TORO Pv",
      ],
      U17: [
        "Fc TORO Elite",
        "Condor EF",
        "SLG Academie",
        "Fc TORO Pv",
        "Idelo",
        "Star des Jeunes",
        "Fc Seth",
        "Rev United",
      ],
      U21: [
        "Fc TORO Elite",
        "FC Flambo",
        "ADE30",
        "SLG Academie",
        "Violette",
        "Jacot Football Passion",
        "Academie Perfection",
        "Aigle Noir",
      ],
    };

    for (const comp of competitions) {
      const categoryTeams = teamsByCategory[comp.category] || [];
      const teamIds = teams
        .filter((t) => categoryTeams.includes(t.name))
        .map((t) => t.id);

      const compTeamsData = teamIds.map((teamId, index) => ({
        competition_id: comp.id,
        team_id: teamId,
        sort_order: index,
      }));

      const { data: compTeams, error: ctError } = await supabase
        .from("flagday_competition_teams")
        .upsert(compTeamsData, { onConflict: "competition_id,team_id" })
        .select();

      if (ctError) {
        console.error(`❌ Erreur pour ${comp.category}:`, ctError.message);
        continue;
      }

      console.log(
        `  ✅ ${comp.category}: ${compTeams.length} équipes associées`
      );
    }

    console.log();

    // 4. Créer des matchs de test
    console.log("⚽ Création des matchs de test...");

    const matchSamples = [];
    for (const comp of competitions.slice(0, 1)) {
      // Seulement pour U9
      const teamIds = teams
        .filter((t) =>
          teamsByCategory[comp.category]?.includes(t.name)
        )
        .map((t) => t.id)
        .slice(0, 4); // Prendre les 4 premiers pour simplifier

      if (teamIds.length >= 2) {
        // Match 1
        matchSamples.push({
          competition: "Flagday",
          round: `${comp.category} - Poule A`,
          kickoff: new Date(Date.now() + 86400000).toISOString(),
          status: "scheduled",
          home_team_id: teamIds[0],
          away_team_id: teamIds[1],
          venue: "Stade Principal",
        });

        // Match 2 - déjà joué
        matchSamples.push({
          competition: "Flagday",
          round: `${comp.category} - Poule A`,
          kickoff: new Date(Date.now() - 86400000).toISOString(),
          status: "finished",
          home_team_id: teamIds[1],
          away_team_id: teamIds[2],
          home_score: 2,
          away_score: 1,
          venue: "Stade Principal",
        });

        // Match 3
        matchSamples.push({
          competition: "Flagday",
          round: `${comp.category} - Poule B`,
          kickoff: new Date(Date.now() + 172800000).toISOString(),
          status: "scheduled",
          home_team_id: teamIds[2],
          away_team_id: teamIds[3],
          venue: "Stade Principal",
        });
      }
    }

    if (matchSamples.length > 0) {
      const { data: matches, error: matchError } = await supabase
        .from("flagday_matches")
        .upsert(matchSamples)
        .select();

      if (matchError) {
        console.error("❌ Erreur lors de la création des matchs:", matchError.message);
      } else {
        console.log(`✅ ${matches.length} matchs créés\n`);
      }
    }

    console.log("🎉 Seed complété avec succès!");
    console.log("\n✨ Les données suivantes ont été ajoutées:");
    console.log(`  • ${teams.length} équipes`);
    console.log(`  • ${competitions.length} championnats (par catégorie)`);
    console.log(`  • ${matchSamples.length} matchs d'exemple`);
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
  }
}

seedDatabase();
