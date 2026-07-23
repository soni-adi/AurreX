import{useState,useEffect,useCallback}from'react'
import{Link}from'react-router-dom'
import{Search,Plus,Trash2,Users}from'lucide-react'
import toast from'react-hot-toast'
import api from'../../lib/axios'
const TYPE={Boss:'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',Mates:'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',Staff:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',Payment:'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}
export default function LeaderConnections(){
  const[conns,setConns]=useState([]);const[loading,setLoading]=useState(true);const[search,setSearch]=useState('');const[filter,setFilter]=useState('all')
  const load=useCallback(async()=>{setLoading(true);try{const p=new URLSearchParams({connectionMode:'leader'});if(search)p.set('search',search);if(filter!=='all')p.set('type',filter);const{data}=await api.get('/connections?'+p);setConns(data.connections||[])}catch{toast.error('Failed')}finally{setLoading(false)}},[search,filter])
  useEffect(()=>{load()},[load])
  const del=async(id,e)=>{e.preventDefault();e.stopPropagation();if(!confirm('Delete?'))return;try{await api.delete('/connections/'+id);setConns(c=>c.filter(x=>x._id!==id));toast.success('Deleted')}catch{toast.error('Failed')}}
  return(
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="page-title"style={{fontFamily:'Playfair Display,serif'}}>Connections</h1><p className="page-sub">Manage boss, mates, staff & payment connections</p></div><Link to="/connections/new"className="btn-primary"><Plus className="w-4 h-4"/>New Connection</Link></div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input className="input-base pl-9"placeholder="Search…"value={search}onChange={e=>setSearch(e.target.value)}/></div>
        <div className="flex gap-2 flex-wrap">{['all','Boss','Mates','Staff','Payment'].map(f=><button key={f}onClick={()=>setFilter(f)}className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${filter===f?'bg-amber-600 text-white':'bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-zinc-700'}`}>{f}</button>)}</div>
      </div>
      {loading?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i}className="card p-5 h-24 animate-pulse bg-slate-100 dark:bg-zinc-800"/>)}</div>
      :conns.length===0?<div className="text-center py-24"><Users className="w-16 h-16 text-slate-300 dark:text-zinc-700 mx-auto mb-4"/><h3 className="text-lg font-semibold mb-1">No connections</h3><Link to="/connections/new"className="btn-primary inline-flex mt-3"><Plus className="w-4 h-4"/>Add Connection</Link></div>
      :<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{conns.map(c=>(
        <Link key={c._id}to={'/connections/'+c._id}className="card p-5 hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-800 transition-all group">
          <div className="flex items-center gap-3">
            {c.image?<img src={c.image}className="w-12 h-12 rounded-full object-cover shrink-0"alt={c.name}/>:<div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-lg font-bold shrink-0">{c.name?.charAt(0)?.toUpperCase()}</div>}
            <div className="flex-1 min-w-0"><p className="font-bold truncate">{c.name}</p><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE[c.type]||''}`}>{c.type}</span></div>
            <button onClick={e=>del(c._id,e)}className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-4 h-4"/></button>
          </div>
        </Link>
      ))}</div>}
    </div>
  )
}