export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const fields = ['calories','protein','carbs','fat','serving','container','price'] as const;
export type Field = typeof fields[number];
export type Nutrition = Record<Field, number | null>;
export type Food = Nutrition & { id:number;name:string;unit:string };
const positive = (n:number|null): n is number => n !== null && Number.isFinite(n) && n > 0;
const nonnegative = (n:number|null): n is number => n !== null && Number.isFinite(n) && n >= 0;
export function metrics(f: Nutrition) {
 const servings = positive(f.container) && positive(f.serving) ? f.container/f.serving : null;
 const totalProtein = nonnegative(f.protein) && servings!==null ? f.protein*servings : null;
 return {
  density: nonnegative(f.protein) && positive(f.calories) ? f.protein/f.calories*100 : null,
  cost: positive(totalProtein) && nonnegative(f.price) ? f.price*100/totalProtein : null,
  totalProtein, servings,
  totalCalories: nonnegative(f.calories) && servings!==null ? f.calories*servings : null,
 };
}
export function calorieError(f:Nutrition) {
 const total=(f.protein??0)*4+(f.carbs??0)*4+(f.fat??0)*9;
 return f.calories!==null && total-f.calories>1e-9 ? `Macros total ${format(total,2)} kcal, exceeding the entered ${format(f.calories,2)} kcal.` : null;
}
export function format(n:number|null, digits=1){return n===null || !Number.isFinite(n)?'—':n.toLocaleString('en-GB',{maximumFractionDigits:digits});}
export function metricColor(value:number|null,type:'density'|'cost') {
 if(value===null) return {background:'var(--metric-empty)',color:'var(--muted-foreground)'};
 const score=Math.max(0,Math.min(1,type==='density'?(value-5)/15:(20-value)/17));
 return {background:`hsl(${12+score*92} var(--metric-saturation) var(--metric-lightness))`,color:`hsl(${12+score*92} var(--metric-ink-saturation) var(--metric-ink-lightness))`};
}
export function parseFood(input:unknown): Nutrition & {name:string;unit:string} {
 if(!input || typeof input!=='object')throw new Error('Invalid food.');
 const data=input as Record<string,unknown>;
 if(typeof data.name!=='string'||!data.name.trim()||data.name.trim().length>100)throw new Error('Enter a food name (up to 100 characters).');
 const values={} as Nutrition;
 for(const key of fields){
  const raw=data[key];
  if(raw===null || raw===undefined || raw===''){values[key]=null;continue;}
  if(typeof raw!=='number'||!Number.isFinite(raw)||raw<0||raw>1e9||(['calories','serving','container'].includes(key)&&raw===0))throw new Error(`Invalid ${key}.`);
  values[key]=raw;
 }
 return {...values,name:data.name.trim(),unit:'g'};
}
