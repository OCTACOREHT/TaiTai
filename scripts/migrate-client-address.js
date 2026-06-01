const db = require("../src/server/db");

const sql = `
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS adresse text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ville text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS departement text;
`;

(async () => {
  await db.query(sql);
  console.log("client address migration ok");
  await db.end();
})().catch(async (error) => {
  console.error(error.message);
  await db.end().catch(() => {});
  process.exit(1);
});
