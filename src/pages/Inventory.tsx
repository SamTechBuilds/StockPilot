import {useState} from 'react';
import {Plus} from 'lucide-react';
import {useApp} from '../lib/store';
import {statusOf,MoveType} from '../types';
import {Head,Table,Empty,Badge,Modal,Field,Err,DateRange,inRange,fdate} from '../components/ui';
export default function Inventory(){const {s,moveStock}=useApp();
 const [open,setOpen]=useState(false);const [f,setF]=useState('');const [t,setT]=useState('');const [pid,setPid]=useState('');const [ty,setTy]=useState('');
 const [form,setForm]=useState({productId:'',type:'in' as 'in'|'out'|'adjust',qty:1,reason:'',date:new Date().toISOString().slice(0,10)});const [e,setE]=useState<string|null>(null);
 const alerts=s.products.filter(p=>statusOf(p)!=='In Stock');const name=(id:string)=>s.products.find(p=>p.id===id)?.name||'(deleted)';
 const rows=[...s.movements].filter(m=>inRange(m.date,f,t)&&(!pid||m.productId===pid)&&(!ty||m.type===ty)).sort((a,b)=>b.date.localeCompare(a.date));
 const cur=s.products.find(p=>p.id===form.productId);
 return <div><Head title="Inventory"><button className="btn btn-p" onClick={()=>{setE(null);setOpen(true)}}><Plus size={16}/>New transaction</button></Head>
 {alerts.length>0&&<div className="card mb-3 border-amber-300 bg-amber-50"><h3 className="font-semibold text-sm mb-1">Stock alerts ({alerts.length})</h3><div className="flex flex-wrap gap-2">{alerts.map(p=><span key={p.id} className="text-xs bg-white border rounded-full px-2 py-1">{p.name}: {p.qty} left <Badge v={statusOf(p)}/></span>)}</div></div>}
 <div className="card mb-3 flex flex-wrap gap-2 items-center"><DateRange from={f} to={t} set={(a,b)=>{setF(a);setT(b)}}/><select className="input w-auto" value={pid} onChange={e=>setPid(e.target.value)}><option value="">All products</option>{s.products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
  <select className="input w-auto" value={ty} onChange={e=>setTy(e.target.value)}><option value="">All types</option><option value="in">Stock in</option><option value="out">Stock out</option><option value="adjust">Adjustment</option><option value="sale">Sale</option></select></div>
 <Table head={['Date','Product','Type','Change','Before','After','Reason']}>{rows.map(m=><tr key={m.id}><td className="td">{fdate(m.date)}</td><td className="td">{name(m.productId)}</td><td className="td"><Badge v={m.type}/></td><td className={`td font-medium ${m.qty<0?'text-red-600':'text-emerald-600'}`}>{m.qty>0?'+':''}{m.qty}</td><td className="td">{m.before}</td><td className="td">{m.after}</td><td className="td">{m.reason}</td></tr>)}<Empty n={rows.length} cols={7}/></Table>
 {open&&<Modal title="Stock transaction" onClose={()=>setOpen(false)}><div className="grid gap-3">
  <Field label="Product"><select className="input" value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}><option value="">Select…</option>{s.products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.qty})</option>)}</select></Field>
  <Field label="Type"><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value as MoveType&('in'|'out'|'adjust')})}><option value="in">Stock in</option><option value="out">Stock out</option><option value="adjust">Manual adjustment (set counted qty)</option></select></Field>
  <Field label={form.type==='adjust'?'New counted quantity':'Quantity'}><input type="number" min={0} className="input" value={form.qty} onChange={e=>setForm({...form,qty:+e.target.value})}/></Field>
  <Field label="Date"><input type="date" className="input" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field><Field label="Reason"><input className="input" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="e.g. Supplier delivery, damaged goods, recount"/></Field>
  {cur&&<p className="text-xs text-slate-500">Current stock: {cur.qty}</p>}</div><Err e={e}/>
  <div className="flex justify-end gap-2 mt-3"><button className="btn" onClick={()=>setOpen(false)}>Cancel</button><button className="btn btn-p" onClick={()=>{const r=moveStock(form);setE(r);if(!r){setOpen(false);setForm({...form,qty:1,reason:''})}}}>Save</button></div></Modal>}</div>}
