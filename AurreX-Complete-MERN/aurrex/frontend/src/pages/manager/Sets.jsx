import{useState,useEffect,useCallback}from'react'
import{Link}from'react-router-dom'
import{Search,Plus,Trash2,Package}from'lucide-react'
import toast from'react-hot-toast'
import api from'../../lib/axios'
import{n,fmt}from'../../lib/utils'
export default function ManagerSets(){
  const[sets,setSets]=useState([]);const[loading,setLoading]=useState(true);const[search,setSearch]=useState('')
  const load=useCallback(async()=>{setLoading(true);try{const p=new URLSearchParams();if(search)p.set('search',search);const{data}=await api.get('/sets?'+p);setSets(data.sets||[])}catch{toast.error('Failed')}finally{setLoading(false)}},[search])
  useEffect(()=>{load()},[load])
  const del=async(id,e)=>{e.preventDefault();e.stopPropagation();if(!confirm('Delete set?'))return;try{await api.delete('/sets/'+id);setSets(s=>s.filter(x=>x._id!==id));toast.success('Deleted')}catch{toast.error('Failed')}}
  const payOf=(s)=>(s.gemTable||[]).reduce((sum,r)=>sum+(n(r.totalGems)*n(r.pricePerGem))+n(r.gemPrice),0)
  return(
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>Sets</h1><p className="text-sm text-slate-500">Manage jewellery sets</p></div><Link to="/manager/sets/new"className="btn-violet"><Plus className="w-4 h-4"/>New Set</Link></div>
      <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input className="input-base pl-9"placeholder="Search sets…"value={search}onChange={e=>setSearch(e.target.value)}/></div>
      {loading?<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i}className="card p-5 h-36 animate-pulse bg-slate-100 dark:bg-zinc-800"/>)}</div>
      :sets.length===0?<div className="text-center py-24"><div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-violet-500"/></div><h3 className="text-lg font-semibold mb-1">No sets yet</h3><Link to="/manager/sets/new"className="btn-violet inline-flex mt-3"><Plus className="w-4 h-4"/>Create Set</Link></div>
      :<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{sets.map(s=>(
        <Link key={s._id}to={'/manager/sets/'+s._id}className="card p-5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all group relative">
          <div className="flex items-start justify-between mb-3">{s.image?<img src={s.image}className="w-10 h-10 rounded-xl object-cover"alt={s.setName}/>:<div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 font-bold">{s.setName?.charAt(0)?.toUpperCase()}</div>}<button onClick={e=>del(s._id,e)}className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-3.5 h-3.5"/></button></div>
          <h3 className="font-bold mb-1 truncate">{s.setName}</h3><p className="text-sm text-slate-500 mb-3">By {s.givenBy||'-'}</p>
          <div className="flex justify-between text-xs pt-3 border-t border-slate-100 dark:border-zinc-800"><span className="text-slate-400">{n(s.totalGems)} gems</span><span className="font-bold text-violet-600">Rs.{fmt(payOf(s))}</span></div>
        </Link>
      ))}</div>}
    </div>
  )
}