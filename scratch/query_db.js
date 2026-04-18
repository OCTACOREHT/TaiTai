const { Pool } = require('pg'); 
const dotenv = require('dotenv'); 
dotenv.config({ path: '.env.local' }); 

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
}); 

pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'club_events'`)
  .then(res => { console.log(res.rows); pool.end(); })
  .catch(console.error);
