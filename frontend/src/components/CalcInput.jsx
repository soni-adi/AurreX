import{useState,useEffect,useRef}from'react'
import{safeEval}from'@/lib/utils'
export default function CalcInput({value,onChange,className='',disabled=false,placeholder='0',...props}){
  const[disp,setDisp]=useState(value===0?'':String(value))
  const[lastExpr,setLastExpr]=useState(null)
  const[tip,setTip]=useState(false)
  const focused=useRef(false)
  useEffect(()=>{if(!focused.current)setDisp(value===0?'':String(value))},[value])
  const onFocus=()=>{focused.current=true;if(parseFloat(disp)===0||disp==='')setDisp('')}
  const onChange_=e=>{const r=e.target.value;setDisp(r);const p=parseFloat(r);onChange(isNaN(p)?0:p)}
  const onBlur=()=>{
    focused.current=false
    const r=safeEval(disp)
    if(r!==null){setLastExpr({expr:disp,result:r});setDisp(String(r));onChange(r)}
    else{const p=parseFloat(disp);if(!isNaN(p)){setDisp(String(p));onChange(p)}else{setDisp('');onChange(0)}}
  }
  const hasCalc=lastExpr&&lastExpr.expr!==String(value)
  return(
    <div className="relative"onMouseEnter={()=>hasCalc&&setTip(true)}onMouseLeave={()=>setTip(false)}>
      <input type="text"inputMode="decimal"
        className={`${className}${hasCalc?' ring-1 ring-amber-400/60':''}`}
        disabled={disabled}placeholder={placeholder}value={disp}
        onFocus={onFocus}onChange={onChange_}onBlur={onBlur}{...props}/>
      {tip&&lastExpr&&<div className="calc-tooltip"><span className="text-amber-300">{lastExpr.expr}</span><span className="text-zinc-400 mx-1.5">=</span><span className="font-bold">{lastExpr.result}</span></div>}
    </div>
  )
}
