import{Outlet,NavLink,useNavigate}from'react-router-dom'
import{LayoutDashboard,Users,HelpCircle,Moon,Sun,LogOut,Diamond,ChevronRight,Crown,Briefcase}from'lucide-react'
import{useAuthStore,useThemeStore,useModeStore}from'@/store'
import api from'@/lib/axios'
import toast from'react-hot-toast'
const NAV=[{to:'/staff',icon:LayoutDashboard,label:'Dashboard',exact:true},{to:'/staff/connections',icon:Users,label:'My Bosses'},{to:'/staff/help',icon:HelpCircle,label:'Help'}]
export default function StaffLayout(){
  const{user,clearUser}=useAuthStore();const{dark,toggle}=useThemeStore();const{setMode}=useModeStore();const navigate=useNavigate()
  const logout=async()=>{try{await api.post('/auth/logout')}catch{}clearUser();navigate('/login');toast.success('Logged out')}
  const sw=(mode,path)=>{setMode(mode);navigate(path)}
  return(
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <aside className="hidden md:flex flex-col w-[220px] bg-slate-900 dark:bg-zinc-950 border-r border-slate-800 dark:border-zinc-800">
        <div className="flex items-center gap-3 p-4 border-b border-slate-800/60 h-[60px]"><div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40"><Diamond className="w-4 h-4 text-white"/></div><div><p className="text-white font-black text-[15px] leading-none"style={{fontFamily:'Playfair Display,serif'}}>AurreX</p><p className="text-slate-500 text-[11px] mt-0.5">{user?.username}</p></div></div>
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0"/><span className="text-blue-400 text-xs font-bold">Staff Mode</span></div>
        <nav className="flex-1 p-2 space-y-0.5 mt-2">{NAV.map(({to,icon:Icon,label,exact})=>(<NavLink key={to}to={to}end={exact}className={({isActive})=>`nav-item ${isActive?'nav-active-blue':'nav-idle-blue'}`}><Icon className="w-[18px] h-[18px] shrink-0"/><span>{label}</span></NavLink>))}</nav>
        <div className="px-2 pb-1 space-y-0.5 border-t border-slate-800/60 pt-2">
          <button onClick={()=>sw('leader','/dashboard')}className="nav-item nav-idle-blue w-full"><Crown className="w-4 h-4 text-amber-400"/><span className="flex-1 text-left">Leader Mode</span><ChevronRight className="w-3 h-3 opacity-40"/></button>
          <button onClick={()=>sw('manager','/manager')}className="nav-item nav-idle-blue w-full"><Users className="w-4 h-4 text-violet-400"/><span className="flex-1 text-left">Manager Mode</span><ChevronRight className="w-3 h-3 opacity-40"/></button>
        </div>
        <div className="p-2 border-t border-slate-800/60 space-y-0.5">
          <button onClick={toggle}className="nav-item nav-idle-blue w-full">{dark?<Sun className="w-[18px] h-[18px] shrink-0"/>:<Moon className="w-[18px] h-[18px] shrink-0"/>}<span>{dark?'Light':'Dark'} Mode</span></button>
          <button onClick={logout}className="nav-item w-full text-slate-400 hover:text-red-400 hover:bg-slate-800/60"><LogOut className="w-[18px] h-[18px] shrink-0"/><span>Logout</span></button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2"><div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><Diamond className="w-3.5 h-3.5 text-white"/></div><span className="text-white font-black"style={{fontFamily:'Playfair Display,serif'}}>AurreX</span><span className="badge-blue text-[10px] px-2 py-0.5">Staff</span></div>
          <div className="flex items-center gap-1"><button onClick={()=>sw('leader','/dashboard')}className="text-amber-400 text-xs px-2 py-1 rounded-lg hover:bg-slate-800">Leader</button><button onClick={toggle}className="btn-icon">{dark?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button><button onClick={logout}className="btn-icon"><LogOut className="w-4 h-4"/></button></div>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0"><Outlet/></main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex z-50">
          {NAV.map(({to,icon:Icon,label,exact})=>(<NavLink key={to}to={to}end={exact}className={({isActive})=>`flex-1 flex flex-col items-center py-2.5 gap-0.5 ${isActive?'text-blue-400':'text-slate-600'}`}><Icon className="w-[18px] h-[18px]"/><span className="text-[9px] font-semibold">{label.split(' ')[0]}</span></NavLink>))}
        </nav>
      </div>
    </div>
  )
}