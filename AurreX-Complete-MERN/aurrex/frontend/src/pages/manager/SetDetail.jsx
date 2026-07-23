import{useState,useEffect,useRef,useCallback}from'react'
import{useParams,useNavigate}from'react-router-dom'
import{ArrowLeft,Save,Plus,Trash2,Download,Image,X}from'lucide-react'
import toast from'react-hot-toast'
import api from'../../lib/axios'
import{n,fmt}from'../../lib/utils'
import CalcInput from'../../components/CalcInput'
import{generateSetPDF}from'../../lib/pdfExport'
const emptySet=()=>({setName:'',givenBy:'',image:'',goldUsed:0,totalGems:0,gemPrice:0,persons:[],gemTable:[],notes:''})
function SC({title,children,action}){return(<div className="section-card"><div className="flex items-center justify-between mb-4"><h2 className="font-bold">{title}</h2>{action}</div>{children}</div>)}
function Fld({label,children}){return(<div><label className="label">{label}</label>{children}</div>)}
export default function ManagerSetDetail(){
  const{id}=useParams();const isNew=id==='new'||!id;const navigate=useNavigate()
  const[set,setSet]=useState(emptySet());const[loading,setLoading]=useState(!isNew);const[saving,setSaving]=useState(false);const[savedId,setSavedId]=useState(null)
  const fileRef=useRef();const debRef=useRef();const sid=savedId||(isNew?null:id)
  useEffect(()=>{if(isNew)return;api.get('/sets/'+id).then(({data})=>setSet(data.set)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false))},[id])
  const autoSave=useCallback(async(data)=>{if(!sid)return;clearTimeout(debRef.current);debRef.current=setTimeout(async()=>{try{await api.put('/sets/'+sid,data)}catch{}},800)},[sid])
  const setF=(f,v)=>setSet(prev=>{const next={...prev,[f]:v};autoSave(next);return next})
  const upd=(fn)=>setSet(prev=>{const next=fn(prev);autoSave(next);return next})
  const addPerson=()=>upd(p=>({...p,persons:[...(p.persons||[]),{name:'',goldUsed:0,totalGems:0}]}))
  const delPerson=(i)=>upd(p=>({...p,persons:p.persons.filter((_,idx)=>idx!==i)}))
  const setPerson=(i,f,v)=>upd(p=>{const rows=[...(p.persons||[])];rows[i]={...rows[i],[f]:v};return{...p,persons:rows}})
  const addGem=()=>upd(p=>({...p,gemTable:[...(p.gemTable||[]),{gemType:'',gemWeight:0,gemWeightUnit:'gram',gemPrice:0,pricePerGem:0,totalGems:0}]}))
  const delGem=(i)=>upd(p=>({...p,gemTable:p.gemTable.filter((_,idx)=>idx!==i)}))
  const setGem=(i,f,v)=>upd(p=>{const rows=[...(p.gemTable||[])];rows[i]={...rows[i],[f]:v};return{...p,gemTable:rows}})
  const totalPay=(set.gemTable||[]).reduce((s,r)=>s+(n(r.totalGems)*n(r.pricePerGem))+n(r.gemPrice),0)
  const handleSave=async()=>{if(!set.setName)return toast.error('Set name required');setSaving(true);try{if(sid){await api.put('/sets/'+sid,set);toast.success('Saved!')}else{const{data}=await api.post('/sets',set);setSavedId(data.set._id);navigate('/manager/sets/'+data.set._id,{replace:true});toast.success('Created!')}}catch(err){toast.error(err.response?.data?.error||'Failed')}finally{setSaving(false)}}
  const uploadImg=async(file)=>{if(!sid)return toast.error('Save first');const fd=new FormData();fd.append('image',file);try{const{data}=await api.post('/sets/'+sid+'/image',fd);setF('image',data.imageUrl);toast.success('Uploaded')}catch{toast.error('Failed')}}
  if(loading)return<div className="p-6 space-y-4 max-w-4xl mx-auto">{[1,2,3].map(i=><div key={i}className="h-20 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse"/>)}</div>
  return(
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3"><button onClick={()=>navigate('/manager/sets')}className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800"><ArrowLeft className="w-4 h-4"/></button><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>{isNew?'New Set':set.setName}</h1></div>
        <div className="flex gap-2">{!isNew&&<button onClick={()=>generateSetPDF(set)}className="btn-secondary"><Download className="w-4 h-4"/>PDF</button>}<button onClick={handleSave}disabled={saving}className="btn-violet min-w-[80px]"><Save className="w-4 h-4"/>{saving?'Saving…':'Save'}</button></div>
      </div>
      <SC title="Basic Information">
        <div className="flex flex-wrap items-start gap-5 mb-4"><div onClick={()=>fileRef.current?.click()}className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-600 flex items-center justify-center cursor-pointer overflow-hidden hover:border-violet-500 transition-colors shrink-0">{set.image?<img src={set.image}className="w-full h-full object-cover"alt={set.setName}/>:<div className="text-center text-slate-400"><Image className="w-6 h-6 mx-auto"/><span className="text-xs">Photo</span></div>}</div><input ref={fileRef}type="file"accept="image/*"className="hidden"onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0])}/>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4"><Fld label="Set Name *"><input className="input-base"value={set.setName}onChange={e=>setF('setName',e.target.value)}/></Fld><Fld label="Given By"><input className="input-base"value={set.givenBy}onChange={e=>setF('givenBy',e.target.value)}/></Fld></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Fld label="Gold Used (manual, g)"><CalcInput className="input-base"value={set.goldUsed}onChange={v=>setF('goldUsed',v)}/></Fld><Fld label="Total Gems"><CalcInput className="input-base"value={set.totalGems}onChange={v=>setF('totalGems',v)}/></Fld><Fld label="Gem Price (Rs.)"><CalcInput className="input-base"value={set.gemPrice}onChange={v=>setF('gemPrice',v)}/></Fld></div>
      </SC>
      <SC title="Persons"action={<button onClick={addPerson}className="btn-violet text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5"/>Add Person</button>}>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700"><table className="w-full text-sm"><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">{['Name','Gold Used (g)','Total Gems',''].map(h=><th key={h}className="table-header text-left py-2.5 px-4">{h}</th>)}</tr></thead><tbody>{(set.persons||[]).map((row,i)=>(<tr key={i}className="border-b border-slate-100 dark:border-zinc-800 last:border-0"><td className="py-2 px-3"><input className="input-base text-xs py-1.5"value={row.name}onChange={e=>setPerson(i,'name',e.target.value)}/></td><td className="py-2 px-3"><CalcInput className="input-base text-xs py-1.5"value={row.goldUsed}onChange={v=>setPerson(i,'goldUsed',v)}/></td><td className="py-2 px-3"><CalcInput className="input-base text-xs py-1.5"value={row.totalGems}onChange={v=>setPerson(i,'totalGems',v)}/></td><td className="py-2 px-3"><button onClick={()=>delPerson(i)}className="text-red-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>))}{(set.persons||[]).length===0&&<tr><td colSpan={4}className="py-8 text-center text-slate-400 text-sm">No persons added</td></tr>}</tbody></table></div>
      </SC>
      <SC title="Gem Table"action={<button onClick={addGem}className="btn-violet text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5"/>Add Row</button>}>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700"><table className="w-full text-sm"style={{minWidth:'700px'}}><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">{['Gem Type','Weight','Unit','Gem Price','Price/Gem','Total Gems','Payment',''].map(h=><th key={h}className="table-header text-left py-2.5 px-3">{h}</th>)}</tr></thead>
        <tbody>{(set.gemTable||[]).map((row,i)=>{const pay=(n(row.totalGems)*n(row.pricePerGem))+n(row.gemPrice);return(<tr key={i}className="border-b border-slate-100 dark:border-zinc-800 last:border-0"><td className="py-2 px-2"><input className="input-base text-xs py-1.5 w-24"value={row.gemType}onChange={e=>setGem(i,'gemType',e.target.value)}placeholder="Ruby, Pearl…"/></td><td className="py-2 px-2"><CalcInput className="input-base text-xs py-1.5 w-16"value={row.gemWeight}onChange={v=>setGem(i,'gemWeight',v)}/></td><td className="py-2 px-2"><select className="input-base text-xs py-1.5 w-20"value={row.gemWeightUnit}onChange={e=>setGem(i,'gemWeightUnit',e.target.value)}><option value="gram">gram</option><option value="carat">carat</option></select></td><td className="py-2 px-2"><CalcInput className="input-base text-xs py-1.5 w-20"value={row.gemPrice}onChange={v=>setGem(i,'gemPrice',v)}/></td><td className="py-2 px-2"><CalcInput className="input-base text-xs py-1.5 w-20"value={row.pricePerGem}onChange={v=>setGem(i,'pricePerGem',v)}/></td><td className="py-2 px-2"><CalcInput className="input-base text-xs py-1.5 w-16"value={row.totalGems}onChange={v=>setGem(i,'totalGems',v)}/></td><td className="py-2 px-3 font-mono font-bold text-xs text-violet-600">Rs.{fmt(pay)}</td><td className="py-2 px-2"><button onClick={()=>delGem(i)}className="text-red-400 p-1"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>)})}
        <tr className="bg-slate-50 dark:bg-zinc-800/60 text-xs font-bold"><td colSpan={6}className="py-2.5 px-4">Total Payment</td><td className="py-2.5 px-3 font-mono text-violet-600">Rs.{fmt(totalPay)}</td><td/></tr>
        </tbody></table></div>
      </SC>
      <div className="manager-box mb-5"><p className="text-xs font-medium text-violet-700 dark:text-violet-400 mb-1">Total Payment (Auto-generated)</p><p className="text-2xl font-bold text-violet-800 dark:text-violet-300">Rs.{fmt(totalPay)}</p><p className="text-xs text-violet-600/70 mt-1">Sum of (Total Gems × Price/Gem + Gem Price) across all gem rows</p></div>
      <SC title="Notes"><textarea className="input-base min-h-[80px] resize-y"value={set.notes}onChange={e=>setF('notes',e.target.value)}/></SC>
    </div>
  )
}