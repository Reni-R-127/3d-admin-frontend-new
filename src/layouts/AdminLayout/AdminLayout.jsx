import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { api } from '../../api.js';
import AdminSidebar from '../AdminSidebar/AdminSidebar.jsx';
import AdminHeader from '../AdminHeader/AdminHeader.jsx';
export default function AdminLayout({user,onLogout}) { const [menuOpen,setMenuOpen]=useState(false);return <div className="admin-app"><AdminSidebar open={menuOpen} onClose={()=>setMenuOpen(false)} user={user} onLogout={onLogout}/><div className="admin-main"><AdminHeader user={user} onMenu={()=>setMenuOpen(true)}/><main className="page-content"><Outlet/></main><footer className="admin-footer"><span>© {new Date().getFullYear()} ProJenius Studio</span><span>Administration workspace</span></footer></div></div>; }
