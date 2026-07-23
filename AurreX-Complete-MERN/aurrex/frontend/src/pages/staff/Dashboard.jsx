import{useEffect,useState}from'react'
import{Link}from'react-router-dom'
import{Users,Plus,TrendingUp,Briefcase}from'lucide-react'
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from'recharts'
import api from'../../lib/axios'
import{useAuthStore}from'../../store'
import{n,fmt}from'../../lib/utils'
export default function StaffDashboard(){
  const{user}=useAuthStore()
  const[conns,setConns]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{api.get('/connections?connectionMode=staff').then(({data})=>setConns(data.connections||[])).catch(()=>{}).finally(()=>setLoading(false))},[])
  const totalGemWork=conns.reduce((s,c)=>s+(c.gemEntry||[]).reduce((s2,r)=>s2+n(r.amount),0),0)
  const totalReceived=conns.reduce((s,c)=>s+(c.staffPaymentEntry||[]).reduce((s2,r)=>s2+n(r.amount),0),0)
  const balance=totalReceived-totalGemWork
  const chartData=conns.map(c=>({name:c.name,gemWork:(c.gemEntry||[]).reduce((s,r)=>s+n(r.amount),0)}))
  return(
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-7"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center"><Briefcase className="w-5 h-5 text-white"/></div><div><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>Staff Dashboard</h1><p className="text-sm text-slate-500">Welcome, {user?.username}</p></div></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="staff-box"><p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total Gem Work</p><p className="text-2xl font-bold">Rs.{loading?'—':fmt(totalGemWork)}</p></div>
        <div className="staff-box"><p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total Received</p><p className="text-2xl font-bold text-emerald-600">Rs.{loading?'—':fmt(totalReceived)}</p></div>
        <div className={`rounded-2xl p-5 border ${balance>=0?'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800':'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><p className="text-xs font-medium mb-1">Balance</p><p className={`text-2xl font-bold ${balance>=0?'text-emerald-700':'text-red-600'}`}>Rs.{loading?'—':fmt(balance)}</p></div>
      </div>
      <div className="card p-5 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-blue-500"/>Gem Work by Boss</h2>
        {loading?<div className="h-44 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>
        :chartData.length===0?<div className="h-44 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
        :<ResponsiveContainer width="100%"height={180}><BarChart data={chartData}margin={{top:4,right:4,left:-20,bottom:0}}><XAxis dataKey="name"tick={{fontSize:10}}axisLine={false}tickLine={false}/><YAxis tick={{fontSize:10}}axisLine={false}tickLine={false}/><Tooltip contentStyle={{background:'#18181b',border:'none',borderRadius:'12px',color:'#fff',fontSize:'12px'}}cursor={{fill:'rgba(59,130,246,0.08)'}}/><Bar dataKey="gemWork"fill="#3b82f6"radius={[6,6,0,0]}/></BarChart></ResponsiveContainer>}
      </div>
      <Link to="/staff/connections/new"className="btn-blue inline-flex"><Plus className="w-4 h-4"/>Add Boss Connection</Link>
    </div>
  )
}