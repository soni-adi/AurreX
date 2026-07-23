import Modal from'./Modal'
import CalcInput from'./CalcInput'

/**
 * fields: [{key,label,type:'text'|'number'|'date'|'select',options?,placeholder?,span?:1|2,readOnly?,compute?:(row)=>val}]
 * value: object holding current row data
 * onChange: (key,val)=>void   -- updates a single field
 * onSave, onDelete (optional), onClose
 */
export default function RowFormModal({title,icon,accent='amber',fields,value,onChange,onSave,onDelete,onClose}){
  return(
    <Modal title={title}icon={icon}accent={accent}onClose={onClose}maxWidth="max-w-md">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {fields.map(f=>{
          const val=f.compute?f.compute(value):value[f.key]
          return(
            <div key={f.key}className={f.span===2?'sm:col-span-2':''}>
              <label className="label">{f.label}</label>
              {f.readOnly?(
                <div className="input-base bg-slate-50 dark:bg-zinc-800/70 font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center">{val}</div>
              ):f.type==='select'?(
                <select className="input-base"value={val||''}onChange={e=>onChange(f.key,e.target.value)}>
                  {(f.options||[]).map(o=><option key={o}value={o}>{o}</option>)}
                </select>
              ):f.type==='date'?(
                <input className="input-base"type="date"value={val||''}onChange={e=>onChange(f.key,e.target.value)}/>
              ):f.type==='number'?(
                <CalcInput className="input-base"value={val||0}onChange={v=>onChange(f.key,v)}placeholder={f.placeholder}/>
              ):(
                <input className="input-base"type="text"value={val||''}onChange={e=>onChange(f.key,e.target.value)}placeholder={f.placeholder}/>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex gap-3">
        {onDelete&&<button onClick={onDelete}className="btn-danger px-4">Delete</button>}
        <button onClick={onClose}className="btn-secondary flex-1">Cancel</button>
        <button onClick={onSave}className="btn-primary flex-1">Save</button>
      </div>
    </Modal>
  )
}