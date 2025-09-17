'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', roles: ['admin', 'organizer'] },
    { href: '/concerts', label: 'Concerts', roles: ['admin', 'organizer'] },
    { href: '/users', label: 'Users', roles: ['admin'] },
    { href: '/payments', label: 'Payments', roles: ['admin'] },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  )

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {filteredMenuItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`${styles.menuItem} ${pathname === item.href ? styles.active : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}