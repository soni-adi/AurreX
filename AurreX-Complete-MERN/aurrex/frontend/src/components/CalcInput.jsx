import{useState,useEffect,useRef}from'react'
import{safeEval}from'../lib/utils'
export default function CalcInput({value,onChange,className='',disabled=false,placeholder='0',...props}){
  const[disp,setDisp]=useState(value===0?'':String(value))
  const[lastExpr,setLastExpr]=useState(null)
  const[showTip,setShowTip]=useState(false)
  const focused=useRef(false)
  useEffect(()=>{if(!focused.current)setDisp(value===0?'':String(value))},[value])
  const handleFocus=()=>{focused.current=true;if(parseFloat(disp)===0||disp==='')setDisp('')}
  const handleChange=e=>{const raw=e.target.value;setDisp(raw);const p=parseFloat(raw);if(!isNaN(p))onChange(p);else onChange(0)}
  const handleBlur=()=>{focused.current=false;const result=safeEval(disp);if(result!==null){setLastExpr({expr:disp,result});setDisp(String(result));onChange(result)}else{const p=parseFloat(disp);if(!isNaN(p)){setDisp(String(p));onChange(p)}else{setDisp('');onChange(0)}}}
  const hasExpr=lastExpr&&lastExpr.expr!==String(value)
  return(<div className="relative"onMouseEnter={()=>hasExpr&&setShowTip(true)}onMouseLeave={()=>setShowTip(false)}>
    <input type="text"inputMode="decimal"className={`${className}${hasExpr?' border-amber-400 dark:border-amber-500':''}`}disabled={disabled}placeholder={placeholder}value={disp}onFocus={handleFocus}onChange={handleChange}onBlur={handleBlur}{...props}/>
    {showTip&&lastExpr&&(<div className="calc-tooltip"><span className="text-amber-300">{lastExpr.expr}</span><span className="text-slate-400 mx-1">=</span><span className="font-bold">{lastExpr.result}</span></div>)}
  </div>)
}