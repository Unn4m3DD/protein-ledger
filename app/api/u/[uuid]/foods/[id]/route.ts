import { NextResponse } from 'next/server';
import { database } from '@/lib/db';
import { fields, parseFood, UUID_V4 } from '@/lib/food';
export const runtime='nodejs';
export async function DELETE(_request:Request,{params}:{params:Promise<{uuid:string;id:string}>}){
 const {uuid,id}=await params;
 if(!UUID_V4.test(uuid)||!/^\d+$/.test(id))return NextResponse.json({error:'Invalid request.'},{status:400});
 try{
  const db=await database();
  const result=await db.execute({sql:'DELETE FROM foods WHERE owner=? AND id=?',args:[uuid.toLowerCase(),Number(id)]});
  return NextResponse.json({deleted:result.rowsAffected>0},{status:result.rowsAffected?200:404});
 }catch{return NextResponse.json({error:'Storage unavailable.'},{status:503});}
}

export async function PATCH(request:Request,{params}:{params:Promise<{uuid:string;id:string}>}){
 const {uuid,id}=await params;
 if(!UUID_V4.test(uuid)||!/^\d+$/.test(id))return NextResponse.json({error:'Invalid request.'},{status:400});
 let food;
 try{
  const body=await request.text();
  if(body.length>8192)throw Error('Food is too large.');
  food=parseFood(JSON.parse(body));
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Invalid food.'},{status:400});}
 try{
  const db=await database();
  const result=await db.execute({sql:'UPDATE foods SET name=?,calories=?,protein=?,carbs=?,fat=?,serving=?,container=?,price=? WHERE owner=? AND id=?',args:[food.name,...fields.map(key=>food[key]),uuid.toLowerCase(),Number(id)]});
  if(!result.rowsAffected)return NextResponse.json({error:'Food not found.'},{status:404});
  return NextResponse.json({id:Number(id)});
 }catch{return NextResponse.json({error:'Storage unavailable.'},{status:503});}
}
