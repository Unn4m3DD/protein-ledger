'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
export function ThemeSwitcher(){
 const {theme,setTheme}=useTheme();
 const [mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 const current=mounted?theme:'system';
 const Icon=current==='dark'?Moon:current==='light'?Sun:Monitor;
 return <Select value={current} onValueChange={setTheme}><SelectTrigger aria-label="Theme" title="Theme" className="size-8 justify-center border-0 px-0 shadow-none [&>svg:last-child]:hidden"><Icon className="size-4"/><span className="sr-only">Theme</span></SelectTrigger><SelectContent align="end"><SelectItem value="system"><Monitor className="size-4"/>System</SelectItem><SelectItem value="light"><Sun className="size-4"/>Light</SelectItem><SelectItem value="dark"><Moon className="size-4"/>Dark</SelectItem></SelectContent></Select>;
}
