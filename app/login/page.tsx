'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogIn, Plus } from 'lucide-react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UUID_V4 } from '@/lib/food';
export default function Login(){
 const [uuid,setUuid]=useState(''),[error,setError]=useState('');const router=useRouter();
 function signIn(value:string){if(!UUID_V4.test(value.trim())){setError('Enter a valid UUIDv4, or use Sign Up.');return;}const key=value.trim().toLowerCase();sessionStorage.setItem('activeUser',key);router.push(`/u/${key}/foods`);}
 return <><Header login/><main className="mx-auto max-w-lg px-5 py-10"><Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft size={16}/> Calculator</Link><Card><CardHeader><CardTitle className="text-2xl">Sign in</CardTitle></CardHeader><CardContent><form onSubmit={e=>{e.preventDefault();signIn(uuid);}} className="space-y-4"><Label htmlFor="uuid">Secret UUID</Label><Input id="uuid" name="password" type="text" autoComplete="current-password" autoCapitalize="none" spellCheck={false} value={uuid} onChange={e=>setUuid(e.target.value)} placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx" className="font-mono text-xs"/><div className="flex gap-3"><Button type="submit" className="flex-1">Sign In<LogIn/></Button><Button type="button" variant="outline" className="flex-1" onClick={()=>{const key=crypto.randomUUID();setUuid(key);signIn(key);}}>Sign Up<Plus/></Button></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<p className="text-xs leading-relaxed text-muted-foreground">Sign Up creates a UUID. Save it to sign in again. Anyone with your UUID or account URL can access your foods. No recovery.</p></form></CardContent></Card></main></>;
}
