import { createClient } from '@supabase/supabase-client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkScorers() {
  const { data: competitions, error: compError } = await supabase.from('flagday_competitions').select('id, name');
  console.log('Competitions:', competitions);

  const competitionId = competitions[0]?.id;
  if (!competitionId) return;

  const { data: matches, error: matchError } = await supabase.from('flagday_matches').select('id, round').eq('competition_id', competitionId);
  console.log('Matches for first comp:', matches);

  const { data: scorers, error: scorerError } = await supabase.from('flagday_match_scorers').select('*');
  console.log('All Scorers entries:', scorers);
}

checkScorers();
