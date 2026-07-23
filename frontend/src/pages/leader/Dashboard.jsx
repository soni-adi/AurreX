import{useEffect,useState}from'react'
import{Link}from'react-router-dom'
import{FolderOpen,Users,Clock,CheckCircle,TrendingUp,Gem,ArrowRight,Plus}from'lucide-react'
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid}from'recharts'
import api from'@/lib/axios'
import{useAuthStore}from'@/store'
import{n,formatDate}from'@/lib/utils'

export default function LeaderDashboard(){
  const{user}=useAuthStore()
  const[projects,setProjects]=useState([]);const[connections,setConnections]=useState([])
  const[stats,setStats]=useState({monthly:{},total:0,ongoing:0,completed:0})
  const[loading,setLoading]=useState(true)
  useEffect(()=>{
    Promise.all([api.get('/projects?limit=8'),api.get('/connections?connectionMode=leader'),api.get('/projects/stats')])
      .then(([p,c,s])=>{setProjects(p.data.projects||[]);setConnections(c.data.connections||[]);setStats(s.data||{})})
      .catch(()=>{}).finally(()=>setLoading(false))
  },[])
  const monthData=Object.entries(stats.monthly||{}).map(([month,count])=>({month,count}))
  // Gems done per project — uses each project's totalGems (manual entry), most recent first
  const gemsPerProject=[...projects].slice(0,8).reverse().map(p=>({name:(p.setName||'').length>10?p.setName.slice(0,10)+'…':p.setName,gems:n(p.totalGems)}))
  const TYPE={Boss:'bg-purple-100 text-purple-700',Mates:'bg-blue-100 text-blue-700',Staff:'bg-emerald-100 text-emerald-700',Payment:'bg-rose-100 text-rose-700'}
  const Stat=({icon:Icon,label,val,c})=>(<div className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow"><div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${c}`}><Icon className="w-5 h-5"/></div><div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p><p className="text-2xl font-bold">{loading?'—':val}</p></div></div>)
  return(
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-7"><h1 className="page-title"style={{fontFamily:'Playfair Display,serif'}}>Dashboard</h1><p className="page-sub">Welcome back, <span className="text-amber-600 dark:text-amber-400 font-semibold">{user?.username}</span> 👋</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <Stat icon={Clock}label="Ongoing"val={stats.ongoing}c="bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"/>
        <Stat icon={CheckCircle}label="Completed"val={stats.completed}c="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"/>
        <Stat icon={FolderOpen}label="Total"val={stats.total}c="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"/>
        <Stat icon={Users}label="Connections"val={connections.length}c="bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-bold mb-1 flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-amber-500"/>Monthly Project Activity</h2>
          <p className="text-xs text-slate-400 mb-4">Projects updated per month</p>
          {loading?<div className="h-44 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>:
          <ResponsiveContainer width="100%"height={176}><BarChart data={monthData}margin={{top:4,right:4,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3"vertical={false}opacity={0.25}/><XAxis dataKey="month"tick={{fontSize:10}}axisLine={false}tickLine={false}/><YAxis tick={{fontSize:10}}axisLine={false}tickLine={false}allowDecimals={false}/><Tooltip contentStyle={{background:'#18181b',border:'none',borderRadius:'12px',color:'#fff',fontSize:'12px'}}cursor={{fill:'rgba(245,158,11,0.08)'}}/><Bar dataKey="count"fill="#f59e0b"radius={[6,6,0,0]}name="Activity"/></BarChart></ResponsiveContainer>}
        </div>
        <div className="card p-5">
          <h2 className="font-bold mb-1 flex items-center gap-2 text-sm"><Gem className="w-4 h-4 text-amber-500"/>Gems Done Per Project</h2>
          <p className="text-xs text-slate-400 mb-4">Total gems recorded on each recent project</p>
          {loading?<div className="h-44 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>
          :gemsPerProject.every(d=>d.gems===0)?<div className="h-44 flex flex-col items-center justify-center text-slate-400 text-sm gap-2"><Gem className="w-8 h-8 opacity-30"/>No gem data yet</div>
          :<ResponsiveContainer width="100%"height={176}><BarChart data={gemsPerProject}margin={{top:4,right:4,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3"vertical={false}opacity={0.25}/><XAxis dataKey="name"tick={{fontSize:9}}axisLine={false}tickLine={false}/><YAxis tick={{fontSize:10}}axisLine={false}tickLine={false}allowDecimals={false}/><Tooltip contentStyle={{background:'#18181b',border:'none',borderRadius:'12px',color:'#fff',fontSize:'12px'}}cursor={{fill:'rgba(124,58,237,0.08)'}}/><Bar dataKey="gems"fill="#7c3aed"radius={[6,6,0,0]}name="Gems Done"/></BarChart></ResponsiveContainer>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold flex items-center gap-2 text-sm"><FolderOpen className="w-4 h-4 text-amber-500"/>Recent Projects</h2><Link to="/projects"className="text-amber-600 text-xs font-medium flex items-center gap-1">View all<ArrowRight className="w-3 h-3"/></Link></div>
          {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i}className="h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse"/>)}</div>
          :projects.length===0?<div className="text-center py-8"><p className="text-slate-400 text-sm mb-3">No projects yet</p><Link to="/projects/new"className="btn-primary text-xs inline-flex"><Plus className="w-3.5 h-3.5"/>Create</Link></div>
          :<div className="space-y-1">{projects.slice(0,5).map(p=>(<Link key={p._id}to={`/projects/${p._id}`}className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${p.status==='completed'?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{p.setName?.charAt(0)?.toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{p.setName}</p><p className="text-xs text-slate-400">{p.givenBy} · {formatDate(p.startDate)}</p></div><span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${p.status==='ongoing'?'bg-amber-100 text-amber-700':'bg-emerald-100 text-emerald-700'}`}>{p.status}</span></Link>))}</div>}
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="font-bold flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-violet-500"/>Connections</h2><Link to="/connections"className="text-amber-600 text-xs font-medium flex items-center gap-1">View all<ArrowRight className="w-3 h-3"/></Link></div>
          {loading?<div className="space-y-3">{[1,2,3].map(i=><div key={i}className="h-14 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse"/>)}</div>
          :connections.length===0?<div className="text-center py-8"><p className="text-slate-400 text-sm mb-3">No connections yet</p><Link to="/connections/new"className="btn-primary text-xs inline-flex"><Plus className="w-3.5 h-3.5"/>Add</Link></div>
          :<div className="space-y-1">{connections.slice(0,5).map(c=>(<Link key={c._id}to={`/connections/${c._id}`}className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"><div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold shrink-0">{c.name?.charAt(0)?.toUpperCase()}</div><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{c.name}</p></div><span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${TYPE[c.type]||'bg-slate-100 text-slate-600'}`}>{c.type}</span></Link>))}</div>}
        </div>
      </div>
    </div>
  )
}