import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { fields, parseFood, UUID_V4 } from '@/lib/food';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Context={params:Promise<{uuid:string}>};
export async function GET(_request:Request,context:Context){
 const {uuid}=await context.params;
 if(!UUID_V4.test(uuid))return NextResponse.json({error:'Invalid UUID.'},{status:400});
 try{
  const db=await database();
  const result=await db.execute({sql:'SELECT id,name,calories,protein,carbs,fat,serving,container,price,unit FROM foods WHERE owner=? ORDER BY id DESC',args:[uuid.toLowerCase()]});
  return NextResponse.json(result.rows,{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Storage unavailable. Check the database configuration.'},{status:503});}
}
export async function POST(request:Request,context:Context){
 const {uuid}=await context.params;
 if(!UUID_V4.test(uuid))return NextResponse.json({error:'Invalid UUID.'},{status:400});
 let food;
 try{const body=await request.text();if(body.length>8192)throw Error('Food is too large.');food=parseFood(JSON.parse(body));}
 catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Invalid food.'},{status:400});}
 try{
  const db=await database();
  const result=await db.execute({sql:'INSERT INTO foods (owner,name,calories,protein,carbs,fat,serving,container,price,unit) VALUES (?,?,?,?,?,?,?,?,?,?)',args:[uuid.toLowerCase(),food.name,...fields.map(key=>food[key]),food.unit]});
  return NextResponse.json({id:Number(result.lastInsertRowid)},{status:201});
 }catch{return NextResponse.json({error:'Storage unavailable. Check the database configuration.'},{status:503});}
}
