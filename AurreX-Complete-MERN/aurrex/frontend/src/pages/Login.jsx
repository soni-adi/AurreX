import{useState}from'react'
import{Link,useNavigate}from'react-router-dom'
import{Diamond,Eye,EyeOff,Loader2}from'lucide-react'
import toast from'react-hot-toast'
import api from'../lib/axios'
import{useAuthStore}from'../store'
export default function Login(){
  const[form,setForm]=useState({identifier:'',password:''});const[show,setShow]=useState(false);const[loading,setLoading]=useState(false)
  const{setUser}=useAuthStore();const navigate=useNavigate()
  const submit=async(e)=>{e.preventDefault();if(!form.identifier||!form.password)return toast.error('All fields required');setLoading(true);try{const{data}=await api.post('/auth/login',form);setUser(data.user);navigate('/dashboard')}catch(err){toast.error(err.response?.data?.error||'Login failed')}finally{setLoading(false)}}
  return(
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-8"><div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg"><Diamond className="w-5 h-5 text-white"/></div><span className="text-2xl font-black text-slate-900 dark:text-white"style={{fontFamily:'Playfair Display,serif'}}>AurreX</span></div>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1><p className="text-sm text-slate-500 mb-8">Sign in to manage your jewellery business</p>
          <form onSubmit={submit}className="space-y-4">
            <div><label className="label">Username or Email</label><input className="input-base"placeholder="demo or demo@aurrex.com"value={form.identifier}onChange={e=>setForm(f=>({...f,identifier:e.target.value}))}/></div>
            <div><label className="label">Password</label><div className="relative"><input className="input-base pr-10"type={show?'text':'password'}placeholder="••••••••"value={form.password}onChange={e=>setForm(f=>({...f,password:e.target.value}))}/><button type="button"onClick={()=>setShow(!show)}className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
            <div className="flex justify-end"><Link to="/forgot-password"className="text-sm text-amber-600 font-medium">Forgot password?</Link></div>
            <button type="submit"disabled={loading}className="btn-primary w-full py-2.5">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Sign In</button>
          </form>
          <p className="text-center mt-5 text-sm text-slate-500">No account? <Link to="/signup"className="text-amber-600 font-medium">Sign up</Link></p>
          <div className="mt-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl"><p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">✦ Demo Account</p><p className="text-xs text-amber-700 dark:text-amber-400">Username: <strong>demo</strong> · Password: <strong>Demo@1234</strong></p></div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-zinc-900 to-amber-950 items-center justify-center p-12 relative overflow-hidden">
        <div className="relative text-center"><div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"><Diamond className="w-12 h-12 text-white"/></div>
          <h2 className="text-4xl font-black text-white mb-4"style={{fontFamily:'Playfair Display,serif'}}>Precision meets<br/>Elegance</h2>
          <p className="text-zinc-400 max-w-xs mx-auto leading-relaxed">Complete jewellery business management — Leader, Staff & Manager modes.</p>
        </div>
      </div>
    </div>
  )
}