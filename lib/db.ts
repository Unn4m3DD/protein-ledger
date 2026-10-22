import { createClient, type Client } from '@libsql/client';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
let connection:Promise<Client>|undefined;
export function database(){
 if(!connection)connection=(async()=>{
  const url=process.env.TURSO_DATABASE_URL;
  if(process.env.VERCEL && (!url || url.startsWith('file:')))throw new Error('Configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel.');
  if(!url) await mkdir(path.join(process.cwd(),'data'),{recursive:true});
  const db=createClient({url:url||`file:${path.join(process.cwd(),'data/foods.sqlite3')}`,authToken:process.env.TURSO_AUTH_TOKEN});
  await db.execute('CREATE TABLE IF NOT EXISTS foods (id INTEGER PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, calories REAL, protein REAL, carbs REAL, fat REAL, serving REAL, container REAL, price REAL, unit TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)');
  return db;
 })().catch(error=>{connection=undefined;throw error;});
 return connection;
}
