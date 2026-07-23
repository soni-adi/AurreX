import{useState,useEffect,useRef}from'react'
export default function NumInput({value,onChange,className='',disabled=false,placeholder='0',...props}){
  const[disp,setDisp]=useState(value===0?'':String(value))
  const focused=useRef(false)
  useEffect(()=>{if(!focused.current)setDisp(value===0?'':String(value))},[value])
  return(<input type="number"className={className}disabled={disabled}placeholder={placeholder}value={disp}
    onFocus={()=>{focused.current=true;if(parseFloat(disp)===0||disp==='')setDisp('')}}
    onChange={e=>{setDisp(e.target.value);const p=parseFloat(e.target.value);onChange(isNaN(p)?0:p)}}
    onBlur={()=>{focused.current=false;const p=parseFloat(disp);setDisp(disp===''||isNaN(p)?'':String(p));onChange(isNaN(p)?0:p)}}
    {...props}/>)
}