import {State,Product,Sale,Movement,Method,PayStatus} from '../types';
const CATS:Record<string,[string,number][]>={
'Groceries':[['Basmati Rice 5kg',380],['Toor Dal 1kg',140],['Sunflower Oil 1L',125],['Whole Wheat Atta 10kg',390],['Masala Tea 500g',210],['Sugar 5kg',205]],
'Electronics':[['USB-C Cable 1m',90],['Wireless Mouse',320],['Bluetooth Speaker',780],['20000mAh Power Bank',950],['LED Bulb 9W (Pack of 4)',280],['Earphones with Mic',210]],
'Stationery':[['A4 Notebook 200pg',60],['Gel Pen Box (10)',95],['Sticky Notes Pack',45],['A4 Paper Ream 500',280],['Desk Organizer',230],['Marker Set (4)',110]],
'Personal Care':[['Herbal Shampoo 340ml',160],['Bath Soap (Pack of 4)',130],['Toothpaste 150g',70],['Face Wash 100ml',120],['Hand Sanitizer 500ml',150],['Coconut Hair Oil 200ml',85]],
'Home & Kitchen':[['Steel Water Bottle 1L',260],['Non-stick Tawa 28cm',420],['Glass Food Container Set',540],['Microfiber Cloth (3)',90],['Dish Wash Liquid 750ml',105],['Plastic Storage Box 20L',240]]};
const SUP=[['Sri Lakshmi Traders','Ramesh Kumar','Chennai'],['Annapurna Wholesale','Meena Iyer','Coimbatore'],['Bharat Electronics Hub','Suresh Reddy','Hyderabad'],['Deccan Stationers','Anita Rao','Bengaluru'],['Kaveri Distributors','Mohan Das','Salem'],['Nilgiri Care Products','Priya Nair','Kochi'],['Urban Home Supplies','Vikram Shah','Pune'],['Metro Cash & Carry Agency','Farida Khan','Mumbai']];
const CUS=['Arjun Mehta','Divya Krishnan','Karthik Raman','Lakshmi Narayanan','Mohammed Irfan','Nisha Patel','Pooja Sharma','Rahul Verma','Sangeetha Pillai','Tarun Gupta','Uma Maheswari','Vijay Anand','Waseem Ahmed','Yamini Subramanian','Zoya Fernandes'];
export const SEED_DEFAULTS={business:'StockPilot Retail Demo',phone:'+91 98765 43210',email:'hello@stockpilot.example',address:'12, Market Road, Salem, Tamil Nadu 636001',currency:'INR',minDefault:10};
export function seed(now=new Date()):State{
 let r=7;const rnd=()=>{r=(r*16807)%2147483647;return r/2147483647};
 const day=(d:number,h=11)=>{const t=new Date(now);t.setDate(t.getDate()-d);t.setHours(h,Math.floor(rnd()*59),0,0);return t.toISOString()};
 const suppliers=SUP.map((s,i)=>({id:'sup'+(i+1),name:s[0],contact:s[1],phone:`+91 9${String(800000000+i*1234567).slice(0,9)}`,email:`sales${i+1}@${s[0].split(' ')[0].toLowerCase()}.example`,address:`${10+i*7}, Trade Street, ${s[2]}`}));
 const customers=CUS.map((n,i)=>({id:'cus'+(i+1),name:n,phone:`+91 8${String(700000000+i*2345671).slice(0,9)}`,email:`${n.split(' ')[0].toLowerCase()}@mail.example`}));
 const products:Product[]=[];let k=0;
 Object.entries(CATS).forEach(([cat,list],ci)=>list.forEach(([name,buy],j)=>{const f=k%7===0?0:k%7===1?4:12+Math.floor(rnd()*70);
  products.push({id:'p'+(k+1),name,sku:cat.slice(0,3).toUpperCase()+'-'+String(k+1).padStart(3,'0'),barcode:'890'+String(1000000000+k*7919).slice(0,10),category:cat,description:`${name} — quality assured retail pack.`,buy,sell:Math.round(buy*(1.15+rnd()*0.2)),qty:f,min:10,supplierId:suppliers[(ci+j)%8].id,image:''});k++}));
 const sold:Record<string,number>={};const sales:Sale[]=[];const mv:Movement[]=[];
 const methods:Method[]=['Cash','UPI','Card','Other'];
 for(let i=0;i<20;i++){const d=day(28-Math.round(i*1.4));const n=1+Math.floor(rnd()*3);const items=[];const used=new Set<string>();
  while(items.length<n){const p=products[Math.floor(rnd()*products.length)];if(used.has(p.id))continue;used.add(p.id);const q=1+Math.floor(rnd()*4);sold[p.id]=(sold[p.id]||0)+q;items.push({productId:p.id,name:p.name,qty:q,price:p.sell,cost:p.buy})}
  const subtotal=items.reduce((a,x)=>a+x.qty*x.price,0);const discount=i%4===0?Math.round(subtotal*0.05):0;const total=subtotal-discount;
  const st:PayStatus=i%6===5?'Pending':i%6===3?'Partially Paid':'Paid';const paid=st==='Paid'?total:st==='Pending'?0:Math.round(total/2);const c=customers[i%15];
  sales.push({id:'s'+(i+1),invoice:`INV-${d.slice(0,4)}-${String(i+1).padStart(4,'0')}`,date:d,customerId:c.id,customerName:c.name,customerPhone:c.phone,items,subtotal,discount,total,method:methods[i%4],status:st,paid})}
 products.forEach(p=>{const open=p.qty+(sold[p.id]||0);if(open>0)mv.push({id:'m-o'+p.id,date:day(45,9),productId:p.id,type:'in',qty:open,before:0,after:open,reason:'Opening stock'});});
 sales.forEach(s=>s.items.forEach((it,j)=>{const cur=mv.filter(m=>m.productId===it.productId).slice(-1)[0];const before=cur?cur.after:0;mv.push({id:`m-${s.id}-${j}`,date:s.date,productId:it.productId,type:'sale',qty:-it.qty,before,after:before-it.qty,reason:`Sale ${s.invoice}`})}));
 mv.sort((a,b)=>a.date.localeCompare(b.date));
 return {products,suppliers,customers,sales,movements:mv,settings:{...SEED_DEFAULTS}};
}
