import{useState,useEffect,useCallback}from'react'
import{Link,useNavigate}from'react-router-dom'
import{Search,Plus,Trash2,FolderOpen,Layers,List,X}from'lucide-react'
import toast from'react-hot-toast'
import api from'../../lib/axios'
import{formatDate}from'../../lib/utils'
export default function LeaderProjects(){
  const[projects,setProjects]=useState([]);const[loading,setLoading]=useState(true)
  const[search,setSearch]=useState('');const[filter,setFilter]=useState('all');const[showModal,setShowModal]=useState(false)
  const navigate=useNavigate()
  const load=useCallback(async()=>{setLoading(true);try{const p=new URLSearchParams();if(search)p.set('search',search);if(filter!=='all')p.set('status',filter);const{data}=await api.get(`/projects?${p}`);setProjects(data.projects||[])}catch{toast.error('Failed')}finally{setLoading(false)}},[search,filter])
  useEffect(()=>{load()},[load])
  const del=async(id,e)=>{e.preventDefault();e.stopPropagation();if(!confirm('Delete project?'))return;try{await api.delete(`/projects/${id}`);setProjects(p=>p.filter(x=>x._id!==id));toast.success('Deleted')}catch{toast.error('Failed')}}
  return(
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="page-title"style={{fontFamily:'Playfair Display,serif'}}>Projects</h1><p className="page-sub">Manage your jewellery projects</p></div><button onClick={()=>setShowModal(true)}className="btn-primary"><Plus className="w-4 h-4"/>New Project</button></div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input className="input-base pl-9"placeholder="Search…"value={search}onChange={e=>setSearch(e.target.value)}/></div><div className="flex gap-2">{['all','ongoing','completed'].map(f=><button key={f}onClick={()=>setFilter(f)}className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter===f?'bg-amber-600 text-white shadow-sm':'bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700'}`}>{f}</button>)}</div></div>
      {loading?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4].map(i=><div key={i}className="card p-5 h-36 animate-pulse bg-slate-100 dark:bg-zinc-800"/>)}</div>
      :projects.length===0?<div className="text-center py-24"><div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4"><FolderOpen className="w-8 h-8 text-slate-400"/></div><h3 className="text-lg font-semibold mb-1">No projects</h3><p className="text-slate-400 text-sm mb-5">Create your first jewellery project</p><button onClick={()=>setShowModal(true)}className="btn-primary"><Plus className="w-4 h-4"/>Create Project</button></div>
      :<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{projects.map(p=>(
        <Link key={p._id}to={`/projects/${p._id}`}className="card p-5 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all group relative">
          <div className="flex items-start justify-between mb-3"><div className="flex flex-wrap gap-1.5"><span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${p.status==='ongoing'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>{p.status==='ongoing'?'● Ongoing':'✓ Done'}</span>{p.projectType==='simple'&&<span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">Simple</span>}</div><button onClick={e=>del(p._id,e)}className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-3.5 h-3.5"/></button></div>
          <h3 className="font-bold mb-1 truncate">{p.setName}</h3><p className="text-sm text-slate-500 mb-3">By {p.givenBy}</p>
          <div className="flex justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-zinc-800"><span>{formatDate(p.startDate)}</span><span>Due: {formatDate(p.submissionDate)}</span></div>
        </Link>
      ))}</div>}
      {showModal&&(<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="card p-6 w-full max-w-md shadow-2xl"><div className="flex items-center justify-between mb-5"><h3 className="text-lg font-bold">Choose Project Type</h3><button onClick={()=>setShowModal(false)}className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5"/></button></div><div className="space-y-3">{[{type:'detailed',icon:Layers,title:'Detailed Project',desc:'Full tracking — Pakal & Tachhi tables, gem packing/setting, all gold calculations with waste & tach. Includes Bill Print at completion.'},{type:'simple',icon:List,title:'Simple Project',desc:'Quick tracking — gold in/out, gem totals, total payment. No detailed tables.'}].map(({type,icon:Icon,title,desc})=>(<button key={type}onClick={()=>{setShowModal(false);navigate(`/projects/new?type=${type}`)}}className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-200 dark:border-zinc-700 hover:border-amber-500 transition-all text-left"><div className={`w-11 h-11 ${type==='detailed'?'bg-amber-100 dark:bg-amber-900/20':'bg-blue-100 dark:bg-blue-900/20'} rounded-xl flex items-center justify-center shrink-0`}><Icon className={`w-5 h-5 ${type==='detailed'?'text-amber-600':'text-blue-600'}`}/></div><div><p className="font-bold mb-1">{title}</p><p className="text-xs text-slate-500 leading-relaxed">{desc}</p></div></button>))}</div></div></div>)}
    </div>
  )
}