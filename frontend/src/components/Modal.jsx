import{X}from'lucide-react'
export default function Modal({title,icon:Icon,onClose,children,maxWidth='max-w-lg',accent='amber'}){
  const accents={amber:'text-amber-600 dark:text-amber-400',blue:'text-blue-600 dark:text-blue-400',violet:'text-violet-600 dark:text-violet-400'}
  return(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"onClick={onClose}>
      <div className={`card p-6 w-full ${maxWidth} shadow-2xl max-h-[88vh] overflow-y-auto`}onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white dark:bg-zinc-900 -mt-1 pt-1 pb-2 -mx-1 px-1">
          <h3 className="font-bold text-lg flex items-center gap-2">{Icon&&<Icon className={`w-5 h-5 ${accents[accent]}`}/>}{title}</h3>
          <button onClick={onClose}className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"><X className="w-5 h-5"/></button>
        </div>
        {children}
      </div>
    </div>
  )
}