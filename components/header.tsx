'use client';
import Link from 'next/link';
import { BookOpen, ChevronDown, Copy, LogIn, LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function Header({user,login=false,onSignIn}:{user?:string;login?:boolean;onSignIn?:()=>void}){
 const router=useRouter();
 async function copyId(){
  if(!user)return;
  try{await navigator.clipboard.writeText(user);toast.success('ID copied.');}
  catch{toast.error('Could not copy ID. Copy it from your account URL.');}
 }
 return <header className="border-b border-border">
  <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
   <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight"><span className="rounded-md bg-[#d65d35] p-1.5 text-white"><BookOpen size={22}/></span><span>protein<span className="font-normal">ledger</span></span></Link>
   <div className="flex items-center gap-2">
    <ThemeSwitcher/>
    {!login && (user ? <DropdownMenu>
     <DropdownMenuTrigger asChild><Button size="sm" variant="outline" aria-label="Account menu"><UserRound/><ChevronDown className="size-3"/></Button></DropdownMenuTrigger>
     <DropdownMenuContent align="end" className="w-40">
      <DropdownMenuItem onSelect={copyId}><Copy/>Copy ID</DropdownMenuItem>
      <DropdownMenuSeparator/>
      <DropdownMenuItem onSelect={()=>{sessionStorage.removeItem('activeUser');router.push('/');}}><LogOut/>Sign out</DropdownMenuItem>
     </DropdownMenuContent>
    </DropdownMenu> : <Button size="sm" onClick={()=>{if(onSignIn)onSignIn();else router.push('/login');}}>Sign in<LogIn/></Button>)}
   </div>
  </div>
 </header>;
}
