import axios from'axios'
const BASE=import.meta.env.VITE_API_URL||''
const api=axios.create({baseURL:BASE+'/api',withCredentials:true})
let refreshing=false,queue=[]
const flush=err=>{queue.forEach(p=>err?p.reject(err):p.resolve());queue=[]}
api.interceptors.response.use(r=>r,async err=>{
  const orig=err.config
  if(err.response?.status===401&&err.response?.data?.code==='TOKEN_EXPIRED'&&!orig._retry){
    if(refreshing)return new Promise((res,rej)=>queue.push({resolve:res,reject:rej})).then(()=>api(orig))
    orig._retry=true;refreshing=true
    try{
      await axios.post(BASE+'/api/auth/refresh',{},{withCredentials:true})
      flush(null);return api(orig)
    }catch(e){flush(e);window.dispatchEvent(new Event('auth:logout'));return Promise.reject(e)}
    finally{refreshing=false}
  }
  return Promise.reject(err)
})
export default api
