import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
export const metadata: Metadata = { title:'Protein Ledger', description:'Compare protein density and cost.', referrer:'no-referrer', robots:{index:false,follow:false} };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>; }
