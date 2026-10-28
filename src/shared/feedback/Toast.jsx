import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
export default function Toast({type='info',children}) { const Icon=type==='success'?CheckCircle2:type==='error'?AlertCircle:Info; return <div className={`toast toast-${type}`} role={type==='error'?'alert':'status'}><Icon size={17}/><span>{children}</span></div>; }
