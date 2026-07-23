import{useState}from'react'
import{Link,useNavigate}from'react-router-dom'
import{Diamond,Eye,EyeOff,Loader2}from'lucide-react'
import toast from'react-hot-toast'
import api from'../lib/axios'
import{useAuthStore}from'../store'
export default function Signup(){
  const[step,setStep]=useState(1);const[form,setForm]=useState({username:'',email:'',password:''});const[otp,setOtp]=useState('');const[show,setShow]=useState(false);const[loading,setLoading]=useState(false)
  const{setUser}=useAuthStore();const navigate=useNavigate()
  const signup=async(e)=>{e.preventDefault();if(!form.username||!form.email||!form.password)return toast.error('All fields required');if(form.password.length<6)return toast.error('Min 6 chars');setLoading(true);try{await api.post('/auth/signup',form);toast.success('OTP sent!');setStep(2)}catch(err){toast.error(err.response?.data?.error||'Failed')}finally{setLoading(false)}}
  const verify=async(e)=>{e.preventDefault();if(!otp)return toast.error('Enter OTP');setLoading(true);try{const{data}=await api.post('/auth/verify-otp',{email:form.email,otp});setUser(data.user);navigate('/dashboard')}catch(err){toast.error(err.response?.data?.error||'Invalid OTP')}finally{setLoading(false)}}
  return(
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8"><div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center"><Diamond className="w-5 h-5 text-white"/></div><span className="text-2xl font-black"style={{fontFamily:'Playfair Display,serif'}}>AurreX</span></div>
        {step===1?(<><h1 className="text-2xl font-bold mb-1">Create account</h1><p className="text-sm text-slate-500 mb-8">Join AurreX</p>
        <form onSubmit={signup}className="space-y-4">
          <div><label className="label">Username</label><input className="input-base"value={form.username}onChange={e=>setForm(f=>({...f,username:e.target.value}))}/></div>
          <div><label className="label">Email</label><input className="input-base"type="email"value={form.email}onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div><label className="label">Password</label><div className="relative"><input className="input-base pr-10"type={show?'text':'password'}value={form.password}onChange={e=>setForm(f=>({...f,password:e.target.value}))}/><button type="button"onClick={()=>setShow(!show)}className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
          <button type="submit"disabled={loading}className="btn-primary w-full py-2.5">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Create Account</button>
        </form></>):(<><h1 className="text-2xl font-bold mb-1">Verify email</h1><p className="text-sm text-slate-500 mb-2">OTP sent to <strong>{form.email}</strong></p><p className="text-xs text-amber-600 mb-8">Check server console if email not configured</p>
        <form onSubmit={verify}className="space-y-4"><input className="input-base text-center text-2xl tracking-[0.5em] font-mono"maxLength={6}value={otp}onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/><button type="submit"disabled={loading}className="btn-primary w-full py-2.5">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Verify</button><button type="button"onClick={()=>setStep(1)}className="btn-secondary w-full">Back</button></form></>)}
        <p className="text-center mt-5 text-sm text-slate-500">Have an account? <Link to="/login"className="text-amber-600 font-medium">Sign in</Link></p>
      </div>
    </div>
  )
}