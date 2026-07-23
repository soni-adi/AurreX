import{useState}from'react'
import{Plus,Pencil,Trash2}from'lucide-react'
import RowFormModal from'./RowFormModal'

/**
 * Generic popup-editable table.
 * rows: array of row objects
 * fields: field config for the edit/add modal (see RowFormModal)
 * displayColumns: [{key,label,align,format:(row)=>string|node}]
 * blankRow: ()=>object  -- factory for a new row
 * onAdd: (row)=>void
 * onUpdate: (index,row)=>void
 * onDelete: (index)=>void
 * footer: optional {label, cells:[...]} rendered as totals row matching displayColumns
 * title, icon, accent, addLabel
 */
export default function PopupTable({title,icon,accent='amber',rows,fields,displayColumns,blankRow,onAdd,onUpdate,onDelete,footer,addLabel='Add Row',emptyText='No entries yet',disabled=false}){
  const[modalState,setModalState]=useState(null) // {mode:'new'|'edit', index, draft}
  const accentBtn={amber:'btn-primary',blue:'btn-blue',violet:'btn-violet'}[accent]||'btn-primary'

  const openNew=()=>setModalState({mode:'new',index:null,draft:blankRow()})
  const openEdit=(index)=>setModalState({mode:'edit',index,draft:{...rows[index]}})
  const close=()=>setModalState(null)
  const changeDraft=(key,val)=>setModalState(s=>({...s,draft:{...s.draft,[key]:val}}))
  const save=()=>{
    if(modalState.mode==='new')onAdd(modalState.draft)
    else onUpdate(modalState.index,modalState.draft)
    close()
  }
  const del=()=>{ if(modalState.index!=null)onDelete(modalState.index); close() }

  return(
    <div className="section-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">{icon&&<span className="text-slate-400">{title}</span>}{!icon&&title}</h2>
        {!disabled&&<button onClick={openNew}className={accentBtn+' text-xs px-3 py-1.5'}><Plus className="w-3.5 h-3.5"/>{addLabel}</button>}
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
              {displayColumns.map(c=>(<th key={c.key}className={`table-header py-2.5 px-4 ${c.align==='right'?'text-right':'text-left'}`}>{c.label}</th>))}
              {!disabled&&<th className="py-2.5 px-3 w-16"/>}
            </tr>
          </thead>
          <tbody>
            {rows.length===0&&(<tr><td colSpan={displayColumns.length+1}className="py-8 text-center text-slate-400 text-sm">{emptyText}</td></tr>)}
            {rows.map((row,i)=>(
              <tr key={i}onClick={()=>!disabled&&openEdit(i)}
                className={`border-b border-slate-100 dark:border-zinc-800 last:border-0 transition-colors ${!disabled?'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60':''}`}>
                {displayColumns.map(c=>(
                  <td key={c.key}className={`py-2.5 px-4 ${c.align==='right'?'text-right font-mono':''} ${c.bold?'font-bold':''} ${c.colorClass||''}`}>
                    {c.format?c.format(row):row[c.key]}
                  </td>
                ))}
                {!disabled&&(
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-slate-300 dark:text-zinc-600"><Pencil className="w-3.5 h-3.5"/></span>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {footer&&rows.length>0&&(
            <tfoot>
              <tr className="bg-slate-50 dark:bg-zinc-800/70 font-bold text-xs">
                <td className="py-2.5 px-4">{footer.label}</td>
                {footer.cells.map((c,i)=>(<td key={i}className="py-2.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">{c}</td>))}
                {!disabled&&<td/>}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {modalState&&(
        <RowFormModal
          title={modalState.mode==='new'?'Add Entry':'Edit Entry'}
          icon={icon}
          accent={accent}
          fields={fields}
          value={modalState.draft}
          onChange={changeDraft}
          onSave={save}
          onDelete={modalState.mode==='edit'?del:undefined}
          onClose={close}
        />
      )}
    </div>
  )
}