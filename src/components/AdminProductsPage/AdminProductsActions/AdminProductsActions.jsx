import { RefreshCw } from 'lucide-react';import Button from '../../../shared/buttons/Button.jsx';
export default function AdminProductsActions({onRefresh,busy=false}){return <Button variant="secondary" onClick={onRefresh} disabled={busy}><RefreshCw size={15} className={busy?'spin':''}/> Refresh</Button>}
