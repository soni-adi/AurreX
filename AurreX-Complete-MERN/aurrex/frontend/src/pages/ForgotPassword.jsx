import{useState}from'react'
import{Link,useNavigate}from'react-router-dom'
import{Diamond,Loader2}from'lucide-react'
import toast from'react-hot-toast'
import api from'../lib/axios'
export default function ForgotPassword(){
  const[step,setStep]=useState(1);const[email,setEmail]=useState('');const[otp,setOtp]=useState('');const[pw,setPw]=useState('');const[loading,setLoading]=useState(false);const navigate=useNavigate()
  const send=async(e)=>{e.preventDefault();setLoading(true);try{await api.post('/auth/forgot-password',{email});toast.success('OTP sent');setStep(2)}catch(err){toast.error(err.response?.data?.error||'Failed')}finally{setLoading(false)}}
  const verify=async(e)=>{e.preventDefault();setLoading(true);try{await api.post('/auth/verify-reset-otp',{email,otp});setStep(3)}catch(err){toast.error(err.response?.data?.error||'Invalid OTP')}finally{setLoading(false)}}
  const reset=async(e)=>{e.preventDefault();if(pw.length<6)return toast.error('Min 6 chars');setLoading(true);try{await api.post('/auth/reset-password',{email,otp,newPassword:pw});toast.success('Reset!');navigate('/login')}catch(err){toast.error(err.response?.data?.error||'Failed')}finally{setLoading(false)}}
  return(
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8"><div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center"><Diamond className="w-5 h-5 text-white"/></div><span className="text-2xl font-black"style={{fontFamily:'Playfair Display,serif'}}>AurreX</span></div>
        {step===1&&<><h1 className="text-2xl font-bold mb-6">Forgot password?</h1><form onSubmit={send}className="space-y-4"><input className="input-base"type="email"value={email}onChange={e=>setEmail(e.target.value)}/><button type="submit"disabled={loading}className="btn-primary w-full py-2.5">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Send OTP</button></form></>}
        {step===2&&<><h1 className="text-2xl font-bold mb-6">Enter OTP</h1><form onSubmit={verify}className="space-y-4"><input className="input-base text-center text-2xl tracking-[0.5em] font-mono"maxLength={6}value={otp}onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/><button type="submit"disabled={loading}className="btn-primary w-full py-2.5">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Verify</button></form></>}
        {step===3&&<><h1 className="text-2xl font-bold mb-6">New Password</h1><form onSubmit={reset}className="space-y-4"><input className="input-base"type="password"value={pw}onChange={e=>setPw(e.target.value)}/><button type="submit"disabled={loading}className="btn-primary w-full py-2.5">{loading&&<Loader2 className="w-4 h-4 animate-spin"/>}Reset</button></form></>}
        <p className="text-center mt-5 text-sm"><Link to="/login"className="text-amber-600 font-medium">Back to Login</Link></p>
      </div>
    </div>
  )
}