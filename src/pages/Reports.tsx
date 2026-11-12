import {useState} from 'react';
import {Download,Printer} from 'lucide-react';
import {useApp} from '../lib/store';
import {statusOf} from '../types';
import {Head,DateRange,inRange,csv,fdate} from '../components/ui';
type R={head:string[];rows:(string|number)[][]};
const TABS=[['sales','Sales'],['valuation','Inventory valuation'],['low','Low stock'],['performance','Product performance'],['profit','Profit summary'],['supplier','Suppliers']] as const;
export default function Reports(){const {s,money}=useApp();const [tab,setTab]=useState<string>('sales');const [f,setF]=useState('');const [t,setT]=useState('');
 const sales=s.sales.filter(x=>inRange(x.date,f,t));const sup=(id:string)=>s.suppliers.find(x=>x.id===id)?.name||'—';
 const perf:Record<string,{n:string;q:number;rev:number;cost:number}>={};sales.forEach(x=>x.items.forEach(i=>{const p=perf[i.productId]||(perf[i.productId]={n:i.name,q:0,rev:0,cost:0});p.q+=i.qty;p.rev+=i.qty*i.price;p.cost+=i.qty*i.cost}));
 const rev=sales.reduce((a,x)=>a+x.total,0),disc=sales.reduce((a,x)=>a+x.discount,0),sub=sales.reduce((a,x)=>a+x.subtotal,0);const cogs=sales.reduce((a,x)=>a+x.items.reduce((b,i)=>b+i.qty*i.cost,0),0);
 const reports:Record<string,R>={
 sales:{head:['Invoice','Date','Customer','Method','Status','Subtotal','Discount','Total','Paid'],rows:[...sales].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>[x.invoice,fdate(x.date),x.customerName,x.method,x.status,x.subtotal,x.discount,x.total,x.paid])},
 valuation:{head:['Product','SKU','Category','Stock','Unit cost','Cost value','Retail value'],rows:s.products.map(p=>[p.name,p.sku,p.category,p.qty,p.buy,p.qty*p.buy,p.qty*p.sell])},
 low:{head:['Product','SKU','Stock','Minimum','Status','Supplier'],rows:s.products.filter(p=>statusOf(p)!=='In Stock').map(p=>[p.name,p.sku,p.qty,p.min,statusOf(p),sup(p.supplierId)])},
 performance:{head:['Product','Units sold','Revenue','Cost','Profit'],rows:Object.values(perf).sort((a,b)=>b.rev-a.rev).map(p=>[p.n,p.q,p.rev,p.cost,p.rev-p.cost])},
 profit:{head:['Metric','Value'],rows:[['Invoices',sales.length],['Gross sales (before discount)',sub],['Discounts',disc],['Net revenue',rev],['Cost of goods sold',cogs],['Gross profit',rev-cogs],['Margin %',rev?+((rev-cogs)/rev*100).toFixed(1):0],['Outstanding receivables',sales.reduce((a,x)=>a+x.total-x.paid,0)]]},
 supplier:{head:['Supplier','Products','Stock units','Stock value','Units sold (range)'],rows:s.suppliers.map(u=>{const ps=s.products.filter(p=>p.supplierId===u.id);return [u.name,ps.length,ps.reduce((a,p)=>a+p.qty,0),ps.reduce((a,p)=>a+p.qty*p.buy,0),ps.reduce((a,p)=>a+(perf[p.id]?.q||0),0)]})}};
 const r=reports[tab];const moneyCols=/price|cost|value|revenue|profit|total|subtotal|discount|paid|sales/i;const fmt=(v:string|number,h:string,row:(string|number)[])=>typeof v==='number'&&(tab==='profit'?(row[0] as string).match(/sales|Discounts|revenue|Cost|profit|receivables/i)&&h==='Value':moneyCols.test(h)&&!/units/i.test(h))?money(v):v;
 return <div><Head title="Reports"><DateRange from={f} to={t} set={(a,b)=>{setF(a);setT(b)}}/><button className="btn" onClick={()=>csv('stockpilot-'+tab,r.head,r.rows)}><Download size={16}/>CSV</button><button className="btn btn-p" onClick={()=>window.print()}><Printer size={16}/>Print</button></Head>
 <div className="flex flex-wrap gap-2 mb-3 no-print">{TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`btn ${tab===k?'btn-p':''}`}>{l}</button>)}</div>
 <div className="card p-0 overflow-x-auto print-area"><div className="p-3 font-semibold">{TABS.find(x=>x[0]===tab)![1]} report{(f||t)&&tab!=='valuation'&&tab!=='low'?` (${f||'start'} to ${t||'today'})`:''} — {s.settings.business}</div>
 <table className="w-full"><thead><tr>{r.head.map(h=><th key={h} className="th">{h}</th>)}</tr></thead><tbody>{r.rows.map((row,i)=><tr key={i}>{row.map((v,j)=><td key={j} className="td">{fmt(v,r.head[j],row)}</td>)}</tr>)}{!r.rows.length&&<tr><td className="td text-center text-slate-400" colSpan={r.head.length}>No data for this selection</td></tr>}</tbody></table></div></div>}
