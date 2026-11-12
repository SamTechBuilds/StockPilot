import {createContext,useContext,useEffect,useState,useCallback,ReactNode} from 'react';
import {State,Product,Supplier,Customer,Sale,Movement,Settings,Method,PayStatus} from '../types';
import {seed} from './seed';
const KEY='stockpilot-v1';
const load=():State=>{try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch{}return seed()};
export type SaleInput={customerId:string;customerName:string;customerPhone:string;items:{productId:string;qty:number}[];discount:number;method:Method;status:PayStatus;paid:number};
type Err=string|null;
interface Ctx{s:State;money:(n:number)=>string;toasts:{id:number;m:string;k:string}[];toast:(m:string,k?:'ok'|'err'|'warn')=>void;
 saveProduct:(p:Product)=>Err;deleteProduct:(id:string)=>Err;
 moveStock:(i:{productId:string;type:'in'|'out'|'adjust';qty:number;reason:string;date:string})=>Err;
 createSale:(i:SaleInput)=>{err?:string;sale?:Sale};recordPayment:(id:string,amt:number)=>Err;
 saveSupplier:(x:Supplier)=>Err;deleteSupplier:(id:string)=>Err;saveCustomer:(c:Customer)=>Err;saveSettings:(x:Settings)=>void;reset:()=>void}
const C=createContext<Ctx>(null as any);
export const useApp=()=>useContext(C);
const uid=(p:string)=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export function Provider({children}:{children:ReactNode}){
 const [s,setS]=useState<State>(load);const [toasts,setT]=useState<Ctx['toasts']>([]);
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(s))},[s]);
 const toast=useCallback((m:string,k:'ok'|'err'|'warn'='ok')=>{const id=Date.now()+Math.random();setT(t=>[...t,{id,m,k}]);setTimeout(()=>setT(t=>t.filter(x=>x.id!==id)),4000)},[]);
 const money=(n:number)=>{try{return new Intl.NumberFormat(s.settings.currency==='INR'?'en-IN':'en-US',{style:'currency',currency:s.settings.currency,maximumFractionDigits:2}).format(n)}catch{return String(n)}};
 const stockAlert=(p:{name:string;min:number},after:number)=>{if(after<=0)toast(`${p.name} is OUT OF STOCK`,'err');else if(after<=p.min)toast(`Low stock: ${p.name} has ${after} left`,'warn')};
 const saveProduct=(p:Product):Err=>{
  if(!p.name.trim()||!p.sku.trim())return 'Name and SKU are required';
  if(!(p.buy>=0)||!(p.sell>=0)||!(p.qty>=0)||!(p.min>=0)||!Number.isInteger(p.qty))return 'Prices must be ≥ 0 and stock a whole number ≥ 0';
  if(s.products.some(x=>x.id!==p.id&&x.sku.trim().toLowerCase()===p.sku.trim().toLowerCase()))return 'SKU already exists';
  const ex=s.products.find(x=>x.id===p.id);
  if(ex){setS({...s,products:s.products.map(x=>x.id===p.id?{...p,qty:ex.qty}:x)})}
  else{const mv:Movement[]=p.qty>0?[{id:uid('m'),date:new Date().toISOString(),productId:p.id,type:'in',qty:p.qty,before:0,after:p.qty,reason:'Opening stock'}]:[];setS({...s,products:[...s.products,p],movements:[...s.movements,...mv]})}
  toast(ex?'Product updated':'Product added');return null};
 const deleteProduct=(id:string):Err=>{if(s.sales.some(x=>x.items.some(i=>i.productId===id)))return 'Cannot delete: product appears in existing invoices';
  setS({...s,products:s.products.filter(p=>p.id!==id),movements:s.movements.filter(m=>m.productId!==id)});toast('Product deleted');return null};
 const moveStock:Ctx['moveStock']=i=>{const p=s.products.find(x=>x.id===i.productId);if(!p)return 'Select a product';
  if(!Number.isInteger(i.qty)||i.qty<(i.type==='adjust'?0:1))return i.type==='adjust'?'Enter the counted quantity (whole number ≥ 0)':'Quantity must be a whole number ≥ 1';
  if(!i.reason.trim())return 'Reason is required';const before=p.qty;
  const after=i.type==='in'?before+i.qty:i.type==='out'?before-i.qty:i.qty;if(after<0)return `Insufficient stock: only ${before} available`;
  const m:Movement={id:uid('m'),date:new Date(i.date).toISOString(),productId:p.id,type:i.type,qty:after-before,before,after,reason:i.reason.trim()};
  setS({...s,products:s.products.map(x=>x.id===p.id?{...x,qty:after}:x),movements:[...s.movements,m]});toast('Stock updated');stockAlert(p,after);return null};
 const createSale:Ctx['createSale']=i=>{
  const agg:Record<string,number>={};i.items.forEach(x=>{if(x.productId)agg[x.productId]=(agg[x.productId]||0)+x.qty});const ids=Object.keys(agg);
  if(!ids.length)return {err:'Add at least one product'};
  for(const id of ids){const p=s.products.find(x=>x.id===id)!;if(!Number.isInteger(agg[id])||agg[id]<1)return {err:'Quantities must be whole numbers ≥ 1'};if(agg[id]>p.qty)return {err:`${p.name}: only ${p.qty} in stock`}}
  const items=ids.map(id=>{const p=s.products.find(x=>x.id===id)!;return {productId:id,name:p.name,qty:agg[id],price:p.sell,cost:p.buy}});
  const subtotal=items.reduce((a,x)=>a+x.qty*x.price,0);const discount=Math.max(0,i.discount||0);if(discount>subtotal)return {err:'Discount exceeds subtotal'};const total=subtotal-discount;
  let paid=i.status==='Paid'?total:i.status==='Pending'?0:i.paid;if(i.status==='Partially Paid'&&!(paid>0&&paid<total))return {err:'Partial payment must be above 0 and below the total'};
  const n=s.sales.reduce((a,x)=>Math.max(a,parseInt(x.invoice.split('-')[2]||'0')),0)+1;const now=new Date();const invoice=`INV-${now.getFullYear()}-${String(n).padStart(4,'0')}`;
  let customers=s.customers;let cid=i.customerId;let cname=i.customerName.trim();let cph=i.customerPhone.trim();
  if(cid){const c=customers.find(x=>x.id===cid)!;cname=c.name;cph=c.phone}else if(cname){cid=uid('cus');customers=[...customers,{id:cid,name:cname,phone:cph,email:''}]}else cname='Walk-in customer';
  const sale:Sale={id:uid('s'),invoice,date:now.toISOString(),customerId:cid,customerName:cname,customerPhone:cph,items,subtotal,discount,total,method:i.method,status:i.status,paid};
  const mvs:Movement[]=items.map(it=>{const p=s.products.find(x=>x.id===it.productId)!;return {id:uid('m'),date:sale.date,productId:p.id,type:'sale',qty:-it.qty,before:p.qty,after:p.qty-it.qty,reason:`Sale ${invoice}`}});
  setS({...s,customers,sales:[...s.sales,sale],movements:[...s.movements,...mvs],products:s.products.map(p=>{const it=items.find(x=>x.productId===p.id);return it?{...p,qty:p.qty-it.qty}:p})});
  toast(`Invoice ${invoice} created`);items.forEach(it=>{const p=s.products.find(x=>x.id===it.productId)!;stockAlert(p,p.qty-it.qty)});return {sale}};
 const recordPayment=(id:string,amt:number):Err=>{const x=s.sales.find(v=>v.id===id);if(!x)return 'Invoice not found';if(!(amt>0))return 'Enter an amount above 0';if(amt>x.total-x.paid)return 'Amount exceeds balance due';
  const paid=x.paid+amt;setS({...s,sales:s.sales.map(v=>v.id===id?{...v,paid,status:paid>=v.total?'Paid':'Partially Paid'}:v)});toast('Payment recorded');return null};
 const saveSupplier=(x:Supplier):Err=>{if(!x.name.trim())return 'Supplier name is required';const ex=s.suppliers.some(v=>v.id===x.id);setS({...s,suppliers:ex?s.suppliers.map(v=>v.id===x.id?x:v):[...s.suppliers,x]});toast('Supplier saved');return null};
 const deleteSupplier=(id:string):Err=>{const n=s.products.filter(p=>p.supplierId===id).length;if(n)return `Cannot delete: ${n} product(s) are linked to this supplier`;setS({...s,suppliers:s.suppliers.filter(v=>v.id!==id)});toast('Supplier deleted');return null};
 const saveCustomer=(c:Customer):Err=>{if(!c.name.trim())return 'Customer name is required';const ex=s.customers.some(v=>v.id===c.id);
  setS({...s,customers:ex?s.customers.map(v=>v.id===c.id?c:v):[...s.customers,c],sales:s.sales.map(v=>v.customerId===c.id?{...v,customerName:c.name,customerPhone:c.phone}:v)});toast('Customer saved');return null};
 const saveSettings=(x:Settings)=>{setS({...s,settings:x});toast('Settings saved')};
 const reset=()=>{setS(seed());toast('Demo data restored')};
 return <C.Provider value={{s,money,toasts,toast,saveProduct,deleteProduct,moveStock,createSale,recordPayment,saveSupplier,deleteSupplier,saveCustomer,saveSettings,reset}}>{children}</C.Provider>}
export const uidOf=uid;
