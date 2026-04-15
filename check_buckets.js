const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:\\Users\\RK_Piton\\Documents\\CMS\\.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("Error fetching buckets:", error.message);
  } else {
    console.log("Buckets:", data.map(b => b.name));
  }
}

checkBuckets();
