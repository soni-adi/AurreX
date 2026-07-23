import{useEffect,useState}from'react'
import{Link}from'react-router-dom'
import{Package,Users,Plus,TrendingUp}from'lucide-react'
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from'recharts'
import api from'../../lib/axios'
import{useAuthStore}from'../../store'
import{n,fmt,formatDate}from'../../lib/utils'
export default function ManagerDashboard(){
  const{user}=useAuthStore()
  const[sets,setSets]=useState([]);const[conns,setConns]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{Promise.all([api.get('/sets'),api.get('/connections?connectionMode=manager')]).then(([s,c])=>{setSets(s.data.sets||[]);setConns(c.data.connections||[])}).catch(()=>{}).finally(()=>setLoading(false))},[])
  const totalPay=sets.reduce((sum,s)=>sum+(s.gemTable||[]).reduce((s2,r)=>s2+(n(r.totalGems)*n(r.pricePerGem))+n(r.gemPrice),0),0)
  const chartData=sets.slice(0,8).map(s=>({name:s.setName,pay:(s.gemTable||[]).reduce((s2,r)=>s2+(n(r.totalGems)*n(r.pricePerGem))+n(r.gemPrice),0)}))
  return(
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-7"><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>Manager Dashboard</h1><p className="text-sm text-slate-500">Welcome, {user?.username}</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="manager-box"><p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Total Sets</p><p className="text-2xl font-bold">{loading?'—':sets.length}</p></div>
        <div className="manager-box"><p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Connections</p><p className="text-2xl font-bold">{loading?'—':conns.length}</p></div>
        <div className="manager-box"><p className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Total Payment</p><p className="text-2xl font-bold">Rs.{loading?'—':fmt(totalPay)}</p></div>
      </div>
      <div className="card p-5 mb-6"><h2 className="font-bold mb-4 flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-violet-500"/>Payment by Set</h2>
        {loading?<div className="h-44 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>
        :chartData.length===0?<div className="h-44 flex items-center justify-center text-slate-400 text-sm">No sets yet</div>
        :<ResponsiveContainer width="100%"height={180}><BarChart data={chartData}margin={{top:4,right:4,left:-20,bottom:0}}><XAxis dataKey="name"tick={{fontSize:10}}axisLine={false}tickLine={false}/><YAxis tick={{fontSize:10}}axisLine={false}tickLine={false}/><Tooltip contentStyle={{background:'#18181b',border:'none',borderRadius:'12px',color:'#fff',fontSize:'12px'}}cursor={{fill:'rgba(124,58,237,0.08)'}}/><Bar dataKey="pay"fill="#7c3aed"radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/manager/sets/new"className="btn-violet"><Plus className="w-4 h-4"/>New Set</Link>
        <Link to="/manager/connections/new"className="btn-secondary"><Plus className="w-4 h-4"/>New Connection</Link>
      </div>
    </div>
  )
}