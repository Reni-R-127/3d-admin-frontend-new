import { Inbox } from 'lucide-react';
export default function EmptyState({title='Nothing here yet',description='Records will appear here when they are available.',action}) { return <div className="empty-state"><span className="empty-icon"><Inbox size={23}/></span><h3>{title}</h3><p>{description}</p>{action}</div>; }
