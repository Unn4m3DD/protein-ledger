'use client';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
function Notifications(){
 const {resolvedTheme}=useTheme();
 return <Toaster richColors theme={resolvedTheme==='dark'?'dark':'light'}/>;
}
export function ThemeProvider({children}:{children:React.ReactNode}){
 return <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="protein-ledger-theme">{children}<Notifications/></NextThemesProvider>;
}
