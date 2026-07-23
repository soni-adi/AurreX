import{useState,useEffect,useCallback}from'react'
import{Link}from'react-router-dom'
import{Plus,Trash2,Users,Search}from'lucide-react'
import toast from'react-hot-toast'
import api from'@/lib/axios'
import{n,fmt}from'@/lib/utils'
export default function StaffConnections(){
  const[conns,setConns]=useState([]);const[loading,setLoading]=useState(true);const[search,setSearch]=useState('')
  const load=useCallback(async()=>{setLoading(true);try{const p=new URLSearchParams({connectionMode:'staff'});if(search)p.set('search',search);const{data}=await api.get('/connections?'+p);setConns(data.connections||[])}catch{toast.error('Failed')}finally{setLoading(false)}},[search])
  useEffect(()=>{load()},[load])
  const del=async(id,e)=>{e.preventDefault();e.stopPropagation();if(!confirm('Delete?'))return;try{await api.delete('/connections/'+id);setConns(c=>c.filter(x=>x._id!==id));toast.success('Deleted')}catch{toast.error('Failed')}}
  const getSummary=(c)=>{const gemTotal=(c.gemEntry||[]).reduce((s,r)=>s+n(r.amount),0);const paidTotal=(c.staffPaymentEntry||[]).reduce((s,r)=>s+n(r.amount),0);return{gemTotal,paidTotal,balance:gemTotal-paidTotal}}
  return(
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-7"><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>My Connections</h1><p className="text-sm text-slate-500">Track your boss connections</p></div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input className="input-base pl-9"placeholder="Search…"value={search}onChange={e=>setSearch(e.target.value)}/></div><Link to="/staff/connections/new"className="btn-blue whitespace-nowrap"><Plus className="w-4 h-4"/>Add Boss</Link></div>
      {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i}className="h-24 rounded-2xl bg-slate-100 dark:bg-zinc-800 animate-pulse"/>)}</div>
      :conns.length===0?<div className="text-center py-24"><div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-blue-500"/></div><h3 className="text-lg font-semibold mb-1">No connections yet</h3><Link to="/staff/connections/new"className="btn-blue inline-flex mt-3"><Plus className="w-4 h-4"/>Add Boss</Link></div>
      :<div className="space-y-4">{conns.map(c=>{const s=getSummary(c);return(
        <Link key={c._id}to={'/staff/connections/'+c._id}className="card p-5 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all block group">
          <div className="flex items-center gap-4">
            {c.image?<img src={c.image}className="w-14 h-14 rounded-2xl object-cover shrink-0"alt={c.name}/>:<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">{c.name?.charAt(0)?.toUpperCase()}</div>}
            <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><p className="font-bold truncate">{c.name}</p><span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold shrink-0">Boss</span></div><div className="flex flex-wrap gap-4 text-xs"><span className="text-slate-500">Work: <strong>Rs.{fmt(s.gemTotal)}</strong></span><span className="text-slate-500">Received: <strong className="text-emerald-600">Rs.{fmt(s.paidTotal)}</strong></span><span className="text-slate-500">Balance: <strong className={s.balance>=0?'text-emerald-600':'text-red-500'}>Rs.{fmt(s.balance)}</strong></span></div></div>
            <button onClick={e=>del(c._id,e)}className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 className="w-4 h-4"/></button>
          </div>
        </Link>)})}</div>}
    </div>
  )
}