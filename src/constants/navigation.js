import { LayoutDashboard, Package, Boxes, Layers3, Warehouse, ShoppingCart, Factory, FileText, Inbox, Users, Star, TicketPercent, PanelsTopLeft, ChartNoAxesCombined, Settings2, HelpCircle } from 'lucide-react';
export const navigation = [
 { label: 'Overview', path: '/', icon: LayoutDashboard, group: 'WORKSPACE' },
 { label: 'Products', path: '/products', icon: Package, group: 'CATALOGUE' },
 { label: 'Categories', path: '/categories', icon: Boxes, group: 'CATALOGUE' },
 { label: 'Materials', path: '/materials', icon: Layers3, group: 'CATALOGUE' },
 { label: 'Inventory', path: '/inventory', icon: Warehouse, group: 'CATALOGUE' },
 { label: 'Orders', path: '/orders', icon: ShoppingCart, group: 'OPERATIONS' },
 { label: 'Production', path: '/production', icon: Factory, group: 'OPERATIONS' },
 { label: 'Quotes', path: '/quotes', icon: FileText, group: 'CUSTOMERS' },
 { label: 'Requests', path: '/requests', icon: Inbox, group: 'CUSTOMERS' },
 { label: 'Customers', path: '/customers', icon: Users, group: 'CUSTOMERS' },
 { label: 'Reviews', path: '/reviews', icon: Star, group: 'CUSTOMERS' },
 { label: 'Coupons', path: '/coupons', icon: TicketPercent, group: 'GROWTH' },
 { label: 'Website content', path: '/content', icon: PanelsTopLeft, group: 'GROWTH' },
 { label: 'Reports', path: '/reports', icon: ChartNoAxesCombined, group: 'GROWTH' },
 { label: 'FAQs', path: '/faqs', icon: HelpCircle, group: 'GROWTH' },
 { label: 'Settings', path: '/settings', icon: Settings2, group: 'SYSTEM' },
];
