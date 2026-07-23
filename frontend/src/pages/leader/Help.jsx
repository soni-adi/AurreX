import{useState}from'react'
import{ChevronDown,ChevronUp,Diamond,Crown,UserCheck,Users}from'lucide-react'
const FAQS=[
  {q:'What is AurreX?',a:'AurreX is a complete jewellery business management app with three modes: Leader (full access), Staff (gem work tracking), and Manager (sets & payments).'},
  {q:'How does Gold in Box work?',a:'Gold in Box = Total Added + Gold Received (Pakal) − Total Removed − Gold Given (Pakal). Shows negative warning if value goes below zero.'},
  {q:'What is the new Gold Used Without Wastage formula?',a:'Gold Used Without Wastage = Sum of Pakal Gold Used (WT Before − WT After per row) − Sum of Tachhi Tach. This is more accurate than the old formula.'},
  {q:'What is the Gold Used (auto) column in Pakal?',a:'Gold Used auto = WT Before − WT After. It auto-calculates how much gold was consumed in that Pakal row.'},
  {q:'How does the Gem Count modal work?',a:'When you mark a project as Completed, AurreX asks you to enter how many PAKAI and TACHHI gems were used, plus any custom types. This powers the dashboard pie chart.'},
  {q:'What is Bill Print in PDF?',a:'Bill Print exports a clean summary with only the grand total — set names, total gems, and total payment per section. Great for giving to clients.'},
  {q:'What is a Payment connection?',a:'A Payment connection tracks simple money exchanges — Payment Given and Payment Received with amount, note, and date. Available in all modes.'},
  {q:'How does CalcInput work?',a:'All number inputs support math expressions. Type "5+3" or "10*2.5" and press Tab/Enter — it auto-calculates. Hover over a cell that was calculated to see the original expression.'},
  {q:'How do I switch between modes?',a:'Click "Staff Mode" or "Manager Mode" in the sidebar (desktop) or use the mode buttons in the mobile header.'},
]
function FAQ({q,a}){const[open,setOpen]=useState(false);return(<div className="border border-slate-200 dark:border-zinc-700 rounded-2xl overflow-hidden"><button onClick={()=>setOpen(o=>!o)}className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"><span className="font-semibold text-sm pr-4">{q}</span>{open?<ChevronUp className="w-4 h-4 text-slate-400 shrink-0"/>:<ChevronDown className="w-4 h-4 text-slate-400 shrink-0"/>}</button>{open&&<div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800 pt-3">{a}</div>}</div>)}
export default function LeaderHelp(){
  return(
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-8"><h1 className="page-title"style={{fontFamily:'Playfair Display,serif'}}>Help & Support</h1><p className="page-sub">AurreX — Complete Jewellery Management</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[{icon:Crown,c:'amber',t:'Leader Mode',d:'Full projects, connections, gold tracking, PDF export.'},{icon:UserCheck,c:'blue',t:'Staff Mode',d:'Track gem work and payments from your boss.'},{icon:Users,c:'violet',t:'Manager Mode',d:'Manage sets with gem tables and staff connections.'}].map(({icon:Icon,c,t,d})=>(<div key={t}className="card p-5"><div className={`w-10 h-10 bg-${c}-100 dark:bg-${c}-900/20 rounded-xl flex items-center justify-center mb-3`}><Icon className={`w-5 h-5 text-${c}-600 dark:text-${c}-400`}/></div><h3 className="font-bold text-sm mb-1">{t}</h3><p className="text-xs text-slate-500 leading-relaxed">{d}</p></div>))}
      </div>
      <div className="summary-box mb-8"><div className="flex items-center gap-2 mb-3"><Diamond className="w-4 h-4 text-amber-600"/><h3 className="font-bold text-amber-800 dark:text-amber-300">Demo Account</h3></div><div className="grid grid-cols-3 gap-4">{[['Username','demo'],['Password','Demo@1234'],['Email','demo@aurrex.com']].map(([k,v])=>(<div key={k}><p className="text-xs text-amber-700 dark:text-amber-400">{k}</p><p className="font-mono font-bold text-amber-900 dark:text-amber-200 text-sm">{v}</p></div>))}</div></div>
      <h2 className="text-xl font-bold mb-4">FAQ</h2>
      <div className="space-y-3">{FAQS.map((f,i)=><FAQ key={i}q={f.q}a={f.a}/>)}</div>
      <div className="mt-8 text-center text-slate-400 text-xs">AurreX v1.0.0 — Built for jewellery craftsmen</div>
    </div>
  )
}