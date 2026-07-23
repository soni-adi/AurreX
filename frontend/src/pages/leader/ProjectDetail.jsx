import{useState,useEffect,useRef,useCallback}from'react'
import{useParams,useNavigate,useSearchParams}from'react-router-dom'
import{Save,Plus,Trash2,Download,ArrowLeft,Image,FileText,X,AlertTriangle,Receipt,Gem,Layers,ChevronDown,ChevronUp}from'lucide-react'
import toast from'react-hot-toast'
import api from'@/lib/axios'
import{n,fmt,today,plusDays}from'@/lib/utils'
import CalcInput from'@/components/CalcInput'
import{generateProjectPDF}from'@/lib/pdfExport'

const emptyProject=(type='detailed')=>({
  projectType:type,setName:'',givenBy:'',startDate:today(),submissionDate:plusDays(30),
  wastagePercent:0,payPerGem:0,status:'ongoing',image:'',goldOperations:[],
  gemPackingTable:[],gemSettingTable:[],pakalTable:[],tachhiTable:[],
  gemWeight:{red:0,green:0,white:0,blue:0},totalGems:0,gemsPrice:0,notes:'',addDataSections:[],
  gemCount:{pakalGems:0,tacchiGems:0,customTypes:[]},
})
const OP_LABEL={add:'Gold Add',remove:'Gold Remove',waste_remove:'Waste Remove',tach_remove:'Tach Remove'}
const OP_COLOR={add:'badge-green',remove:'badge-red',waste_remove:'badge-amber',tach_remove:'badge-violet'}

function SC({title,subtitle,children,action,defaultOpen=true}){
  const[open,setOpen]=useState(defaultOpen)
  return(
    <div className="section-card">
      <button onClick={()=>setOpen(o=>!o)}className="w-full flex items-center justify-between mb-1 group">
        <div className="text-left"><h2 className="font-bold text-gray-900 dark:text-white text-[15px] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{title}</h2>{subtitle&&<p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}</div>
        <div className="flex items-center gap-2">{action&&<span onClick={e=>e.stopPropagation()}>{action}</span>}{open?<ChevronUp className="w-4 h-4 text-gray-400"/>:<ChevronDown className="w-4 h-4 text-gray-400"/>}</div>
      </button>
      {open&&<div className="mt-4">{children}</div>}
    </div>
  )
}
function Fld({label,children,span}){return<div className={span===2?'sm:col-span-2':''}><label className="label">{label}</label>{children}</div>}
function BoxCard({label,value,neg,color='amber'}){
  const cls={amber:'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400',orange:'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800/50 text-orange-700 dark:text-orange-400',purple:'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-400',red:'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400'}
  const c=neg?cls.red:cls[color]
  return<div className={`rounded-xl p-4 border ${c}`}><p className="text-xs font-semibold mb-1.5 opacity-70">{label}</p><div className="flex items-center gap-2">{neg&&<AlertTriangle className="w-4 h-4 shrink-0"/>}<p className="text-2xl font-bold">{fmt(value)}g</p></div>{neg&&<p className="text-xs mt-1 opacity-80">Check entries</p>}</div>
}
function KV({label,value,hi,sub}){
  return<div className={`rounded-xl p-4 border ${hi?'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50':'bg-gray-50 dark:bg-zinc-800/60 border-gray-200 dark:border-zinc-700'}`}><p className={`text-xs font-semibold mb-1.5 ${hi?'text-amber-600 dark:text-amber-400':'text-gray-500'}`}>{label}</p><p className={`text-xl font-bold ${hi?'text-amber-700 dark:text-amber-300':''}`}>{value}</p>{sub&&<p className="text-xs text-gray-400 mt-1">{sub}</p>}</div>
}

export default function LeaderProjectDetail(){
  const{id}=useParams();const[sp]=useSearchParams();const isNew=id==='new'||!id;const navigate=useNavigate()
  const typeFromUrl=sp.get('type')||'detailed'
  const[proj,setProj]=useState(emptyProject(typeFromUrl))
  const[loading,setLoading]=useState(!isNew);const[saving,setSaving]=useState(false);const[savedId,setSavedId]=useState(null)
  const[showPdf,setShowPdf]=useState(false);const[imgBusy,setImgBusy]=useState(false)
  const[showGemModal,setShowGemModal]=useState(false)
  const fileRef=useRef();const debRef=useRef()
  const[newOp,setNewOp]=useState({type:'add',amount:'',note:''})
  const pid=savedId||(isNew?null:id)
  const wasCompleted=useRef(false)
  const done=proj.status==='completed'
  const simple=proj.projectType==='simple'

  useEffect(()=>{
    if(isNew)return
    const load=async()=>{
      try{const{data}=await api.get(`/projects/${id}`);setProj(data.project);wasCompleted.current=data.project.status==='completed'}
      catch{toast.error('Failed to load')}
      finally{setLoading(false)}
    }
    load()
  },[id])

  const autoSave=useCallback((data)=>{
    if(done&&!isNew)return
    clearTimeout(debRef.current)
    debRef.current=setTimeout(async()=>{
      if(!data.setName||!data.givenBy||!pid)return
      try{await api.put(`/projects/${pid}`,data)}catch{}
    },1000)
  },[pid,done,isNew])

  const setF=(path,val)=>setProj(prev=>{
    const next=JSON.parse(JSON.stringify(prev))
    const keys=path.split('.');let o=next
    for(let i=0;i<keys.length-1;i++)o=o[keys[i]]
    o[keys[keys.length-1]]=val;autoSave(next);return next
  })
  const upd=fn=>setProj(prev=>{const next=fn(prev);autoSave(next);return next})

  // ── Calculations ──────────────────────────────────────────────────
  const added=(proj.goldOperations||[]).filter(o=>o.type==='add').reduce((s,o)=>s+n(o.amount),0)
  const removed=(proj.goldOperations||[]).filter(o=>o.type==='remove').reduce((s,o)=>s+n(o.amount),0)
  const wasteR=(proj.goldOperations||[]).filter(o=>o.type==='waste_remove').reduce((s,o)=>s+n(o.amount),0)
  const tachR=(proj.goldOperations||[]).filter(o=>o.type==='tach_remove').reduce((s,o)=>s+n(o.amount),0)
  const pGiven=(proj.pakalTable||[]).reduce((s,r)=>s+n(r.goldGiven),0)
  const pReceived=(proj.pakalTable||[]).reduce((s,r)=>s+n(r.goldReceived),0)
  const pWaste=(proj.pakalTable||[]).reduce((s,r)=>s+n(r.wasteGoldTaken),0)
  const tTach=(proj.tachhiTable||[]).reduce((s,r)=>s+n(r.tach),0)
  const goldInBox=added+pReceived-removed-pGiven
  const wasteInBox=pWaste-wasteR
  const tachInBox=tTach-tachR
  const simpleUsed=added-removed-tachR-wasteR
  const simpleWithW=simpleUsed+(n(proj.wastagePercent)/100*simpleUsed)
  // Gold Used per Pakal row = WT After - WT Before (user spec)
  const pakalGoldUsedTotal=(proj.pakalTable||[]).reduce((s,r)=>s+(n(r.itemWeightAfter)-n(r.itemWeightBefore)),0)
  const tachTotal=(proj.tachhiTable||[]).reduce((s,r)=>s+n(r.tach),0)
  const goldWithout=pakalGoldUsedTotal-tachTotal
  const goldWith=goldWithout+(n(proj.wastagePercent)/100*pGiven)
  const pakalDiff=(proj.pakalTable||[]).reduce((s,r)=>s+(n(r.itemWeightBefore)+n(r.goldGiven)-n(r.itemWeightAfter)-n(r.goldReceived)-n(r.wasteGoldTaken)),0)
  const tachhiDiff=(proj.tachhiTable||[]).reduce((s,r)=>s+(n(r.itemWeightAfter)+n(r.tach)-n(r.itemWeightBefore)),0)
  const totalDiff=pakalDiff+tachhiDiff
  const roughGold=added-removed-tachR-wasteR
  const mainPay=n(proj.totalGems)*n(proj.payPerGem)+n(proj.gemsPrice)
  const allSets=[{name:proj.setName||'Main Set',goldUsed:simple?simpleUsed:goldWith,totalGems:n(proj.totalGems),gemPrice:n(proj.gemsPrice),totalPayment:mainPay,gemWeight:proj.gemWeight||{}},...(proj.addDataSections||[]).map(s=>({name:s.name||'Section',goldUsed:n(s.totalGoldUsed),totalGems:n(s.totalGems),gemPrice:n(s.gemPrice),totalPayment:n(s.totalGems)*n(proj.payPerGem)+n(s.gemPrice),gemWeight:s.gemWeight||{}}))]
  const grandGold=allSets.reduce((s,x)=>s+x.goldUsed,0),grandGems=allSets.reduce((s,x)=>s+x.totalGems,0),grandPay=allSets.reduce((s,x)=>s+x.totalPayment,0)
  const alerts=[goldInBox<0&&'Gold in Box is negative',wasteInBox<0&&'Waste Gold in Box is negative',tachInBox<0&&'Tach in Box is negative'].filter(Boolean)

  const handleSave=async()=>{
    if(!proj.setName||!proj.givenBy)return toast.error('Set Name and Given By are required')
    if(proj.status==='completed'&&!wasCompleted.current&&!simple){setShowGemModal(true);return}
    await doSave()
  }
  const doSave=async()=>{
    setSaving(true)
    try{
      if(pid){await api.put(`/projects/${pid}`,proj);toast.success('Saved!');wasCompleted.current=proj.status==='completed'}
      else{const{data}=await api.post('/projects',proj);setSavedId(data.project._id);navigate(`/projects/${data.project._id}`,{replace:true});toast.success('Project created!')}
    }catch(err){toast.error(err.response?.data?.error||'Save failed')}
    finally{setSaving(false)}
  }
  const uploadImg=async(file)=>{
    if(!pid)return toast.error('Save project first')
    setImgBusy(true);const fd=new FormData();fd.append('image',file)
    try{const{data}=await api.post(`/projects/${pid}/image`,fd);setF('image',data.imageUrl);toast.success('Photo uploaded')}
    catch{toast.error('Upload failed')}finally{setImgBusy(false)}
  }
  const addOp=()=>{
    if(!newOp.amount||n(newOp.amount)<=0)return toast.error('Enter valid amount')
    upd(p=>({...p,goldOperations:[...(p.goldOperations||[]),{...newOp,amount:n(newOp.amount),createdAt:new Date()}]}))
    setNewOp(o=>({...o,amount:'',note:''}))
  }
  const addRow=(tbl,blank)=>upd(p=>({...p,[tbl]:[...(p[tbl]||[]),blank]}))
  const setRow=(tbl,i,f,v)=>upd(p=>{const rows=[...(p[tbl]||[])];rows[i]={...rows[i],[f]:v};return{...p,[tbl]:rows}})
  const delRow=(tbl,i)=>upd(p=>({...p,[tbl]:p[tbl].filter((_,idx)=>idx!==i)}))
  const addSec=()=>upd(p=>({...p,addDataSections:[...(p.addDataSections||[]),{name:'',totalGoldUsed:0,totalGems:0,gemPrice:0,gemWeight:{red:0,green:0,white:0,blue:0}}]}))
  const delSec=i=>upd(p=>({...p,addDataSections:p.addDataSections.filter((_,idx)=>idx!==i)}))
  const setSec=(i,f,v)=>upd(p=>{const s=[...(p.addDataSections||[])];if(f.includes('.')){const[a,b]=f.split('.');s[i]={...s[i],[a]:{...s[i][a],[b]:v}}}else s[i]={...s[i],[f]:v};return{...p,addDataSections:s}})

  if(loading)return<div className="p-6 space-y-4 max-w-5xl mx-auto">{[1,2,3,4].map(i=><div key={i}className="h-20 rounded-2xl bg-gray-100 dark:bg-zinc-800 animate-pulse"/>)}</div>
  const sd={goldInBox,wasteInBox,tachInBox,goldWith,goldWithout,simpleUsed,simpleWithW,mainPay,grandGold,grandGems,grandPay,allSets,roughGold,totalDiff}

  return(
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate('/projects')}className="btn-icon border border-gray-200 dark:border-zinc-700"><ArrowLeft className="w-4 h-4"/></button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>{isNew?'New Set':proj.setName||'Set'}</h1>
              <span className={`badge ${simple?'badge-blue':'badge-amber'}`}>{simple?'Simple':'Detailed'}</span>
              {done&&<span className="badge badge-green">Completed</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew&&<button onClick={()=>setShowPdf(true)}className="btn-secondary"><Download className="w-4 h-4"/>PDF</button>}
          {!done&&<button onClick={handleSave}disabled={saving}className="btn-primary min-w-[88px]"><Save className="w-4 h-4"/>{saving?'Saving…':'Save'}</button>}
        </div>
      </div>

      {/* Warnings */}
      {alerts.length>0&&<div className="danger-box mb-4 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/><div><p className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">Gold Box Warnings</p>{alerts.map((a,i)=><p key={i}className="text-xs text-red-600 dark:text-red-400">• {a}</p>)}</div></div>}

      {/* Photo */}
      <SC title="Set Photo">
        <div className="flex items-center gap-4">
          <div onClick={()=>!done&&fileRef.current?.click()}className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${done?'border-gray-200 dark:border-zinc-700':'border-gray-300 dark:border-zinc-600 cursor-pointer hover:border-amber-400'}`}>
            {proj.image?<img src={proj.image}alt="set"className="w-full h-full object-cover"/>:<div className="text-center text-gray-400"><Image className="w-7 h-7 mx-auto mb-1"/><span className="text-xs">Photo</span></div>}
          </div>
          {!done&&<div><button onClick={()=>fileRef.current?.click()}disabled={imgBusy}className="btn-secondary btn-sm"><Image className="w-3.5 h-3.5"/>{imgBusy?'Uploading…':'Upload Photo'}</button>{isNew&&<p className="text-xs text-gray-400 mt-1.5">Save set first to upload.</p>}</div>}
          <input ref={fileRef}type="file"accept="image/*"className="hidden"onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0])}/>
        </div>
      </SC>

      {/* Basic Info */}
      <SC title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Fld label="Set Name *"><input className="input-base"disabled={done}value={proj.setName}placeholder="e.g. Bridal Necklace Set"onChange={e=>setF('setName',e.target.value)}/></Fld>
          <Fld label="Given By *"><input className="input-base"disabled={done}value={proj.givenBy}placeholder="Client / Vendor name"onChange={e=>setF('givenBy',e.target.value)}/></Fld>
          <Fld label="Status"><select className="input-base"value={proj.status}onChange={e=>setF('status',e.target.value)}><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></Fld>
          <Fld label="Start Date"><input className="input-base"type="date"disabled={done}value={proj.startDate}onChange={e=>setF('startDate',e.target.value)}/></Fld>
          <Fld label="Submission Date"><input className="input-base"type="date"disabled={done}value={proj.submissionDate}onChange={e=>setF('submissionDate',e.target.value)}/></Fld>
          <Fld label="Wastage %"><CalcInput className="input-base"disabled={done}value={proj.wastagePercent}onChange={v=>setF('wastagePercent',v)}/></Fld>
          <Fld label="Pay Per Gem (₹)"><CalcInput className="input-base"disabled={done}value={proj.payPerGem}onChange={v=>setF('payPerGem',v)}/></Fld>
        </div>
      </SC>

      {/* Gold Operations */}
      <SC title="Gold Operations"subtitle="Track gold added, removed, or taken as waste / tach">
        {!done&&<div className="info-box mb-4">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">Add New Operation</p>
          <div className="flex flex-wrap gap-2">
            <select className="input-base w-auto text-sm"value={newOp.type}onChange={e=>setNewOp(o=>({...o,type:e.target.value}))}><option value="add">Gold Add</option><option value="remove">Gold Remove</option>{!simple&&<option value="waste_remove">Waste Gold Remove</option>}{!simple&&<option value="tach_remove">Gold Tach Remove</option>}</select>
            <CalcInput className="input-base w-32"value={n(newOp.amount)}onChange={v=>setNewOp(o=>({...o,amount:v}))}placeholder="Amount (g)"/>
            <input className="input-base flex-1 min-w-28"placeholder="Note (optional)"value={newOp.note}onChange={e=>setNewOp(o=>({...o,note:e.target.value}))}/>
            <button onClick={addOp}className="btn-primary btn-sm"><Plus className="w-4 h-4"/>Add</button>
          </div>
        </div>}
        {(proj.goldOperations||[]).length>0&&<div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700 mb-4">
          <table className="data-table"><thead><tr><th>Type</th><th className="text-right">Amount (g)</th><th>Note</th>{!done&&<th className="w-12"/>}</tr></thead>
          <tbody>{(proj.goldOperations||[]).map((op,i)=>(
            <tr key={i}><td><span className={`badge ${OP_COLOR[op.type]||'badge-amber'}`}>{OP_LABEL[op.type]}</span></td>
            <td className="td-num font-bold">{fmt(op.amount)}g</td>
            <td className="text-gray-500 text-xs">{op.note||'—'}</td>
            {!done&&<td><button onClick={()=>upd(p=>({...p,goldOperations:p.goldOperations.filter((_,idx)=>idx!==i)}))}className="btn-icon w-7 h-7 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></td>}
            </tr>
          ))}</tbody></table>
        </div>}
        <div className={`grid gap-3 ${simple?'grid-cols-1 sm:grid-cols-2':'grid-cols-1 sm:grid-cols-3'}`}>
          <BoxCard label="Gold in Box (g)"value={goldInBox}neg={goldInBox<0}color="amber"/>
          {!simple&&<BoxCard label="Waste Gold in Box (g)"value={wasteInBox}neg={wasteInBox<0}color="orange"/>}
          {!simple&&<BoxCard label="Tach in Box (g)"value={tachInBox}neg={tachInBox<0}color="purple"/>}
        </div>
      </SC>

      {/* Detailed Tables */}
      {!simple&&<>
        {/* Gem Packing */}
        <SC title="Gem Packing"subtitle="Up to 4 workers"action={!done&&(proj.gemPackingTable||[]).length<4&&<button onClick={()=>addRow('gemPackingTable',{userName:'',gems:0})}className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5"/>Add</button>}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
            <table className="data-table"><thead><tr><th>Worker Name</th><th className="text-right">Gems</th>{!done&&<th className="w-12"/>}</tr></thead>
            <tbody>
              {(proj.gemPackingTable||[]).map((row,i)=>(
                <tr key={i}>
                  <td><input className="td-input"disabled={done}value={row.userName}onChange={e=>setRow('gemPackingTable',i,'userName',e.target.value)}placeholder="Worker name"/></td>
                  <td className="w-28"><CalcInput className="td-input text-right"disabled={done}value={row.gems}onChange={v=>setRow('gemPackingTable',i,'gems',v)}/></td>
                  {!done&&<td><button onClick={()=>delRow('gemPackingTable',i)}className="btn-icon w-7 h-7 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></td>}
                </tr>
              ))}
              {(proj.gemPackingTable||[]).length===0&&<tr><td colSpan={3}className="text-center text-gray-400 text-sm py-6">No gem packing entries</td></tr>}
            </tbody>
            {(proj.gemPackingTable||[]).length>0&&<tfoot><tr><td>Total</td><td className="td-num text-amber-600">{fmt((proj.gemPackingTable||[]).reduce((s,r)=>s+n(r.gems),0))}</td>{!done&&<td/>}</tr></tfoot>}
          </table></div>
        </SC>

        {/* Gem Setting */}
        <SC title="Gem Setting"action={!done&&<button onClick={()=>addRow('gemSettingTable',{userName:'',gems:0})}className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5"/>Add</button>}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
            <table className="data-table"><thead><tr><th>Worker Name</th><th className="text-right">Gems</th>{!done&&<th className="w-12"/>}</tr></thead>
            <tbody>
              {(proj.gemSettingTable||[]).map((row,i)=>(
                <tr key={i}>
                  <td><input className="td-input"disabled={done}value={row.userName}onChange={e=>setRow('gemSettingTable',i,'userName',e.target.value)}placeholder="Worker name"/></td>
                  <td className="w-28"><CalcInput className="td-input text-right"disabled={done}value={row.gems}onChange={v=>setRow('gemSettingTable',i,'gems',v)}/></td>
                  {!done&&<td><button onClick={()=>delRow('gemSettingTable',i)}className="btn-icon w-7 h-7 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></td>}
                </tr>
              ))}
              {(proj.gemSettingTable||[]).length===0&&<tr><td colSpan={3}className="text-center text-gray-400 text-sm py-6">No gem setting entries</td></tr>}
            </tbody>
            {(proj.gemSettingTable||[]).length>0&&<tfoot><tr><td>Total</td><td className="td-num text-amber-600">{fmt((proj.gemSettingTable||[]).reduce((s,r)=>s+n(r.gems),0))}</td>{!done&&<td/>}</tr></tfoot>}
          </table></div>
        </SC>

        {/* Pakal Table — Gold Used = WT After - WT Before */}
        <SC title="Pakal Table"subtitle="Gold Used (auto) = WT After − WT Before"action={!done&&<button onClick={()=>addRow('pakalTable',{user:'',itemWeightBefore:0,goldGiven:0,itemWeightAfter:0,goldReceived:0,wasteGoldTaken:0,gems:0})}className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5"/>Add Row</button>}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
            <table className="data-table"style={{minWidth:'860px'}}><thead><tr>
              <th>User</th><th className="text-right">Wt Before</th><th className="text-right">Gold Given</th><th className="text-right">Wt After</th>
              <th className="text-right bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">Gold Used<span className="block font-normal normal-case tracking-normal text-[10px]">Wt After − Wt Before</span></th>
              <th className="text-right">Gold Rcvd</th><th className="text-right">Waste</th><th className="text-right">Gems</th>
              <th className="text-right text-amber-600">Diff</th>{!done&&<th className="w-12"/>}
            </tr></thead>
            <tbody>
              {(proj.pakalTable||[]).map((row,i)=>{
                const goldUsed=n(row.itemWeightAfter)-n(row.itemWeightBefore)
                const diff=n(row.itemWeightBefore)+n(row.goldGiven)-n(row.itemWeightAfter)-n(row.goldReceived)-n(row.wasteGoldTaken)
                return(
                  <tr key={i}>
                    <td className="min-w-[90px]"><input className="td-input"disabled={done}value={row.user}onChange={e=>setRow('pakalTable',i,'user',e.target.value)}placeholder="Name"/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.itemWeightBefore}onChange={v=>setRow('pakalTable',i,'itemWeightBefore',v)}/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.goldGiven}onChange={v=>setRow('pakalTable',i,'goldGiven',v)}/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.itemWeightAfter}onChange={v=>setRow('pakalTable',i,'itemWeightAfter',v)}/></td>
                    <td className="w-20 bg-blue-50/50 dark:bg-blue-900/10"><div className="text-right font-mono font-bold text-sm text-blue-600 dark:text-blue-400 px-2">{fmt(goldUsed)}</div></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.goldReceived}onChange={v=>setRow('pakalTable',i,'goldReceived',v)}/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.wasteGoldTaken}onChange={v=>setRow('pakalTable',i,'wasteGoldTaken',v)}/></td>
                    <td className="w-16"><CalcInput className="td-input text-right"disabled={done}value={row.gems}onChange={v=>setRow('pakalTable',i,'gems',v)}/></td>
                    <td className="w-20 font-mono font-bold text-sm text-amber-600 dark:text-amber-400 text-right pr-4">{fmt(diff)}</td>
                    {!done&&<td><button onClick={()=>delRow('pakalTable',i)}className="btn-icon w-7 h-7 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></td>}
                  </tr>
                )
              })}
              {(proj.pakalTable||[]).length===0&&<tr><td colSpan={10}className="text-center text-gray-400 text-sm py-8">No Pakal entries yet</td></tr>}
            </tbody>
            {(proj.pakalTable||[]).length>0&&<tfoot><tr>
              <td>Total</td>
              <td className="td-num">{fmt((proj.pakalTable||[]).reduce((s,r)=>s+n(r.itemWeightBefore),0))}</td>
              <td className="td-num">{fmt((proj.pakalTable||[]).reduce((s,r)=>s+n(r.goldGiven),0))}</td>
              <td className="td-num">{fmt((proj.pakalTable||[]).reduce((s,r)=>s+n(r.itemWeightAfter),0))}</td>
              <td className="td-num text-blue-600">{fmt(pakalGoldUsedTotal)}</td>
              <td className="td-num">{fmt((proj.pakalTable||[]).reduce((s,r)=>s+n(r.goldReceived),0))}</td>
              <td className="td-num">{fmt((proj.pakalTable||[]).reduce((s,r)=>s+n(r.wasteGoldTaken),0))}</td>
              <td className="td-num">{fmt((proj.pakalTable||[]).reduce((s,r)=>s+n(r.gems),0))}</td>
              <td className="td-num text-amber-600">{fmt(pakalDiff)}</td>
              {!done&&<td/>}
            </tr></tfoot>}
          </table></div>
        </SC>

        {/* Tachhi Table */}
        <SC title="Tachhi Table"action={!done&&<button onClick={()=>addRow('tachhiTable',{user:'',itemWeightBefore:0,itemWeightAfter:0,tach:0,gems:0})}className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5"/>Add Row</button>}>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
            <table className="data-table"style={{minWidth:'540px'}}><thead><tr>
              <th>User</th><th className="text-right">Wt Before</th><th className="text-right">Wt After</th><th className="text-right">Tach</th><th className="text-right">Gems</th><th className="text-right text-amber-600">Diff</th>{!done&&<th className="w-12"/>}
            </tr></thead>
            <tbody>
              {(proj.tachhiTable||[]).map((row,i)=>{
                const diff=n(row.itemWeightAfter)+n(row.tach)-n(row.itemWeightBefore)
                return(
                  <tr key={i}>
                    <td><input className="td-input"disabled={done}value={row.user}onChange={e=>setRow('tachhiTable',i,'user',e.target.value)}placeholder="Name"/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.itemWeightBefore}onChange={v=>setRow('tachhiTable',i,'itemWeightBefore',v)}/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.itemWeightAfter}onChange={v=>setRow('tachhiTable',i,'itemWeightAfter',v)}/></td>
                    <td className="w-20"><CalcInput className="td-input text-right"disabled={done}value={row.tach}onChange={v=>setRow('tachhiTable',i,'tach',v)}/></td>
                    <td className="w-16"><CalcInput className="td-input text-right"disabled={done}value={row.gems}onChange={v=>setRow('tachhiTable',i,'gems',v)}/></td>
                    <td className="font-mono font-bold text-sm text-amber-600 dark:text-amber-400 text-right pr-4">{fmt(diff)}</td>
                    {!done&&<td><button onClick={()=>delRow('tachhiTable',i)}className="btn-icon w-7 h-7 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button></td>}
                  </tr>
                )
              })}
              {(proj.tachhiTable||[]).length===0&&<tr><td colSpan={7}className="text-center text-gray-400 text-sm py-8">No Tachhi entries yet</td></tr>}
            </tbody>
            {(proj.tachhiTable||[]).length>0&&<tfoot><tr>
              <td>Total</td>
              <td className="td-num">{fmt((proj.tachhiTable||[]).reduce((s,r)=>s+n(r.itemWeightBefore),0))}</td>
              <td className="td-num">{fmt((proj.tachhiTable||[]).reduce((s,r)=>s+n(r.itemWeightAfter),0))}</td>
              <td className="td-num">{fmt(tachTotal)}</td>
              <td className="td-num">{fmt((proj.tachhiTable||[]).reduce((s,r)=>s+n(r.gems),0))}</td>
              <td className="td-num text-amber-600">{fmt(tachhiDiff)}</td>
              {!done&&<td/>}
            </tr></tfoot>}
          </table></div>
        </SC>

        {/* Gold Calculations */}
        <SC title="Gold Calculations"subtitle="Based on Pakal and Tachhi table data">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KV label="Roughly Gold Used (g)"value={fmt(roughGold)+'g'}sub="Added − Removed − Tach − Waste"/>
            <KV label="Total Diff (g)"value={fmt(totalDiff)+'g'}sub="Sum Pakal Diff + Sum Tachhi Diff"hi/>
          </div>
        </SC>
      </>}

      {/* Project Summary */}
      <SC title="Set Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {simple
            ?<><KV label="Gold Used (g)"value={fmt(simpleUsed)+'g'}/><KV label="Gold Used With Wastage (g)"value={fmt(simpleWithW)+'g'}hi/></>
            :<><KV label="Gold Used Without Wastage (g)"value={fmt(goldWithout)+'g'}sub="Sum Pakal Gold Used − Sum Tachhi Tach"/><KV label="Gold Used With Wastage (g)"value={fmt(goldWith)+'g'}hi/></>
          }
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="label mb-2">Gem Weight (g)</p>
            <div className="grid grid-cols-2 gap-2">
              {['red','green','white','blue'].map(c=>(
                <div key={c}>
                  <label className="text-xs text-gray-500 capitalize mb-1 block">{c}</label>
                  <CalcInput className="input-base"disabled={done}value={proj.gemWeight?.[c]||0}onChange={v=>setF(`gemWeight.${c}`,v)}/>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Fld label="Total Gems (Manual)"><CalcInput className="input-base"disabled={done}value={proj.totalGems}onChange={v=>setF('totalGems',v)}/></Fld>
            <Fld label="Gems Price (₹)"><CalcInput className="input-base"disabled={done}value={proj.gemsPrice}onChange={v=>setF('gemsPrice',v)}/></Fld>
            <div className="summary-box"><p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Total Payment</p><p className="text-2xl font-bold text-amber-800 dark:text-amber-200">₹{fmt(mainPay)}</p><p className="text-xs text-amber-600/70 mt-1">{proj.totalGems} gems × ₹{proj.payPerGem} + ₹{proj.gemsPrice}</p></div>
          </div>
        </div>
      </SC>

      {/* Add Data Sections */}
      <SC title="Add Data"subtitle="Additional set sections"action={!done&&<button onClick={addSec}className="btn-primary btn-sm"><Plus className="w-3.5 h-3.5"/>Add Section</button>}>
        {(proj.addDataSections||[]).length===0?<p className="text-gray-400 text-sm">No sections yet. Add a section to track multiple sub-sets.</p>
        :(proj.addDataSections||[]).map((sec,i)=>(
          <div key={i}className="info-box mb-3">
            <div className="flex items-center justify-between mb-3">
              <input className="input-base font-semibold max-w-xs"placeholder="Section name…"disabled={done}value={sec.name}onChange={e=>setSec(i,'name',e.target.value)}/>
              {!done&&<button onClick={()=>delSec(i)}className="btn-icon text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <Fld label="Gold Used (g)"><CalcInput className="input-base"disabled={done}value={sec.totalGoldUsed}onChange={v=>setSec(i,'totalGoldUsed',v)}/></Fld>
              <Fld label="Total Gems"><CalcInput className="input-base"disabled={done}value={sec.totalGems}onChange={v=>setSec(i,'totalGems',v)}/></Fld>
              <Fld label="Gem Price (₹)"><CalcInput className="input-base"disabled={done}value={sec.gemPrice}onChange={v=>setSec(i,'gemPrice',v)}/></Fld>
              <div className="summary-box !p-3"><p className="text-xs text-amber-700 dark:text-amber-400">Payment</p><p className="font-bold text-amber-800 dark:text-amber-200">₹{fmt(n(sec.totalGems)*n(proj.payPerGem)+n(sec.gemPrice))}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{['red','green','white','blue'].map(c=>(<div key={c}><label className="text-xs text-gray-500 capitalize mb-1 block">{c} gem wt</label><CalcInput className="input-base text-xs"disabled={done}value={sec.gemWeight?.[c]||0}onChange={v=>setSec(i,`gemWeight.${c}`,v)}/></div>))}</div>
          </div>
        ))}
      </SC>

      {/* Set Summary Table (multi-section) */}
      {(proj.addDataSections||[]).length>0&&<SC title="Set Summary Table">
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
          <table className="data-table"><thead><tr><th>Set / Section</th><th className="text-right">Gold Used (g)</th><th className="text-right">Gems</th><th className="text-right">Gem Price (₹)</th><th className="text-right">Total Payment (₹)</th></tr></thead>
          <tbody>{allSets.map((s,i)=><tr key={i}className={i===0?'bg-amber-50/30 dark:bg-amber-900/5':''}>
            <td className="font-semibold">{i===0?'⬤ ':''}+{s.name}</td>
            <td className="td-num">{fmt(s.goldUsed)}</td><td className="td-num">{s.totalGems}</td>
            <td className="td-num">₹{fmt(s.gemPrice)}</td>
            <td className="td-num font-bold text-amber-600 dark:text-amber-400">₹{fmt(s.totalPayment)}</td>
          </tr>)}</tbody>
          <tfoot><tr><td>Grand Total</td><td className="td-num">{fmt(grandGold)}</td><td className="td-num">{grandGems}</td><td/><td className="td-num text-amber-600">₹{fmt(grandPay)}</td></tr></tfoot>
        </table></div>
      </SC>}

      {/* Gem count display */}
      {(proj.gemCount?.pakalGems>0||proj.gemCount?.tacchiGems>0||(proj.gemCount?.customTypes||[]).length>0)&&(
        <SC title="Gem Count at Completion">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="info-box"><p className="text-xs text-gray-500 mb-1">PAKAI Gems</p><p className="text-xl font-bold text-amber-600">{proj.gemCount.pakalGems}</p></div>
            <div className="info-box"><p className="text-xs text-gray-500 mb-1">TACHHI Gems</p><p className="text-xl font-bold text-amber-600">{proj.gemCount.tacchiGems}</p></div>
            {(proj.gemCount.customTypes||[]).map((ct,i)=><div key={i}className="info-box"><p className="text-xs text-gray-500 mb-1">{ct.name}</p><p className="text-xl font-bold text-amber-600">{ct.count}</p></div>)}
          </div>
        </SC>
      )}

      {/* Notes */}
      <SC title="Notes">
        <textarea className="input-base min-h-[88px] resize-y"disabled={done}value={proj.notes}onChange={e=>setF('notes',e.target.value)}placeholder="Any notes about this set…"/>
      </SC>

      {showPdf&&<PdfModal proj={proj}sd={sd}onClose={()=>setShowPdf(false)}/>}
      {showGemModal&&<GemCountModal gemCount={proj.gemCount}onChange={(f,v)=>setProj(p=>({...p,gemCount:{...p.gemCount,[f]:v}}))}onAddCustom={()=>setProj(p=>({...p,gemCount:{...p.gemCount,customTypes:[...(p.gemCount?.customTypes||[]),{name:'',count:0}]}}))}onSetCustom={(i,f,v)=>setProj(p=>{const ct=[...(p.gemCount?.customTypes||[])];ct[i]={...ct[i],[f]:v};return{...p,gemCount:{...p.gemCount,customTypes:ct}}})}onDelCustom={i=>setProj(p=>({...p,gemCount:{...p.gemCount,customTypes:p.gemCount.customTypes.filter((_,idx)=>idx!==i)}}))}onCancel={()=>{setShowGemModal(false);setProj(p=>({...p,status:'ongoing'}))}}onConfirm={()=>{setShowGemModal(false);doSave()}}/>}
    </div>
  )
}

function GemCountModal({gemCount,onChange,onAddCustom,onSetCustom,onDelCustom,onCancel,onConfirm}){
  return<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="card p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center gap-2 mb-2"><Gem className="w-5 h-5 text-amber-500"/><h3 className="font-bold text-lg">Gem Count at Completion</h3></div>
      <p className="text-xs text-gray-500 mb-5">Record gem counts to power dashboard charts.</p>
      <div className="space-y-3 mb-4">
        <div><label className="label">PAKAI Gems</label><CalcInput className="input-base"value={gemCount?.pakalGems||0}onChange={v=>onChange('pakalGems',v)}/></div>
        <div><label className="label">TACHHI Gems</label><CalcInput className="input-base"value={gemCount?.tacchiGems||0}onChange={v=>onChange('tacchiGems',v)}/></div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2"><p className="label !mb-0">Custom Types</p><button onClick={onAddCustom}className="text-xs text-amber-600 font-medium flex items-center gap-1"><Plus className="w-3 h-3"/>Add</button></div>
        {(gemCount?.customTypes||[]).map((ct,i)=><div key={i}className="flex gap-2 mb-2"><input className="input-base flex-1"value={ct.name}onChange={e=>onSetCustom(i,'name',e.target.value)}placeholder="Type name"/><CalcInput className="input-base w-24"value={ct.count}onChange={v=>onSetCustom(i,'count',v)}/><button onClick={()=>onDelCustom(i)}className="btn-icon text-red-400"><X className="w-4 h-4"/></button></div>)}
      </div>
      <div className="flex gap-3"><button onClick={onCancel}className="btn-secondary flex-1">Cancel</button><button onClick={onConfirm}className="btn-primary flex-1">Confirm & Complete</button></div>
    </div>
  </div>
}

function PdfModal({proj,sd,onClose}){
  const simple=proj.projectType==='simple'
  const available=simple?['basicInfo','goldOps','goldBox','goldCalc','summary','setSummary','notes']:['basicInfo','goldOps','goldBox','goldCalc','summary','gemCount','setSummary','pakalTable','tachhiTable','billPrint','notes']
  const LABELS={basicInfo:'Basic Information',goldOps:'Gold Operations',goldBox:'Gold Box Info',goldCalc:'Gold Calculations',summary:'Set Summary',gemCount:'Gem Count',setSummary:'Set Summary Table',pakalTable:'Pakal Table',tachhiTable:'Tachhi Table',billPrint:'Bill Print (Grand Total)',notes:'Notes'}
  const[sel,setSel]=useState(new Set(available))
  const toggle=f=>setSel(prev=>{const n=new Set(prev);n.has(f)?n.delete(f):n.add(f);return n})
  const go=()=>{generateProjectPDF(proj,sd,sel);onClose();toast.success('PDF exported!')}
  return<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="card p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center justify-between mb-4"><h3 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600"/>Export PDF</h3><button onClick={onClose}className="btn-icon"><X className="w-4 h-4"/></button></div>
      <div className="flex justify-between mb-3"><p className="text-xs text-gray-500">Select sections</p><button onClick={()=>setSel(sel.size===available.length?new Set():new Set(available))}className="text-xs text-amber-600 font-medium">{sel.size===available.length?'Deselect All':'Select All'}</button></div>
      <div className="space-y-1.5 mb-5 max-h-64 overflow-y-auto">{available.map(f=><label key={f}className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800"><input type="checkbox"checked={sel.has(f)}onChange={()=>toggle(f)}className="w-4 h-4 accent-amber-500 rounded"/><span className="text-sm">{LABELS[f]}</span>{f==='billPrint'&&<Receipt className="w-3.5 h-3.5 text-amber-500 ml-auto"/>}</label>)}</div>
      <div className="flex gap-3"><button onClick={onClose}className="btn-secondary flex-1">Cancel</button><button onClick={go}className="btn-primary flex-1"><Download className="w-4 h-4"/>Export</button></div>
    </div>
  </div>
}
