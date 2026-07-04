'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from '../layout';
import { 
  LayoutDashboard, 
  FolderOpen, 
  PenTool, 
  Users, 
  Settings, 
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/blogs', label: 'Blogs', icon: PenTool },
  { href: '/admin/services', label: 'Services', icon: FileText },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdmin();

  return (
    <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        {sidebarOpen ? (
          <Link href="/admin" className={styles.logo}>
            <h2>The Spatial Edit</h2>
            <span>Admin Panel</span>
          </Link>
        ) : (
          <Link href="/admin" className={styles.logoCollapsed}>
            <div className={styles.logoIcon}>TSE</div>
          </Link>
        )}
        
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={styles.toggleBtn}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href="/" className={styles.viewSite} target="_blank">
          {sidebarOpen ? 'View Website' : '🌐'}
        </Link>
      </div>
    </aside>
  );
}