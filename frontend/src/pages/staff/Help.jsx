import{Diamond,Briefcase,Info}from'lucide-react'
export default function StaffHelp(){
  return(
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-8"><h1 className="text-2xl font-bold"style={{fontFamily:'Playfair Display,serif'}}>Help — Staff Mode</h1></div>
      <div className="space-y-4">
        {[{icon:Briefcase,t:'What is Staff Mode?',b:'A simplified view for gem-setting workers. Track your boss connections — gem work and payments received.'},{icon:Info,t:'Adding a Boss',b:'Click "Add Boss", enter their name, then add Gem Entry and Payment Entry rows.'},{icon:Diamond,t:'Gem Entry',b:'Set Name, Gems, Price per Gem. Amount auto-calculates (Gems × Price).'},{icon:Info,t:'Account Summary',b:'Balance = Received − Gem Work. Positive = boss owes you.'}].map(({icon:Icon,t,b})=>(<div key={t}className="card p-5"><div className="flex items-start gap-3"><div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-blue-600"/></div><div><h3 className="font-bold text-sm mb-1">{t}</h3><p className="text-xs text-slate-500 leading-relaxed">{b}</p></div></div></div>))}
      </div>
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl"><p className="text-xs text-blue-700 dark:text-blue-400 font-bold mb-1">Demo Account</p><p className="text-xs text-blue-600 dark:text-blue-400">Username: <strong>demo</strong> · Password: <strong>Demo@1234</strong></p></div>
    </div>
  )
}