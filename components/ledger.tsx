'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown, AlertCircle, Pencil, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calorieError, fields, format, metrics, metricColor, UUID_V4, type Field, type Food, type Nutrition } from '@/lib/food';
const empty=Object.fromEntries(fields.map(key=>[key,''])) as Record<Field,string>;
const labels:Record<Field,string>={calories:'Calories',protein:'Protein',carbs:'Carbs',fat:'Fat',serving:'Serving',container:'Container',price:'Price'};
type Sort='newest'|'density'|'cost'|'name';
export function Ledger({user}:{user?:string}){
 const router=useRouter();
 const [values,setValues]=useState({...empty}),[name,setName]=useState(''),[foods,setFoods]=useState<Food[]>([]);
 const [editing,setEditing]=useState<Food|null>(null);
 const previousDraft=useRef<{values:Record<Field,string>;name:string}|null>(null);
 const [sort,setSort]=useState<Sort>('newest'),[direction,setDirection]=useState(1),[busy,setBusy]=useState(false),[loading,setLoading]=useState(!!user),[loadError,setLoadError]=useState(false);
 const data=Object.fromEntries(fields.map(key=>{const raw=values[key].trim(),n=Number(raw);return [key,raw!==''&&Number.isFinite(n)&&n>=0&&n<=1e9&&(!['calories','serving','container'].includes(key)||n>0)?n:null];})) as Nutrition;
 const result=metrics(data),error=calorieError(data);
 useEffect(()=>{
  if(!user){const active=sessionStorage.getItem('activeUser');if(active&&UUID_V4.test(active))router.replace(`/u/${active}/foods`);}
  else sessionStorage.setItem('activeUser',user);
  const draft=sessionStorage.getItem('draft');if(draft){try{const parsed=JSON.parse(draft);setValues(Object.fromEntries(fields.map(key=>[key,String(parsed[key]??'')])) as Record<Field,string>);setName(parsed.name||'');}catch{}sessionStorage.removeItem('draft');}
 },[user,router]);
 useEffect(()=>{if(!user)return;let active=true;setLoading(true);setLoadError(false);fetch(`/api/u/${user}/foods`,{cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('Could not load foods.');return response.json();}).then(rows=>{if(active)setFoods(rows);}).catch(()=>{if(active)setLoadError(true);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[user]);
 function edit(food:Food){
  if(!editing)previousDraft.current={values:{...values},name};
  setEditing(food);
  setValues(Object.fromEntries(fields.map(key=>[key,String(food[key]??'')])) as Record<Field,string>);
  setName(food.name);
  document.getElementById('food-name')?.focus({preventScroll:true});
  document.getElementById('food-form')?.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function finishEditing(){
  setEditing(null);
  setValues(previousDraft.current?.values??{...empty});
  setName(previousDraft.current?.name??'');
  previousDraft.current=null;
 }
 function signIn(){sessionStorage.setItem('draft',JSON.stringify({...values,name}));router.push('/login');}
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(!user){signIn();return;}if(!name.trim()){toast.error('Enter a food name.');return;}
  setBusy(true);try{
   const response=await fetch(`/api/u/${user}/foods${editing?`/${editing.id}`:''}`,{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,name})});
   const body=await response.json();if(!response.ok)throw Error(body.error);
   const saved:Food={...data,name:name.trim(),id:body.id,unit:editing?.unit??'g'};
   setFoods(previous=>editing?previous.map(food=>food.id===editing.id?saved:food):[saved,...previous]);
   if(editing)finishEditing();else setName('');
   toast.success(editing?'Changes saved.':'Saved.');
  }catch(error){toast.error(error instanceof Error?error.message:'Could not save.');}finally{setBusy(false);}
 }
 async function remove(food:Food){setBusy(true);try{const response=await fetch(`/api/u/${user}/foods/${food.id}`,{method:'DELETE'});if(!response.ok)throw Error('Could not remove food.');setFoods(previous=>previous.filter(item=>item.id!==food.id));if(editing?.id===food.id)finishEditing();toast.success('Removed.');}catch(error){toast.error(error instanceof Error?error.message:'Could not remove.');}finally{setBusy(false);}}
 function changeSort(value:Sort){setSort(value);setDirection(value==='density'?-1:1);}
 function toggleSort(value:'density'|'cost'){if(sort===value)setDirection(-direction);else changeSort(value);}
 const rows=[...foods].sort((a,b)=>{if(sort==='newest')return b.id-a.id;if(sort==='name')return a.name.localeCompare(b.name);const av=metrics(a)[sort],bv=metrics(b)[sort];if(av===null)return bv===null?0:1;if(bv===null)return -1;return (av-bv)*direction;});
 function field(key:Field){return <div key={key} className="min-w-0 space-y-1.5"><Label htmlFor={key} className="flex items-center justify-between gap-1 text-xs"><span>{labels[key]}</span><span className="font-normal text-muted-foreground">{key==='calories'?'kcal':key==='price'?'€':['serving','container'].includes(key)?editing?.unit??'g':'g'}</span></Label><Input id={key} name={key} disabled={busy} type="number" min={['calories','serving','container'].includes(key)?'0.01':'0'} max="1000000000" step="any" value={values[key]} onChange={e=>setValues({...values,[key]:e.target.value})} aria-invalid={key==='calories'&&!!error} aria-describedby={key==='calories'&&error?'calorie-error':undefined} className="h-11 text-lg md:text-lg"/></div>;}
 return <><Header user={user} onSignIn={signIn}/><main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-8"><h1 className="sr-only">Food calculator</h1><div className="grid items-start gap-4 lg:grid-cols-[1.1fr_1fr]"><Card className="gap-4 py-5 shadow-none"><CardContent className="px-4 sm:px-5"><form id="food-form" onSubmit={save} className="scroll-mt-6 space-y-4">{editing&&<div className="flex items-center justify-between gap-2 text-sm"><p className="min-w-0 truncate">Editing <span className="font-medium">{editing.name}</span></p><Button type="button" variant="ghost" size="sm" disabled={busy} onClick={finishEditing}><X/>Cancel</Button></div>}<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{(['calories','protein','carbs','fat'] as Field[]).map(field)}</div>{error&&<Alert variant="destructive" id="calorie-error"><AlertCircle/><AlertDescription>{error}</AlertDescription></Alert>}<div className="border-t pt-4"><div className="grid grid-cols-3 gap-3">{(['serving','container','price'] as Field[]).map(field)}</div></div><div className="space-y-1.5 border-t pt-4"><Label htmlFor="food-name">Food name</Label><div className="flex flex-col gap-2 sm:flex-row"><Input id="food-name" disabled={busy} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Natural skyr" className="h-11"/><Button type="submit" disabled={busy} className="h-11"><Save/>{busy?'Saving…':editing?'Save changes':'Save food'}</Button></div></div></form></CardContent></Card><Card className="gap-0 bg-secondary py-4 shadow-none sm:py-5"><CardContent className="space-y-4 px-4 sm:px-5"><div className="grid grid-cols-2 gap-3">{(['density','cost'] as const).map(type=><div key={type} className="rounded-lg border border-black/5 p-3 sm:p-4" style={metricColor(result[type],type)}><div className="flex items-center justify-between gap-2 text-xs font-medium"><span>{type==='density'?'Protein / 100 kcal':'Cost / g protein'}</span><span title={type==='density'?'Higher is better':'Lower is better'}>{type==='density'?<ArrowUp size={13} aria-label="Higher is better"/>:<ArrowDown size={13} aria-label="Lower is better"/>}</span></div><div className="mt-3 flex items-baseline gap-1.5"><span id={type} className="text-4xl font-medium tracking-tight">{format(result[type])}</span><span className="text-sm">{type==='density'?'g':'¢'}</span></div></div>)}</div><div className="border-t pt-3"><h3 className="sr-only">Container totals</h3><div className="grid grid-cols-3 divide-x">{[[result.totalProtein,'container protein',' g'],[result.totalCalories,'container kcal',''],[result.servings,'servings','']].map(([value,label,suffix])=><div key={String(label)} className="px-3 first:pl-0"><p className="text-lg">{format(value as number|null,label==='container kcal'?0:1)}{value!==null?suffix:''}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}</div></div></CardContent></Card></div><section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-medium tracking-tight">Saved foods <span className="ml-1 text-sm text-muted-foreground">{foods.length}</span></h2><Select value={sort} onValueChange={value=>changeSort(value as Sort)}><SelectTrigger aria-label="Sort foods" className="w-40"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="newest">Recently added</SelectItem><SelectItem value="density">Protein density</SelectItem><SelectItem value="cost">Protein cost</SelectItem><SelectItem value="name">Food name A–Z</SelectItem></SelectContent></Select></div><div className="overflow-hidden rounded-xl border bg-card"><Table><TableHeader className="bg-secondary"><TableRow><TableHead>Food</TableHead><TableHead>Container / price</TableHead>{(['density','cost'] as const).map(type=><TableHead key={type} aria-sort={sort===type?(direction===1?'ascending':'descending'):'none'}><Button variant="ghost" size="sm" onClick={()=>toggleSort(type)}>{type==='density'?'Protein / 100 kcal':'Cents / g protein'}{sort!==type?<ArrowUpDown/>:direction===1?<ArrowUp/>:<ArrowDown/>}</Button></TableHead>)}<TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader><TableBody>{rows.map(food=>{const m=metrics(food);return <TableRow key={food.id} data-state={editing?.id===food.id?'selected':undefined}><TableCell className="py-4"><p className="font-medium">{food.name}</p><p className="mt-1 text-xs text-muted-foreground">{format(food.calories)} kcal · {format(food.protein)} g protein / {format(food.serving)} {food.unit}</p></TableCell><TableCell>{format(food.container)} {food.unit} / {food.price===null?'—':`€${food.price.toFixed(2)}`}</TableCell>{(['density','cost'] as const).map(type=><TableCell key={type}><span className="rounded-md px-2.5 py-1.5" style={metricColor(m[type],type)}>{format(m[type])}{m[type]===null?'':type==='density'?' g':' ¢'}</span></TableCell>)}<TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="icon" disabled={busy} onClick={()=>edit(food)} aria-label={`Edit ${food.name}`}><Pencil className="size-4 text-muted-foreground"/></Button><Button variant="ghost" size="icon" disabled={busy} onClick={()=>remove(food)} aria-label={`Delete ${food.name}`}><Trash2 className="size-4 text-muted-foreground"/></Button></div></TableCell></TableRow>;})}</TableBody></Table>{!rows.length&&<div className="space-y-1 px-4 py-6 text-center text-sm text-muted-foreground"><p>{loading?'Loading…':loadError?'Could not load foods. Refresh to retry.':'No saved foods.'}</p>{!user&&<Button variant="link" onClick={signIn}>Sign in to save</Button>}</div>}</div></section></main></>;
}
