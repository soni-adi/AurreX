import axios from 'axios'
const api = axios.create({ baseURL:'/api', withCredentials:true })
let ref=false,q=[]
const flush=e=>{q.forEach(p=>e?p.reject(e):p.resolve());q=[]}
api.interceptors.response.use(r=>r,async err=>{
  const orig=err.config
  if(err.response?.status===401&&err.response?.data?.code==='TOKEN_EXPIRED'&&!orig._retry){
    if(ref) return new Promise((rs,rj)=>q.push({resolve:rs,reject:rj})).then(()=>api(orig)).catch(Promise.reject)
    orig._retry=true;ref=true
    try{await axios.post('/api/auth/refresh',{},{withCredentials:true});flush(null);return api(orig)}
    catch(e){flush(e);window.dispatchEvent(new Event('auth:logout'));return Promise.reject(e)}
    finally{ref=false}
  }
  return Promise.reject(err)
})
export default api