import {useState} from 'react';
import {useApp} from '../lib/store';
import {Head,Field,Confirm} from '../components/ui';
export default function SettingsPage(){const {s,saveSettings,reset}=useApp();const [x,setX]=useState(s.settings);const [c,setC]=useState(false);
 return <div><Head title="Settings"/><div className="card max-w-2xl grid sm:grid-cols-2 gap-3">
  <Field label="Business name"><input className="input" value={x.business} onChange={e=>setX({...x,business:e.target.value})}/></Field><Field label="Phone"><input className="input" value={x.phone} onChange={e=>setX({...x,phone:e.target.value})}/></Field>
  <Field label="Email"><input className="input" value={x.email} onChange={e=>setX({...x,email:e.target.value})}/></Field><Field label="Currency"><select className="input" value={x.currency} onChange={e=>setX({...x,currency:e.target.value})}><option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option></select></Field>
  <div className="sm:col-span-2"><Field label="Address"><input className="input" value={x.address} onChange={e=>setX({...x,address:e.target.value})}/></Field></div>
  <Field label="Default low-stock threshold (for new products)"><input type="number" min={0} className="input" value={x.minDefault} onChange={e=>setX({...x,minDefault:+e.target.value})}/></Field>
  <div className="sm:col-span-2 flex gap-2 justify-between"><button className="btn btn-p" onClick={()=>saveSettings(x)}>Save settings</button><button className="btn btn-d" onClick={()=>setC(true)}>Reset demo data</button></div></div>
 {c&&<Confirm msg="This erases ALL current data (products, sales, customers, history) and restores the demo data. Continue?" onNo={()=>setC(false)} onYes={()=>{reset();setC(false);setX(s.settings)}}/>}</div>}
