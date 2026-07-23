import{useState,useEffect,useRef,useCallback}from'react'
import{useParams,useNavigate,useSearchParams}from'react-router-dom'
import{Save,Plus,Trash2,Download,ArrowLeft,Image,FileText,X,AlertTriangle,Receipt,Gem}from'lucide-react'
import toast from'react-hot-toast'
import api from'../../lib/axios'
import{n,fmt,today,plusDays}from'../../lib/utils'
import CalcInput from'../../components/CalcInput'
import{generateProjectPDF}from'../../lib/pdfExport'

const emptyProject=(type='detailed')=>({
  projectType:type,setName:'',givenBy:'',startDate:today(),submissionDate:plusDays(30),
  wastagePercent:0,payPerGem:0,status:'ongoing',image:'',goldOperations:[],
  gemPackingTable:[{userName:'',gems:0}],gemSettingTable:[{userName:'',gems:0}],
  pakalTable:[{user:'',itemWeightBefore:0,goldGiven:0,itemWeightAfter:0,goldReceived:0,wasteGoldTaken:0,gems:0}],
  tachhiTable:[{user:'',itemWeightBefore:0,itemWeightAfter:0,tach:0,gems:0}],
  gemWeight:{red:0,green:0,white:0,blue:0},totalGems:0,gemsPrice:0,notes:'',addDataSections:[],
  gemCount:{pakalGems:0,tacchiGems:0,customTypes:[]},
})

const calcOps=ops=>({
  added:(ops||[]).filter(o=>o.type==='add').reduce((s,o)=>s+n(o.amount),0),
  removed:(ops||[]).filter(o=>o.type==='remove').reduce((s,o)=>s+n(o.amount),0),
  wasteR:(ops||[]).filter(o=>o.type==='waste_remove').reduce((s,o)=>s+n(o.amount),0),
  tachR:(ops||[]).filter(o=>o.type==='tach_remove').reduce((s,o)=>s+n(o.amount),0),
})
const OP_LABEL={add:'Gold Add',remove:'Gold Remove',waste_remove:'Waste Remove',tach_remove:'Tach Remove'}
const OP_COLOR={add:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',remove:'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',waste_remove:'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',tach_remove:'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'}

function SC({title,children,action}){return(<div className="section-card"><div className="flex items-center justify-between mb-4"><h2 className="font-bold text-slate-900 dark:text-white">{title}</h2>{action}</div>{children}</div>)}
function Fld({label,children}){return(<div><label className="label">{label}</label>{children}</div>)}

export default function LeaderProjectDetail(){
  const{id}=useParams();const[searchParams]=useSearchParams();const isNew=id==='new'||!id;const navigate=useNavigate()
  const typeFromUrl=searchParams.get('type')||'detailed'
  const[proj,setProj]=useState(emptyProject(typeFromUrl))
  const[loading,setLoading]=useState(!isNew);const[saving,setSaving]=useState(false);const[savedId,setSavedId]=useState(null)
  const[showPdf,setShowPdf]=useState(false);const[imgBusy,setImgBusy]=useState(false)
  const[showGemCountModal,setShowGemCountModal]=useState(false)
  const fileRef=useRef();const debRef=useRef()
  const[newOp,setNewOp]=useState({type:'add',amount:'',note:''})
  const pid=savedId||(isNew?null:id)
  const wasCompleted=useRef(false)
  const done=proj.status==='completed'
  const simple=proj.projectType==='simple'

  useEffect(()=>{
    if(isNew)return
    api.get(`/projects/${id}`).then(({data})=>{ setProj(data.project); wasCompleted.current = data.project.status==='completed' })
      .catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false))
  },[id])

  const autoSave=useCallback(async(data)=>{
    if(done&&!isNew)return
    clearTimeout(debRef.current)
    debRef.current=setTimeout(async()=>{ if(!data.setName||!data.givenBy||!pid)return; try{await api.put(`/projects/${pid}`,data)}catch{} },800)
  },[pid,done,isNew])

  const set=(path,val)=>setProj(prev=>{ const next=JSON.parse(JSON.stringify(prev)); const keys=path.split('.'); let o=next; for(let i=0;i<keys.length-1;i++)o=o[keys[i]]; o[keys[keys.length-1]]=val; autoSave(next); return next })
  const upd=(fn)=>setProj(prev=>{ const next=fn(prev); autoSave(next); return next })

  // Calculations
  const ops=calcOps(proj.goldOperations)
  const pGiven=(proj.pakalTable||[]).reduce((s,r)=>s+n(r.goldGiven),0)
  const pReceived=(proj.pakalTable||[]).reduce((s,r)=>s+n(r.goldReceived),0)
  const pWaste=(proj.pakalTable||[]).reduce((s,r)=>s+n(r.wasteGoldTaken),0)
  const tTach=(proj.tachhiTable||[]).reduce((s,r)=>s+n(r.tach),0)
  const goldInBox=ops.added+pReceived-ops.removed-pGiven
  const wasteInBox=pWaste-ops.wasteR
  const tachInBox=tTach-ops.tachR
  const simpleUsed=ops.added-ops.removed-ops.tachR-ops.wasteR
  const simpleWithW=simpleUsed+(n(proj.wastagePercent)/100*simpleUsed)

  // Pakal gold used per row = before - after (auto-fill)
  const pakalGoldUsedTotal=(proj.pakalTable||[]).reduce((s,r)=>s+(n(r.itemWeightBefore)-n(r.itemWeightAfter)),0)
  const tachhiTachTotal=(proj.tachhiTable||[]).reduce((s,r)=>s+n(r.tach),0)

  // NEW formula: Gold Used Without Wastage = sum(Pakal gold used) - sum(Tachhi tach)
  const goldWithout=pakalGoldUsedTotal-tachhiTachTotal
  const goldWith=goldWithout+(n(proj.wastagePercent)/100*pGiven)

  const pakalDiffTotal=(proj.pakalTable||[]).reduce((s,r)=>s+(n(r.itemWeightBefore)+n(r.goldGiven)-n(r.itemWeightAfter)-n(r.goldReceived)-n(r.wasteGoldTaken)),0)
  const tachhiDiffTotal=(proj.tachhiTable||[]).reduce((s,r)=>s+(n(r.itemWeightAfter)+n(r.tach)-n(r.itemWeightBefore)),0)
  const totalDiff=pakalDiffTotal+tachhiDiffTotal
  const roughGold=ops.added-ops.removed-ops.tachR-ops.wasteR

  const mainPay=n(proj.totalGems)*n(proj.payPerGem)+n(proj.gemsPrice)
  const alerts=[goldInBox<0&&'Gold in Box is negative',wasteInBox<0&&'Waste Gold in Box is negative',tachInBox<0&&'Tach in Box is negative'].filter(Boolean)

  const mainSet={name:proj.setName||'Main Set',goldUsed:simple?simpleUsed:goldWith,totalGems:n(proj.totalGems),gemPrice:n(proj.gemsPrice),totalPayment:mainPay,gemWeight:proj.gemWeight||{}}
  const allSets=[mainSet,...(proj.addDataSections||[]).map(s=>({name:s.name||'Section',goldUsed:n(s.totalGoldUsed),totalGems:n(s.totalGems),gemPrice:n(s.gemPrice),totalPayment:(n(s.totalGems)*n(proj.payPerGem))+n(s.gemPrice),gemWeight:s.gemWeight||{}}))]
  const grandGold=allSets.reduce((s,x)=>s+x.goldUsed,0)
  const grandGems=allSets.reduce((s,x)=>s+x.totalGems,0)
  const grandPay=allSets.reduce((s,x)=>s+x.totalPayment,0)

  const handleSave=async()=>{
    if(!proj.setName||!proj.givenBy)return toast.error('Set Name and Given By required')
    // If transitioning to completed and detailed project, show gem count modal first
    if(proj.status==='completed'&&!wasCompleted.current&&!simple){
      setShowGemCountModal(true)
      return
    }
    await doSave()
  }

  const doSave=async()=>{
    setSaving(true)
    try{
      if(pid){ await api.put(`/projects/${pid}`,proj); toast.success('Saved!'); wasCompleted.current=proj.status==='completed' }
      else{ const{data}=await api.post('/projects',proj); setSavedId(data.project._id); navigate(`/projects/${data.project._id}`,{replace:true}); toast.success('Created!') }
    }catch(err){ toast.error(err.response?.data?.error||'Save failed') }
    finally{ setSaving(false) }
  }

  const uploadImg=async(file)=>{
    if(!pid)return toast.error('Save project first')
    setImgBusy(true); const fd=new FormData(); fd.append('image',file)
    try{ const{data}=await api.post(`/projects/${pid}/image`,fd); set('image',data.imageUrl); toast.success('Uploaded') }
    catch{ toast.error('Upload failed') } finally{ setImgBusy(false) }
  }

  const addOp=()=>{ if(!newOp.amount||n(newOp.amount)<=0)return toast.error('Enter valid amount'); upd(p=>({...p,goldOperations:[...(p.goldOperations||[]),{...newOp,amount:n(newOp.amount),createdAt:new Date()}]})); setNewOp(o=>({...o,amount:''})) }
  const addRow=(tbl,blank)=>upd(p=>({...p,[tbl]:[...(p[tbl]||[]),blank]}))
  const delRow=(tbl,i)=>upd(p=>({...p,[tbl]:p[tbl].filter((_,idx)=>idx!==i)}))
  const setRow=(tbl,i,f,v)=>upd(p=>{ const rows=[...(p[tbl]||[])]; rows[i]={...rows[i],[f]:v}; return{...p,[tbl]:rows} })
  const addSec=()=>upd(p=>({...p,addDataSections:[...(p.addDataSections||[]),{name:'',totalGoldUsed:0,totalGems:0,gemPrice:0,gemWeight:{red:0,green:0,white:0,blue:0}}]}))
  const delSec=(i)=>upd(p=>({...p,addDataSections:p.addDataSections.filter((_,idx)=>idx!==i)}))
  const setSec=(i,f,v)=>upd(p=>{ const s=[...(p.addDataSections||[])]; if(f.includes('.')){const[a,b]=f.split('.');s[i]={...s[i],[a]:{...s[i][a],[b]:v}}}else s[i]={...s[i],[f]:v}; return{...p,addDataSections:s} })

  // Gem count modal handlers
  const addCustomType=()=>setProj(p=>({...p,gemCount:{...p.gemCount,customTypes:[...(p.gemCount?.customTypes||[]),{name:'',count:0}]}}))
  const setCustomType=(i,f,v)=>setProj(p=>{ const ct=[...(p.gemCount?.customTypes||[])]; ct[i]={...ct[i],[f]:v}; return{...p,gemCount:{...p.gemCount,customTypes:ct}} })
  const delCustomType=(i)=>setProj(p=>({...p,gemCount:{...p.gemCount,customTypes:p.gemCount.customTypes.filter((_,idx)=>idx!==i)}}))

  if(loading)return<div className="p-6 space-y-4 max-w-5xl mx-auto">{[1,2,3].map(i=><div key={i}className="h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse"/>)}</div>

  const summaryData={goldInBox,wasteInBox,tachInBox,goldWith,goldWithout,simpleUsed,simpleWithW,mainPay,grandGold,grandGems,grandPay,allSets,roughGold,totalDiff}

  return(
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={()=>navigate('/projects')}className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"><ArrowLeft className="w-4 h-4"/></button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white"style={{fontFamily:'Playfair Display,serif'}}>{isNew?'New Project':proj.setName||'Project'}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${simple?'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400':'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>{simple?'Simple':'Detailed'}</span>
              {done&&<span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">Completed — Read Only</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!isNew&&<button onClick={()=>setShowPdf(true)}className="btn-secondary"><Download className="w-4 h-4"/>PDF</button>}
          {!done&&<button onClick={handleSave}disabled={saving}className="btn-primary min-w-[80px]"><Save className="w-4 h-4"/>{saving?'Saving…':'Save'}</button>}
        </div>
      </div>

      {alerts.length>0&&(<div className="danger-box mb-4 flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/><div><p className="font-bold text-red-700 dark:text-red-400 text-sm mb-1">Gold Box Warning</p>{alerts.map((a,i)=><p key={i}className="text-xs text-red-600 dark:text-red-400">• {a}</p>)}</div></div>)}

      <SC title="Project Photo">
        <div className="flex items-center gap-4">
          <div onClick={()=>!done&&fileRef.current?.click()}className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${done?'border-slate-200 dark:border-zinc-700':'border-slate-300 dark:border-zinc-600 cursor-pointer hover:border-amber-500'}`}>
            {proj.image?<img src={proj.image}alt="project"className="w-full h-full object-cover"/>:<div className="text-center text-slate-400"><Image className="w-7 h-7 mx-auto mb-1"/><span className="text-xs">Add Photo</span></div>}
          </div>
          {!done&&<div><button onClick={()=>fileRef.current?.click()}className="btn-secondary text-sm"disabled={imgBusy}><Image className="w-4 h-4"/>{imgBusy?'Uploading…':'Upload Photo'}</button>{isNew&&<p className="text-xs text-slate-400 mt-1.5">Save project first.</p>}</div>}
          <input ref={fileRef}type="file"accept="image/*"className="hidden"onChange={e=>e.target.files[0]&&uploadImg(e.target.files[0])}/>
        </div>
      </SC>

      <SC title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Fld label="Project Name *"><input className="input-base"disabled={done}value={proj.setName}onChange={e=>set('setName',e.target.value)}/></Fld>
          <Fld label="Given By *"><input className="input-base"disabled={done}value={proj.givenBy}onChange={e=>set('givenBy',e.target.value)}/></Fld>
          <Fld label="Start Date"><input className="input-base"type="date"disabled={done}value={proj.startDate}onChange={e=>set('startDate',e.target.value)}/></Fld>
          <Fld label="Submission Date"><input className="input-base"type="date"disabled={done}value={proj.submissionDate}onChange={e=>set('submissionDate',e.target.value)}/></Fld>
          <Fld label="Wastage %"><CalcInput className="input-base"disabled={done}value={proj.wastagePercent}onChange={v=>set('wastagePercent',v)}/></Fld>
          <Fld label="Pay Per Gem (₹)"><CalcInput className="input-base"disabled={done}value={proj.payPerGem}onChange={v=>set('payPerGem',v)}/></Fld>
          <Fld label="Status"><select className="input-base"value={proj.status}onChange={e=>set('status',e.target.value)}><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></Fld>
        </div>
      </SC>

      <SC title="Gold Calculation">
        {!done&&(<div className="info-box mb-4">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Add Gold Operation</p>
          <div className="flex flex-wrap gap-2">
            <select className="input-base w-auto text-sm"value={newOp.type}onChange={e=>setNewOp(o=>({...o,type:e.target.value}))}><option value="add">Gold Add</option><option value="remove">Gold Remove</option>{!simple&&<option value="waste_remove">Waste Gold Remove</option>}{!simple&&<option value="tach_remove">Gold Tach Remove</option>}</select>
            <CalcInput className="input-base w-32"value={n(newOp.amount)}onChange={v=>setNewOp(o=>({...o,amount:v}))}placeholder="Amount (g)"/>
            <input className="input-base flex-1 min-w-28"type="text"placeholder="Note (optional)"value={newOp.note}onChange={e=>setNewOp(o=>({...o,note:e.target.value}))}/>
            <button onClick={addOp}className="btn-primary"><Plus className="w-4 h-4"/>Add</button>
          </div>
        </div>)}
        {(proj.goldOperations||[]).length>0&&(<div className="overflow-x-auto mb-4 rounded-xl border border-slate-200 dark:border-zinc-700">
          <table className="w-full text-sm"><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700"><th className="table-header text-left py-2.5 px-3">Type</th><th className="table-header text-right py-2.5 px-3">Amount (g)</th><th className="table-header text-left py-2.5 px-3">Note</th>{!done&&<th className="py-2.5 px-3"/>}</tr></thead>
          <tbody>{(proj.goldOperations||[]).map((op,i)=>(<tr key={i}className="border-b border-slate-100 dark:border-zinc-800 last:border-0"><td className="py-2 px-3"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${OP_COLOR[op.type]}`}>{OP_LABEL[op.type]}</span></td><td className="py-2 px-3 text-right font-mono font-bold">{fmt(op.amount)}g</td><td className="py-2 px-3 text-slate-500 text-xs">{op.note}</td>{!done&&<td className="py-2 px-3"><button onClick={()=>upd(p=>({...p,goldOperations:p.goldOperations.filter((_,idx)=>idx!==i)}))}className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 className="w-3.5 h-3.5"/></button></td>}</tr>))}</tbody></table>
        </div>)}
        <div className={`grid gap-3 ${simple?'grid-cols-1 sm:grid-cols-2':'grid-cols-1 sm:grid-cols-3'}`}>
          <BoxCard label="Gold in Box (g)"value={goldInBox}neg={goldInBox<0}color="amber"/>
          {!simple&&<BoxCard label="Waste Gold in Box (g)"value={wasteInBox}neg={wasteInBox<0}color="orange"/>}
          {!simple&&<BoxCard label="Tach in Box (g)"value={tachInBox}neg={tachInBox<0}color="purple"/>}
        </div>
      </SC>

      {!simple&&(<>
        <GemTable title="Gem Packing (max 4)"rows={proj.gemPackingTable}disabled={done}maxRows={4}onAdd={()=>addRow('gemPackingTable',{userName:'',gems:0})}onRemove={i=>delRow('gemPackingTable',i)}onChange={(i,f,v)=>setRow('gemPackingTable',i,f,v)}/>
        <GemTable title="Gem Setting"rows={proj.gemSettingTable}disabled={done}onAdd={()=>addRow('gemSettingTable',{userName:'',gems:0})}onRemove={i=>delRow('gemSettingTable',i)}onChange={(i,f,v)=>setRow('gemSettingTable',i,f,v)}/>
        <PakalTable rows={proj.pakalTable}disabled={done}onAdd={()=>addRow('pakalTable',{user:'',itemWeightBefore:0,goldGiven:0,itemWeightAfter:0,goldReceived:0,wasteGoldTaken:0,gems:0})}onRemove={i=>delRow('pakalTable',i)}onChange={(i,f,v)=>setRow('pakalTable',i,f,v)}/>
        <TachhiTable rows={proj.tachhiTable}disabled={done}onAdd={()=>addRow('tachhiTable',{user:'',itemWeightBefore:0,itemWeightAfter:0,tach:0,gems:0})}onRemove={i=>delRow('tachhiTable',i)}onChange={(i,f,v)=>setRow('tachhiTable',i,f,v)}/>

        {/* Gold Calculations block — Rough Gold + Total Diff (separate from Project Summary) */}
        <SC title="Gold Calculations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KV label="Roughly Gold Used (g)"value={fmt(roughGold)+'g'}sub="Added − Removed − Tach Removed − Waste Removed"/>
            <KV label="Total Diff (g)"value={fmt(totalDiff)+'g'}sub="Sum Diff Pakal + Sum Diff Tachhi"hi/>
          </div>
        </SC>
      </>)}

      <SC title="Project Summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {simple?<><KV label="Gold Used (g)"value={fmt(simpleUsed)+'g'}/><KV label="Gold Used With Wastage (g)"value={fmt(simpleWithW)+'g'}hi/></>
          :<><KV label="Gold Used Without Wastage (g)"value={fmt(goldWithout)+'g'}sub="Sum Pakal Gold Used − Sum Tachhi Tach"/><KV label="Gold Used With Wastage (g)"value={fmt(goldWith)+'g'}hi/></>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><p className="label mb-2">Gem Weight (g)</p><div className="grid grid-cols-2 gap-2">{['red','green','white','blue'].map(c=>(<div key={c}><label className="text-xs text-slate-500 capitalize mb-1 block">{c}</label><CalcInput className="input-base text-sm"disabled={done}value={proj.gemWeight?.[c]||0}onChange={v=>set(`gemWeight.${c}`,v)}/></div>))}</div></div>
          <div className="space-y-3">
            <Fld label="Total Gems (Manual)"><CalcInput className="input-base"disabled={done}value={proj.totalGems}onChange={v=>set('totalGems',v)}/></Fld>
            <Fld label="Gems Price (₹)"><CalcInput className="input-base"disabled={done}value={proj.gemsPrice}onChange={v=>set('gemsPrice',v)}/></Fld>
            <div className="summary-box"><p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">Total Payment</p><p className="text-2xl font-bold text-amber-800 dark:text-amber-300">₹{fmt(mainPay)}</p><p className="text-xs text-amber-600/70 mt-1">{proj.totalGems} gems × ₹{proj.payPerGem} + ₹{proj.gemsPrice}</p></div>
          </div>
        </div>
      </SC>

      <SC title="Add Data"action={!done&&<button onClick={addSec}className="btn-primary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5"/>Add Section</button>}>
        {(proj.addDataSections||[]).length===0?<p className="text-slate-400 text-sm">No sections yet.</p>:(proj.addDataSections||[]).map((sec,i)=>(
          <div key={i}className="info-box mb-3">
            <div className="flex items-center justify-between mb-3"><input className="input-base font-semibold max-w-xs text-sm"placeholder="Section name…"disabled={done}value={sec.name}onChange={e=>setSec(i,'name',e.target.value)}/>{!done&&<button onClick={()=>delSec(i)}className="text-red-400 hover:text-red-600 p-1 rounded"><X className="w-4 h-4"/></button>}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <Fld label="Gold Used (g)"><CalcInput className="input-base text-sm"disabled={done}value={sec.totalGoldUsed}onChange={v=>setSec(i,'totalGoldUsed',v)}/></Fld>
              <Fld label="Total Gems"><CalcInput className="input-base text-sm"disabled={done}value={sec.totalGems}onChange={v=>setSec(i,'totalGems',v)}/></Fld>
              <Fld label="Gem Price (₹)"><CalcInput className="input-base text-sm"disabled={done}value={sec.gemPrice}onChange={v=>setSec(i,'gemPrice',v)}/></Fld>
              <div className="summary-box !p-3"><p className="text-xs text-amber-700 dark:text-amber-400">Total Payment</p><p className="font-bold text-amber-800 dark:text-amber-300">₹{fmt((n(sec.totalGems)*n(proj.payPerGem))+n(sec.gemPrice))}</p></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{['red','green','white','blue'].map(c=>(<div key={c}><label className="text-xs text-slate-500 capitalize mb-1 block">{c} gem wt</label><CalcInput className="input-base text-xs"disabled={done}value={sec.gemWeight?.[c]||0}onChange={v=>setSec(i,`gemWeight.${c}`,v)}/></div>))}</div>
          </div>
        ))}
      </SC>

      {(proj.addDataSections||[]).length>0&&(<SC title="Set Summary">
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700">
          <table className="w-full text-sm"><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">{['Set / Section','Gold Used (g)','Gems','Gem Price (₹)','Gem Wt (R/G/W/B)','Total Payment (₹)'].map(h=><th key={h}className="table-header text-left py-3 px-4">{h}</th>)}</tr></thead>
          <tbody>{allSets.map((s,i)=>(<tr key={i}className={`border-b border-slate-100 dark:border-zinc-800 ${i===0?'bg-amber-50/40 dark:bg-amber-900/5':''}`}><td className="py-3 px-4 font-semibold">{i===0?'⬤ ':''}{s.name}</td><td className="py-3 px-4 font-mono">{fmt(s.goldUsed)}</td><td className="py-3 px-4 font-mono">{s.totalGems}</td><td className="py-3 px-4 font-mono">₹{fmt(s.gemPrice)}</td><td className="py-3 px-4 font-mono text-xs text-slate-500">{fmt(s.gemWeight?.red||0)}/{fmt(s.gemWeight?.green||0)}/{fmt(s.gemWeight?.white||0)}/{fmt(s.gemWeight?.blue||0)}</td><td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">₹{fmt(s.totalPayment)}</td></tr>))}</tbody>
          <tfoot><tr className="bg-amber-50 dark:bg-amber-900/20 border-t-2 border-amber-300 dark:border-amber-700"><td className="py-3 px-4 font-bold">Grand Total</td><td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">{fmt(grandGold)}</td><td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">{grandGems}</td><td/><td/><td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">₹{fmt(grandPay)}</td></tr></tfoot>
          </table>
        </div>
      </SC>)}

      {/* Gem Count display if set */}
      {(proj.gemCount?.pakalGems>0||proj.gemCount?.tacchiGems>0||(proj.gemCount?.customTypes||[]).length>0)&&(
        <SC title="Gem Count (at completion)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="info-box"><p className="text-xs text-slate-500 mb-1">PAKAI Gems</p><p className="text-xl font-bold text-amber-600">{proj.gemCount.pakalGems}</p></div>
            <div className="info-box"><p className="text-xs text-slate-500 mb-1">TACHHI Gems</p><p className="text-xl font-bold text-amber-600">{proj.gemCount.tacchiGems}</p></div>
            {(proj.gemCount.customTypes||[]).map((ct,i)=>(<div key={i}className="info-box"><p className="text-xs text-slate-500 mb-1">{ct.name}</p><p className="text-xl font-bold text-amber-600">{ct.count}</p></div>))}
          </div>
        </SC>
      )}

      <SC title="Notes"><textarea className="input-base min-h-[90px] resize-y"disabled={done}value={proj.notes}onChange={e=>set('notes',e.target.value)}/></SC>

      {showPdf&&<PdfModal proj={proj}summaryData={summaryData}onClose={()=>setShowPdf(false)}/>}
      {showGemCountModal&&(
        <GemCountModal
          gemCount={proj.gemCount}
          onAddCustom={addCustomType} onSetCustom={setCustomType} onDelCustom={delCustomType}
          onSetField={(f,v)=>setProj(p=>({...p,gemCount:{...p.gemCount,[f]:v}}))}
          onCancel={()=>{ setShowGemCountModal(false); setProj(p=>({...p,status:'ongoing'})) }}
          onConfirm={()=>{ setShowGemCountModal(false); doSave() }}
        />
      )}
    </div>
  )
}

function BoxCard({label,value,neg,color}){
  const m={amber:['bg-amber-50 dark:bg-amber-900/10','border-amber-200 dark:border-amber-800','text-amber-600 dark:text-amber-400','text-amber-800 dark:text-amber-300'],orange:['bg-orange-50 dark:bg-orange-900/10','border-orange-200 dark:border-orange-800','text-orange-600 dark:text-orange-400','text-orange-800 dark:text-orange-300'],purple:['bg-purple-50 dark:bg-purple-900/10','border-purple-200 dark:border-purple-800','text-purple-600 dark:text-purple-400','text-purple-800 dark:text-purple-300']}
  const[bg,bd,lc,vc]=neg?['bg-red-50 dark:bg-red-900/10','border-red-200 dark:border-red-800','text-red-500','text-red-700 dark:text-red-400']:m[color]
  return(<div className={`rounded-xl p-4 border ${bg} ${bd}`}><p className={`text-xs font-medium mb-1 ${lc}`}>{label}</p><div className="flex items-center gap-2">{neg&&<AlertTriangle className="w-4 h-4 text-red-500 shrink-0"/>}<p className={`text-xl font-bold ${vc}`}>{fmt(value)}g</p></div>{neg&&<p className="text-xs text-red-500 mt-1">Check entries!</p>}</div>)
}
function KV({label,value,hi,sub}){return(<div className={`rounded-xl p-4 border ${hi?'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700':'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'}`}><p className={`text-xs font-medium mb-1 ${hi?'text-amber-600 dark:text-amber-400':'text-slate-500'}`}>{label}</p><p className={`text-xl font-bold ${hi?'text-amber-800 dark:text-amber-300':'text-slate-800 dark:text-slate-200'}`}>{value}</p>{sub&&<p className="text-xs text-slate-400 mt-0.5">{sub}</p>}</div>)}

function GemTable({title,rows,onAdd,onRemove,onChange,disabled,maxRows}){
  return(<div className="section-card"><div className="flex items-center justify-between mb-4"><h2 className="font-bold">{title}</h2>{!disabled&&(!maxRows||(rows||[]).length<maxRows)&&<button onClick={onAdd}className="btn-primary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5"/>Add Row</button>}</div>
  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700"><table className="w-full text-sm"><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700"><th className="table-header text-left py-2.5 px-4">User Name</th><th className="table-header text-right py-2.5 px-4">Gems</th>{!disabled&&<th className="py-2.5 px-3"/>}</tr></thead>
  <tbody>{(rows||[]).map((row,i)=>(<tr key={i}className="border-b border-slate-100 dark:border-zinc-800 last:border-0"><td className="py-2 px-3"><input disabled={disabled}className="input-base text-xs py-1.5"value={row.userName}onChange={e=>onChange(i,'userName',e.target.value)}placeholder="Name…"/></td><td className="py-2 px-3"><CalcInput disabled={disabled}className="input-base text-xs py-1.5"value={row.gems}onChange={v=>onChange(i,'gems',v)}/></td>{!disabled&&<td className="py-2 px-3"><button onClick={()=>onRemove(i)}className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 className="w-3.5 h-3.5"/></button></td>}</tr>))}
  <tr className="bg-slate-50 dark:bg-zinc-800/60"><td className="py-2.5 px-4 text-xs font-bold">Total</td><td className="py-2.5 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">{fmt((rows||[]).reduce((s,r)=>s+n(r.gems),0))}</td>{!disabled&&<td/>}</tr></tbody></table></div></div>)
}

function PakalTable({rows,onAdd,onRemove,onChange,disabled}){
  return(<div className="section-card"><div className="flex items-center justify-between mb-4"><h2 className="font-bold">Pakal Table</h2>{!disabled&&<button onClick={onAdd}className="btn-primary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5"/>Add Row</button>}</div>
  <div className="overflow-x-auto"><table className="w-full text-sm"style={{minWidth:'880px'}}><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">{['User','Wt Before','Gold Given','Wt After','Gold Used (auto)','Gold Rcvd','Waste','Gems'].map(h=><th key={h}className="table-header text-left py-2.5 px-3">{h}</th>)}<th className="table-header py-2.5 px-3 text-amber-600">Diff</th>{!disabled&&<th/>}</tr></thead>
  <tbody>{(rows||[]).map((row,i)=>{
    const goldUsed=n(row.itemWeightBefore)-n(row.itemWeightAfter)
    const diff=n(row.itemWeightBefore)+n(row.goldGiven)-n(row.itemWeightAfter)-n(row.goldReceived)-n(row.wasteGoldTaken)
    return(<tr key={i}className="border-b border-slate-100 dark:border-zinc-800 last:border-0">
      <td className="py-1.5 px-2"><input disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.user}onChange={e=>onChange(i,'user',e.target.value)}placeholder="Name"/></td>
      <td className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.itemWeightBefore}onChange={v=>onChange(i,'itemWeightBefore',v)}/></td>
      <td className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.goldGiven}onChange={v=>onChange(i,'goldGiven',v)}/></td>
      <td className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.itemWeightAfter}onChange={v=>onChange(i,'itemWeightAfter',v)}/></td>
      <td className="py-1.5 px-3 font-mono font-bold text-xs text-blue-600 dark:text-blue-400">{fmt(goldUsed)}</td>
      <td className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.goldReceived}onChange={v=>onChange(i,'goldReceived',v)}/></td>
      <td className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.wasteGoldTaken}onChange={v=>onChange(i,'wasteGoldTaken',v)}/></td>
      <td className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-16"value={row.gems}onChange={v=>onChange(i,'gems',v)}/></td>
      <td className="py-1.5 px-3 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{fmt(diff)}</td>
      {!disabled&&<td className="py-1.5 px-2"><button onClick={()=>onRemove(i)}className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 className="w-3.5 h-3.5"/></button></td>}
    </tr>)
  })}
  <tr className="bg-slate-50 dark:bg-zinc-800/60 text-xs font-bold">
    <td className="py-2.5 px-3">Total</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r.itemWeightBefore),0))}</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r.goldGiven),0))}</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r.itemWeightAfter),0))}</td>
    <td className="py-2.5 px-3 font-mono text-blue-600">{fmt((rows||[]).reduce((s,r)=>s+(n(r.itemWeightBefore)-n(r.itemWeightAfter)),0))}</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r.goldReceived),0))}</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r.wasteGoldTaken),0))}</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r.gems),0))}</td>
    <td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+(n(r.itemWeightBefore)+n(r.goldGiven)-n(r.itemWeightAfter)-n(r.goldReceived)-n(r.wasteGoldTaken)),0))}</td>
    {!disabled&&<td/>}
  </tr></tbody></table></div></div>)
}

function TachhiTable({rows,onAdd,onRemove,onChange,disabled}){
  return(<div className="section-card"><div className="flex items-center justify-between mb-4"><h2 className="font-bold">Tachhi Table</h2>{!disabled&&<button onClick={onAdd}className="btn-primary text-xs px-3 py-1.5"><Plus className="w-3.5 h-3.5"/>Add Row</button>}</div>
  <div className="overflow-x-auto"><table className="w-full text-sm"style={{minWidth:'560px'}}><thead><tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">{['User','Wt Before','Wt After','Tach','Gems'].map(h=><th key={h}className="table-header text-left py-2.5 px-3">{h}</th>)}<th className="table-header py-2.5 px-3 text-amber-600">Diff</th>{!disabled&&<th/>}</tr></thead>
  <tbody>{(rows||[]).map((row,i)=>{ const diff=n(row.itemWeightAfter)+n(row.tach)-n(row.itemWeightBefore); return(<tr key={i}className="border-b border-slate-100 dark:border-zinc-800 last:border-0"><td className="py-1.5 px-2"><input disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row.user}onChange={e=>onChange(i,'user',e.target.value)}placeholder="Name"/></td>{['itemWeightBefore','itemWeightAfter','tach','gems'].map(f=><td key={f}className="py-1.5 px-2"><CalcInput disabled={disabled}className="input-base text-xs py-1.5 w-20"value={row[f]}onChange={v=>onChange(i,f,v)}/></td>)}<td className="py-1.5 px-3 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">{fmt(diff)}</td>{!disabled&&<td className="py-1.5 px-2"><button onClick={()=>onRemove(i)}className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 className="w-3.5 h-3.5"/></button></td>}</tr>) })}
  <tr className="bg-slate-50 dark:bg-zinc-800/60 text-xs font-bold"><td className="py-2.5 px-3">Total</td>{['itemWeightBefore','itemWeightAfter','tach','gems'].map(f=><td key={f}className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+n(r[f]),0))}</td>)}<td className="py-2.5 px-3 font-mono text-amber-600">{fmt((rows||[]).reduce((s,r)=>s+(n(r.itemWeightAfter)+n(r.tach)-n(r.itemWeightBefore)),0))}</td>{!disabled&&<td/>}</tr></tbody></table></div></div>)
}

function GemCountModal({gemCount,onAddCustom,onSetCustom,onDelCustom,onSetField,onCancel,onConfirm}){
  return(<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="card p-6 w-full max-w-md shadow-2xl">
      <div className="flex items-center gap-2 mb-2"><Gem className="w-5 h-5 text-amber-600"/><h3 className="font-bold text-lg">Gem Count at Completion</h3></div>
      <p className="text-xs text-slate-500 mb-5">Before marking this project complete, record how many gems of each type were used. This data powers your dashboard charts.</p>
      <div className="space-y-3 mb-4">
        <Fld label="No. of PAKAI Gems"><CalcInput className="input-base"value={gemCount?.pakalGems||0}onChange={v=>onSetField('pakalGems',v)}/></Fld>
        <Fld label="No. of TACHHI Gems"><CalcInput className="input-base"value={gemCount?.tacchiGems||0}onChange={v=>onSetField('tacchiGems',v)}/></Fld>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2"><p className="label !mb-0">Custom Gem Types</p><button onClick={onAddCustom}className="text-xs text-amber-600 font-medium flex items-center gap-1"><Plus className="w-3 h-3"/>Add Type</button></div>
        {(gemCount?.customTypes||[]).map((ct,i)=>(<div key={i}className="flex gap-2 mb-2"><input className="input-base flex-1"placeholder="Type name"value={ct.name}onChange={e=>onSetCustom(i,'name',e.target.value)}/><CalcInput className="input-base w-24"value={ct.count}onChange={v=>onSetCustom(i,'count',v)}/><button onClick={()=>onDelCustom(i)}className="text-red-400 p-2"><X className="w-4 h-4"/></button></div>))}
      </div>
      <div className="flex gap-3"><button onClick={onCancel}className="btn-secondary flex-1">Cancel</button><button onClick={onConfirm}className="btn-primary flex-1">Confirm & Complete</button></div>
    </div>
  </div>)
}

function PdfModal({proj,summaryData,onClose}){
  const simple=proj.projectType==='simple'
  const all=['basicInfo','goldOps','goldBox','goldCalc','summary','gemCount','setSummary','pakalTable','tachhiTable','billPrint','notes']
  const simpleAll=['basicInfo','goldOps','goldBox','goldCalc','summary','setSummary','notes']
  const available=simple?simpleAll:all
  const[sel,setSel]=useState(new Set(available))
  const toggle=f=>setSel(prev=>{const n=new Set(prev);n.has(f)?n.delete(f):n.add(f);return n})
  const toggleAll=()=>setSel(sel.size===available.length?new Set():new Set(available))
  const LABELS={basicInfo:'Basic Information',goldOps:'Gold Operations',goldBox:'Gold Box Info',goldCalc:'Gold Calculations (Rough/Diff)',summary:'Project Summary',gemCount:'Gem Count',setSummary:'Set Summary',pakalTable:'Pakal Table',tachhiTable:'Tachhi Table',billPrint:'Bill Print (Grand Total)',notes:'Notes'}
  const go=()=>{generateProjectPDF(proj,summaryData,sel);onClose();toast.success('PDF exported!')}
  return(<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="card p-6 w-full max-w-sm shadow-2xl">
    <div className="flex items-center justify-between mb-2"><h3 className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600"/>Export PDF</h3><button onClick={onClose}className="text-slate-400 p-1"><X className="w-5 h-5"/></button></div>
    <div className="flex items-center justify-between mb-3"><p className="text-xs text-slate-500">Select sections:</p><button onClick={toggleAll}className="text-xs text-amber-600 font-medium">{sel.size===available.length?'Deselect All':'Select All'}</button></div>
    <div className="space-y-2 mb-5 max-h-72 overflow-y-auto pr-1">{available.map(f=>(<label key={f}className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800"><input type="checkbox"checked={sel.has(f)}onChange={()=>toggle(f)}className="w-4 h-4 accent-amber-600 rounded"/><span className="text-sm">{LABELS[f]}</span>{f==='billPrint'&&<Receipt className="w-3.5 h-3.5 text-amber-500 ml-auto"/>}</label>))}</div>
    <div className="flex gap-3"><button onClick={onClose}className="btn-secondary flex-1">Cancel</button><button onClick={go}className="btn-primary flex-1"><Download className="w-4 h-4"/>Export</button></div>
  </div></div>)
}
