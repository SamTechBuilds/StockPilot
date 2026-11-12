import {ReactNode} from 'react';
import {X} from 'lucide-react';
import {Status} from '../types';
export const Modal=({title,onClose,children,wide}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean})=>(
 <div className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-2 overflow-y-auto no-print-bg">
  <div className={`bg-white rounded-xl w-full ${wide?'max-w-3xl':'max-w-lg'} my-4`}><div className="flex items-center justify-between border-b px-4 py-3 no-print"><h3 className="font-semibold">{title}</h3><button onClick={onClose} aria-label="Close"><X size={18}/></button></div><div className="p-4">{children}</div></div></div>);
export const Confirm=({msg,onYes,onNo}:{msg:string;onYes:()=>void;onNo:()=>void})=>(
 <Modal title="Please confirm" onClose={onNo}><p className="text-sm mb-4">{msg}</p><div className="flex justify-end gap-2"><button className="btn" onClick={onNo}>Cancel</button><button className="btn btn-d" onClick={onYes}>Confirm</button></div></Modal>);
export const Field=({label,children}:{label:string;children:ReactNode})=>(<label className="block text-sm"><span className="text-slate-600 text-xs font-medium">{label}</span>{children}</label>);
export const Err=({e}:{e:string|null})=>e?<p className="text-sm text-red-600 bg-red-50 rounded p-2 mt-2">{e}</p>:null;
const col:Record<string,string>={'In Stock':'bg-emerald-100 text-emerald-700','Low Stock':'bg-amber-100 text-amber-700','Out of Stock':'bg-red-100 text-red-700','Paid':'bg-emerald-100 text-emerald-700','Pending':'bg-red-100 text-red-700','Partially Paid':'bg-amber-100 text-amber-700',in:'bg-emerald-100 text-emerald-700',out:'bg-red-100 text-red-700',sale:'bg-indigo-100 text-indigo-700',adjust:'bg-slate-200 text-slate-700'};
export const Badge=({v}:{v:Status|string})=><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${col[v]||''}`}>{v}</span>;
export const Head=({title,children}:{title:string;children?:ReactNode})=>(<div className="flex flex-wrap items-center justify-between gap-2 mb-4 no-print"><h1 className="text-xl font-bold text-slate-900">{title}</h1><div className="flex flex-wrap gap-2">{children}</div></div>);
export const Table=({head,children}:{head:string[];children:ReactNode})=>(<div className="card p-0 overflow-x-auto"><table className="w-full"><thead><tr>{head.map(h=><th key={h} className="th">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>);
export const Empty=({n,cols}:{n:number;cols:number})=>n?null:<tr><td className="td text-center text-slate-400" colSpan={cols}>No records found</td></tr>;
export const DateRange=({from,to,set}:{from:string;to:string;set:(f:string,t:string)=>void})=>(<div className="flex items-center gap-1 text-sm"><input type="date" className="input" value={from} onChange={e=>set(e.target.value,to)}/><span>–</span><input type="date" className="input" value={to} onChange={e=>set(from,e.target.value)}/></div>);
export const inRange=(d:string,f:string,t:string)=>(!f||d.slice(0,10)>=f)&&(!t||d.slice(0,10)<=t);
export const fdate=(d:string)=>new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
export function csv(name:string,head:string[],rows:(string|number)[][]){const q=(v:string|number)=>`"${String(v).replace(/"/g,'""')}"`;const t=[head,...rows].map(r=>r.map(q).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name+'.csv';a.click();URL.revokeObjectURL(a.href)}
