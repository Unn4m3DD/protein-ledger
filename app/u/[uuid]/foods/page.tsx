import { notFound } from 'next/navigation';
import { Ledger } from '@/components/ledger';
import { UUID_V4 } from '@/lib/food';
export default async function Page({params}:{params:Promise<{uuid:string}>}){const {uuid}=await params;if(!UUID_V4.test(uuid))notFound();return <Ledger user={uuid.toLowerCase()} />;}
