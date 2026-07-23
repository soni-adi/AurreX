import{useState}from'react'
import{Outlet,NavLink,useNavigate}from'react-router-dom'
import{LayoutDashboard,FolderOpen,Users,HelpCircle,Moon,Sun,LogOut,Menu,X,Diamond,ChevronRight,Crown,UserCheck,Briefcase}from'lucide-react'
import{useAuthStore,useThemeStore,useModeStore}from'@/store'
import api from'@/lib/axios'
import toast from'react-hot-toast'
const NAV=[{to:'/dashboard',icon:LayoutDashboard,label:'Dashboard'},{to:'/projects',icon:FolderOpen,label:'Projects'},{to:'/connections',icon:Users,label:'Connections'},{to:'/help',icon:HelpCircle,label:'Help'}]
export default function LeaderLayout(){
  const[open,setOpen]=useState(true)
  const{user,clearUser}=useAuthStore();const{dark,toggle}=useThemeStore();const{setMode}=useModeStore();const navigate=useNavigate()
  const logout=async()=>{try{await api.post('/auth/logout')}catch{}clearUser();navigate('/login');toast.success('Logged out')}
  const sw=(mode,path)=>{setMode(mode);navigate(path)}
  return(
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <aside className={`hidden md:flex flex-col transition-all duration-300 bg-zinc-900 dark:bg-black border-r border-zinc-800 ${open?'w-[220px]':'w-[60px]'}`}>
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800/60 h-[60px]">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-900/40"><Diamond className="w-4 h-4 text-white"/></div>
          {open&&<div className="flex-1 min-w-0"><p className="text-white font-black text-[15px] leading-none"style={{fontFamily:'Playfair Display,serif'}}>AurreX</p><p className="text-zinc-500 text-[11px] truncate mt-0.5">{user?.username}</p></div>}
          <button onClick={()=>setOpen(o=>!o)}className="text-zinc-600 hover:text-white ml-auto transition-colors">{open?<X className="w-4 h-4"/>:<Menu className="w-4 h-4"/>}</button>
        </div>
        {open&&<div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"><Crown className="w-3.5 h-3.5 text-amber-400 shrink-0"/><span className="text-amber-400 text-xs font-bold">Leader Mode</span></div>}
        <nav className="flex-1 p-2 space-y-0.5 mt-2 overflow-y-auto">
          {NAV.map(({to,icon:Icon,label})=>(<NavLink key={to}to={to}className={({isActive})=>`nav-item ${isActive?'nav-active':'nav-idle'}`}><Icon className="w-[18px] h-[18px] shrink-0"/>{open&&<span>{label}</span>}</NavLink>))}
        </nav>
        {open&&<div className="px-2 pb-1 space-y-0.5 border-t border-zinc-800/60 pt-2">
          <button onClick={()=>sw('staff','/staff')}className="nav-item nav-idle w-full"><UserCheck className="w-[18px] h-[18px] text-blue-400 shrink-0"/><span className="flex-1 text-left">Staff Mode</span><ChevronRight className="w-3 h-3 opacity-40"/></button>
          <button onClick={()=>sw('manager','/manager')}className="nav-item nav-idle w-full"><Briefcase className="w-[18px] h-[18px] text-violet-400 shrink-0"/><span className="flex-1 text-left">Manager Mode</span><ChevronRight className="w-3 h-3 opacity-40"/></button>
        </div>}
        <div className="p-2 border-t border-zinc-800/60 space-y-0.5">
          <button onClick={toggle}className="nav-item nav-idle w-full">{dark?<Sun className="w-[18px] h-[18px] shrink-0"/>:<Moon className="w-[18px] h-[18px] shrink-0"/>}{open&&<span>{dark?'Light':'Dark'} Mode</span>}</button>
          <button onClick={logout}className="nav-item w-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60"><LogOut className="w-[18px] h-[18px] shrink-0"/>{open&&<span>Logout</span>}</button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2"><div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center"><Diamond className="w-3.5 h-3.5 text-white"/></div><span className="text-white font-black"style={{fontFamily:'Playfair Display,serif'}}>AurreX</span><span className="badge-amber text-[10px] px-2 py-0.5">Leader</span></div>
          <div className="flex items-center gap-1">
            <button onClick={()=>sw('staff','/staff')}className="text-blue-400 text-xs px-2 py-1 rounded-lg hover:bg-zinc-800">Staff</button>
            <button onClick={()=>sw('manager','/manager')}className="text-violet-400 text-xs px-2 py-1 rounded-lg hover:bg-zinc-800">Mgr</button>
            <button onClick={toggle}className="btn-icon">{dark?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button>
            <button onClick={logout}className="btn-icon"><LogOut className="w-4 h-4"/></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0"><Outlet/></main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex z-50 safe-bottom">
          {NAV.map(({to,icon:Icon,label})=>(<NavLink key={to}to={to}className={({isActive})=>`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${isActive?'text-amber-400':'text-zinc-600'}`}><Icon className="w-[18px] h-[18px]"/><span className="text-[9px] font-semibold">{label.split(' ')[0]}</span></NavLink>))}
        </nav>
      </div>
    </div>
  )
}