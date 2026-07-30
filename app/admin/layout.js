'use client';

export const dynamic = 'force-dynamic';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import toast, { Toaster } from 'react-hot-toast';
import styles from './Admin.module.css';

const AdminContext = createContext({});

export function useAdmin() {
  return useContext(AdminContext);
}

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createSupabaseClient();

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // If Supabase is not configured, skip auth check
    if (!supabase) {
      setLoading(false);
      return;
    }

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      } else {
        router.push('/admin/login');
      }
      
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          router.push('/admin/login');
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [isLoginPage, router]);

  const signOut = async () => {
    try {
      if (!supabase) return;
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Loading...</div>
      </div>
    );
  }

  if (isLoginPage) {
    return (
      <div className={styles.loginLayout}>
        {children}
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user, signOut, sidebarOpen, setSidebarOpen }}>
      <div className={styles.adminLayout}>
        <Toaster position="top-right" />
        
        <AdminSidebar />
        
        <div className={`${styles.mainContent} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
          <AdminHeader />
          
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}