export const n=(v,d=0)=>{const x=parseFloat(v);return isNaN(x)?d:x}
export const fmt=(v,dp=2)=>n(v,0).toFixed(dp)
export const today=()=>new Date().toISOString().split('T')[0]
export const plusDays=(d)=>{const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString().split('T')[0]}
export const formatDate=s=>{if(!s)return'-';try{return new Date(s).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}catch{return s}}
export const cls=(...a)=>a.filter(Boolean).join(' ')
export const safeEval=(expr)=>{try{const c=expr.trim();if(!c)return null;if(!/^[\d\s\+\-\*\/\.\(\)]+$/.test(c))return null;if(!/[\+\-\*\/]/.test(c))return null;const r=Function('"use strict";return('+c+')')();if(typeof r!=='number'||!isFinite(r))return null;return Math.round(r*10000)/10000}catch{return null}}