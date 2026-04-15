require('dotenv').config({ path: '.env.local' });
const db = require('./src/server/db');

async function createBucket() {
  try {
    const res = await db.query(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('videos', 'videos', true)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Bucket creation result:", res);
    
    // Create RLS policy to allow public inserts / selects
    await db.query(`
      CREATE POLICY "Public Access" 
      ON storage.objects FOR SELECT 
      USING ( bucket_id = 'videos' );
      
      CREATE POLICY "Public Insert" 
      ON storage.objects FOR INSERT 
      WITH CHECK ( bucket_id = 'videos' );
    `).catch(err => {
      console.log("Policy creation error (might already exist):", err);
    });

    console.log("Done.");
  } catch (err) {
    console.error("SQL Error:", err);
  } finally {
    process.exit(0);
  }
}

createBucket();
