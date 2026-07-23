import{useEffect,useState}from'react'
import{Link}from'react-router-dom'
import{Gem,IndianRupee,TrendingUp,Briefcase,Calendar,AlertCircle}from'lucide-react'
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,ReferenceLine,CartesianGrid}from'recharts'
import api from'@/lib/axios'
import{useAuthStore}from'@/store'
import{n,fmt}from'@/lib/utils'

export default function StaffDashboard(){
  const{user}=useAuthStore()
  const[conns,setConns]=useState([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{api.get('/connections?connectionMode=staff').then(({data})=>setConns(data.connections||[])).catch(()=>{}).finally(()=>setLoading(false))},[])

  // Flatten all gem entries across all boss connections
  const allGemEntries=conns.flatMap(c=>(c.gemEntry||[]).map(g=>({...g,boss:c.name})))
  const allPayEntries=conns.flatMap(c=>(c.staffPaymentEntry||[]).map(p=>({...p,boss:c.name})))

  const totalGemWork=allGemEntries.reduce((s,r)=>s+n(r.amount),0)
  const totalReceived=allPayEntries.reduce((s,r)=>s+n(r.amount),0)
  const totalGemCount=allGemEntries.reduce((s,r)=>s+n(r.gem),0)
  // Balance = Gem Work − Received. Negative means staff was paid more than they earned (overpaid).
  const balance=totalGemWork-totalReceived

  // Monthly aggregation (last 6 months) of gem count
  const now=new Date()
  const months=[]
  for(let i=5;i>=0;i--){ const d=new Date(now.getFullYear(),now.getMonth()-i,1); months.push(d.toLocaleString('en',{month:'short',year:'2-digit'})) }
  const monthlyMap={}; months.forEach(m=>monthlyMap[m]=0)
  allGemEntries.forEach(g=>{
    if(!g.date)return
    const d=new Date(g.date)
    const key=d.toLocaleString('en',{month:'short',year:'2-digit'})
    if(monthlyMap[key]!==undefined) monthlyMap[key]+=n(g.gem)
  })
  const chartData=months.map(m=>({month:m,gems:monthlyMap[m]}))
  const monthsWithData=chartData.filter(d=>d.gems>0).length||1
  const avgPerMonth=chartData.reduce((s,d)=>s+d.gems,0)/monthsWithData

  const Stat=({icon:Icon,label,val,color})=>(
    <div className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${color}`}><Icon className="w-5 h-5"/></div>
      <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p><p className="text-xl font-bold">{loading?'—':val}</p></div>
    </div>
  )

  return(
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-md"><Briefcase className="w-5 h-5 text-white"/></div>
          <div><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>Staff Dashboard</h1><p className="text-sm text-slate-500">Welcome back, <span className="text-blue-600 dark:text-blue-400 font-semibold">{user?.username}</span></p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Gem}label="Total Gems Done"val={totalGemCount}color="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"/>
        <Stat icon={IndianRupee}label="Total Gem Work"val={'Rs.'+fmt(totalGemWork)}color="bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"/>
        <Stat icon={IndianRupee}label="Total Received"val={'Rs.'+fmt(totalReceived)}color="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"/>
        <div className={`card p-5 flex items-center gap-3 hover:shadow-md transition-shadow border-2 ${balance<0?'border-red-300 dark:border-red-700':'border-transparent'}`}>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${balance<0?'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800':'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'}`}>{balance<0?<AlertCircle className="w-5 h-5"/>:<TrendingUp className="w-5 h-5"/>}</div>
          <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Balance</p><p className={`text-xl font-bold ${balance<0?'text-red-600 dark:text-red-400':''}`}>{loading?'—':'Rs.'+fmt(balance)}</p></div>
        </div>
      </div>

      {balance<0&&!loading&&(
        <div className="danger-box mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5"/>
          <div><p className="font-bold text-red-700 dark:text-red-400 text-sm mb-0.5">You've been paid more than your gem work</p><p className="text-xs text-red-600 dark:text-red-400">Total received exceeds total gem work by Rs.{fmt(Math.abs(balance))}. Talk to your boss to settle the difference.</p></div>
        </div>
      )}

      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-blue-500"/>Monthly Gem Count (last 6 months)</h2>
          <span className="text-xs text-slate-400">Avg: <strong className="text-blue-600 dark:text-blue-400">{fmt(avgPerMonth,1)}</strong>/mo</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Number of gems logged per month across all bosses</p>
        {loading?<div className="h-48 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>
        :<ResponsiveContainer width="100%"height={200}>
          <BarChart data={chartData}margin={{top:4,right:4,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3"stroke="#e5e7eb"vertical={false}opacity={0.3}/>
            <XAxis dataKey="month"tick={{fontSize:11}}axisLine={false}tickLine={false}/>
            <YAxis tick={{fontSize:11}}axisLine={false}tickLine={false}allowDecimals={false}/>
            <Tooltip contentStyle={{background:'#18181b',border:'none',borderRadius:'12px',color:'#fff',fontSize:'12px'}}cursor={{fill:'rgba(59,130,246,0.08)'}}/>
            <ReferenceLine y={avgPerMonth}stroke="#f59e0b"strokeDasharray="4 4"label={{value:'Avg',position:'right',fontSize:10,fill:'#f59e0b'}}/>
            <Bar dataKey="gems"fill="#3b82f6"radius={[6,6,0,0]}name="Gems Done"/>
          </BarChart>
        </ResponsiveContainer>}
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2 text-sm"><Gem className="w-4 h-4 text-blue-500"/>Gem Work by Boss</h2>
        {loading?<div className="h-40 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse"/>
        :conns.length===0?<div className="h-40 flex items-center justify-center text-slate-400 text-sm">No boss connections yet</div>
        :<ResponsiveContainer width="100%"height={160}>
          <BarChart data={conns.map(c=>({name:c.name,gems:(c.gemEntry||[]).reduce((s,r)=>s+n(r.gem),0)}))}margin={{top:4,right:4,left:-20,bottom:0}}>
            <XAxis dataKey="name"tick={{fontSize:10}}axisLine={false}tickLine={false}/>
            <YAxis tick={{fontSize:10}}axisLine={false}tickLine={false}allowDecimals={false}/>
            <Tooltip contentStyle={{background:'#18181b',border:'none',borderRadius:'12px',color:'#fff',fontSize:'12px'}}cursor={{fill:'rgba(59,130,246,0.08)'}}/>
            <Bar dataKey="gems"fill="#6366f1"radius={[6,6,0,0]}name="Gems"/>
          </BarChart>
        </ResponsiveContainer>}
      </div>
    </div>
  )
}