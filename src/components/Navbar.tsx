'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  if (!user) return null

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          Concert Admin
        </Link>
        
        <div className={styles.userSection}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userRole}>({user.role})</span>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}