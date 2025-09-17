'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import styles from './MainLayout.module.css'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  // Don't show layout on login/register pages
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isLoading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    )
  }

  if (isAuthPage || !user) {
    return <>{children}</>
  }

  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.content}>
        <Sidebar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  )
}