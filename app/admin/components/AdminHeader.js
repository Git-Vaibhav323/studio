'use client';

import { useAdmin } from '../layout';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import styles from './AdminHeader.module.css';

export default function AdminHeader() {
  const { user, signOut } = useAdmin();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.mobileMenuBtn}>
          <Menu size={20} />
        </button>
        
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      <div className={styles.right}>
        <button className={styles.notificationBtn}>
          <Bell size={20} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        <div className={styles.userMenu}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={styles.userBtn}
          >
            <div className={styles.avatar}>
              <User size={20} />
            </div>
            <span className={styles.userEmail}>{user?.email}</span>
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.userInfo}>
                <strong>{user?.email}</strong>
                <span>Administrator</span>
              </div>
              
              <div className={styles.divider} />
              
              <button onClick={signOut} className={styles.logoutBtn}>
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}