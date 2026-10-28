import { titleCase } from '../utils/format.js';
export default function StatusBadge({value}) { const status=String(value||'unknown').toLowerCase().replace(/[^a-z0-9]+/g,'-');return <span className={`status-badge status-${status}`}>{titleCase(value||'Unknown')}</span>; }
