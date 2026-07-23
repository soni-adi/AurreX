import{Outlet,NavLink,useNavigate}from'react-router-dom'
import{LayoutDashboard,Package,Users,Moon,Sun,LogOut,Diamond,ChevronRight,Crown,Briefcase}from'lucide-react'
import{useAuthStore,useThemeStore,useModeStore}from'../store'
import api from'../lib/axios'
import toast from'react-hot-toast'
const NAV=[{to:'/manager',icon:LayoutDashboard,label:'Dashboard',exact:true},{to:'/manager/sets',icon:Package,label:'Sets'},{to:'/manager/connections',icon:Users,label:'Connections'}]
export default function ManagerLayout(){
  const{user,clearUser}=useAuthStore();const{dark,toggle}=useThemeStore();const{setMode}=useModeStore();const navigate=useNavigate()
  const logout=async()=>{try{await api.post('/auth/logout')}catch{}clearUser();navigate('/login');toast.success('Logged out')}
  const sw=(mode,path)=>{setMode(mode);navigate(path)}
  return(
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <aside className="hidden md:flex flex-col w-60 bg-violet-950 dark:bg-zinc-950 border-r border-violet-900 dark:border-zinc-800">
        <div className="flex items-center gap-3 p-4 border-b border-violet-900/60 h-16"><div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center shrink-0"><Diamond className="w-4 h-4 text-white"/></div><div><p className="text-white font-black text-base leading-none"style={{fontFamily:'Playfair Display,serif'}}>AurreX</p><p className="text-violet-300 text-xs">{user?.username}</p></div></div>
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center gap-2"><Users className="w-3.5 h-3.5 text-violet-300"/><span className="text-violet-300 text-xs font-bold">Manager Mode</span></div>
        <nav className="flex-1 p-2 space-y-0.5 mt-2">{NAV.map(({to,icon:Icon,label,exact})=>(<NavLink key={to}to={to}end={exact}className={({isActive})=>`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive?'bg-violet-600 text-white':'text-violet-300 hover:text-white hover:bg-violet-800/50'}`}><Icon className="w-5 h-5 shrink-0"/><span className="text-sm font-medium">{label}</span></NavLink>))}</nav>
        <div className="px-3 pb-1 space-y-0.5">
          <button onClick={()=>sw('leader','/dashboard')}className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full text-violet-300 hover:text-white hover:bg-violet-800/50 transition-all"><Crown className="w-4 h-4 text-amber-400"/><span className="text-sm flex-1 text-left">Leader Mode</span><ChevronRight className="w-3.5 h-3.5 opacity-50"/></button>
          <button onClick={()=>sw('staff','/staff')}className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full text-violet-300 hover:text-white hover:bg-violet-800/50 transition-all"><Briefcase className="w-4 h-4 text-blue-400"/><span className="text-sm flex-1 text-left">Staff Mode</span><ChevronRight className="w-3.5 h-3.5 opacity-50"/></button>
        </div>
        <div className="p-2 border-t border-violet-900/60 space-y-0.5">
          <button onClick={toggle}className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-violet-300 hover:text-white hover:bg-violet-800/50 transition-all">{dark?<Sun className="w-5 h-5"/>:<Moon className="w-5 h-5"/>}<span className="text-sm">{dark?'Light':'Dark'} Mode</span></button>
          <button onClick={logout}className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-violet-300 hover:text-red-400 hover:bg-violet-800/50 transition-all"><LogOut className="w-5 h-5"/><span className="text-sm">Logout</span></button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-violet-950 border-b border-violet-900 shrink-0">
          <div className="flex items-center gap-2"><div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center"><Diamond className="w-3.5 h-3.5 text-white"/></div><span className="text-white font-black"style={{fontFamily:'Playfair Display,serif'}}>AurreX</span><span className="text-violet-300 text-xs font-bold bg-violet-500/10 px-2 py-0.5 rounded-full">Manager</span></div>
          <div className="flex items-center gap-1"><button onClick={()=>sw('leader','/dashboard')}className="text-amber-400 text-xs px-2 py-1 rounded-lg">Leader</button><button onClick={toggle}className="text-violet-300 p-2">{dark?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button><button onClick={logout}className="text-violet-300 p-2"><LogOut className="w-4 h-4"/></button></div>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0"><Outlet/></main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-violet-950 border-t border-violet-900 flex z-50">{NAV.map(({to,icon:Icon,label,exact})=>(<NavLink key={to}to={to}end={exact}className={({isActive})=>`flex-1 flex flex-col items-center py-2 ${isActive?'text-violet-300':'text-violet-600'}`}><Icon className="w-5 h-5 mb-0.5"/><span className="text-[10px]">{label}</span></NavLink>))}</nav>
      </div>
    </div>
  )
}