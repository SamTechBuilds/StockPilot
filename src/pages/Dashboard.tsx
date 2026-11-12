import {useApp} from '../lib/store';
import {statusOf} from '../types';
import {Head,Badge,fdate} from '../components/ui';
import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell,Legend,CartesianGrid} from 'recharts';
import {Package,Boxes,Wallet,IndianRupee,CalendarDays,AlertTriangle,PackageX,Truck} from 'lucide-react';
const COL=['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6'];
export default function Dashboard(){const {s,money}=useApp();
 const today=new Date().toISOString().slice(0,10);
 const kpi=[[Package,'Total products',s.products.length],[Boxes,'Stock units',s.products.reduce((a,p)=>a+p.qty,0)],[Wallet,'Inventory value',money(s.products.reduce((a,p)=>a+p.qty*p.buy,0))],[IndianRupee,'Total sales',money(s.sales.reduce((a,x)=>a+x.total,0))],[CalendarDays,"Today's sales",money(s.sales.filter(x=>x.date.slice(0,10)===today).reduce((a,x)=>a+x.total,0))],[AlertTriangle,'Low stock',s.products.filter(p=>statusOf(p)==='Low Stock').length],[PackageX,'Out of stock',s.products.filter(p=>statusOf(p)==='Out of Stock').length],[Truck,'Suppliers',s.suppliers.length]] as const;
 const trend=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));const k=d.toISOString().slice(0,10);return {day:k.slice(5),sales:s.sales.filter(x=>x.date.slice(0,10)===k).reduce((a,x)=>a+x.total,0)}});
 const cat:Record<string,number>={};s.products.forEach(p=>cat[p.category]=(cat[p.category]||0)+p.qty);
 const top:Record<string,number>={};s.sales.forEach(x=>x.items.forEach(i=>top[i.name]=(top[i.name]||0)+i.qty));
 const topList=Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5);
 const recent=[...s.sales].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
 return <div><Head title="Dashboard"/>
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">{kpi.map(([I,l,v])=><div key={l} className="card flex items-center gap-3"><div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><I size={20}/></div><div><div className="text-xs text-slate-500">{l}</div><div className="font-bold text-lg">{v}</div></div></div>)}</div>
 <div className="grid lg:grid-cols-3 gap-3 mb-4">
  <div className="card lg:col-span-2"><h3 className="font-semibold mb-2">Sales trend (14 days)</h3><div className="h-64"><ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="day" fontSize={11}/><YAxis fontSize={11}/><Tooltip formatter={(v:number)=>money(v)}/><Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div></div>
  <div className="card"><h3 className="font-semibold mb-2">Stock by category</h3><div className="h-64"><ResponsiveContainer><PieChart><Pie data={Object.entries(cat).map(([name,value])=>({name,value}))} dataKey="value" nameKey="name" outerRadius={80}>{Object.keys(cat).map((_,i)=><Cell key={i} fill={COL[i%6]}/>)}</Pie><Tooltip/><Legend wrapperStyle={{fontSize:11}}/></PieChart></ResponsiveContainer></div></div></div>
 <div className="grid lg:grid-cols-2 gap-3">
  <div className="card"><h3 className="font-semibold mb-2">Recent sales</h3>{recent.map(x=><div key={x.id} className="flex justify-between items-center py-1.5 border-t text-sm"><div><div className="font-medium">{x.invoice}</div><div className="text-xs text-slate-500">{x.customerName} · {fdate(x.date)}</div></div><div className="text-right"><div>{money(x.total)}</div><Badge v={x.status}/></div></div>)}</div>
  <div className="card"><h3 className="font-semibold mb-2">Top-selling products</h3>{topList.map(([n,q])=><div key={n} className="flex justify-between py-1.5 border-t text-sm"><span>{n}</span><span className="font-medium">{q} units</span></div>)}</div></div></div>}
