'use client';

import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Mock stats data
  const stats = {
    totalConcerts: 15,
    activeConcerts: 8,
    totalUsers: 45,
    totalRevenue: 15750000,
    pendingPayments: 3
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Concerts</h3>
            <p className={styles.statNumber}>{stats.totalConcerts}</p>
            <Link href="/concerts" className={styles.statLink}>
              View all concerts →
            </Link>
          </div>

          <div className={styles.statCard}>
            <h3>Active Concerts</h3>
            <p className={styles.statNumber}>{stats.activeConcerts}</p>
            <Link href="/concerts" className={styles.statLink}>
              Manage concerts →
            </Link>
          </div>

          {isAdmin && (
            <>
              <div className={styles.statCard}>
                <h3>Total Users</h3>
                <p className={styles.statNumber}>{stats.totalUsers}</p>
                <Link href="/users" className={styles.statLink}>
                  Manage users →
                </Link>
              </div>

              <div className={styles.statCard}>
                <h3>Total Revenue</h3>
                <p className={styles.statNumber}>Rp {stats.totalRevenue.toLocaleString()}</p>
                <Link href="/payments" className={styles.statLink}>
                  View payments →
                </Link>
              </div>

              <div className={styles.statCard}>
                <h3>Pending Payments</h3>
                <p className={styles.statNumber}>{stats.pendingPayments}</p>
                <Link href="/payments" className={styles.statLink}>
                  Review payments →
                </Link>
              </div>
            </>
          )}
        </div>

        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link href="/concerts" className={styles.actionCard}>
              <h3>🎵 Manage Concerts</h3>
              <p>Add, edit, or manage your concert listings</p>
            </Link>

            {isAdmin && (
              <>
                <Link href="/users" className={styles.actionCard}>
                  <h3>👥 Manage Users</h3>
                  <p>View and manage user accounts</p>
                </Link>

                <Link href="/payments" className={styles.actionCard}>
                  <h3>💳 View Payments</h3>
                  <p>Monitor payment transactions and revenue</p>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>🎵</span>
              <div>
                <p className={styles.activityTitle}>New concert &quot;Rock Festival 2024&quot; added</p>
                <p className={styles.activityTime}>2 hours ago</p>
              </div>
            </div>

            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>💳</span>
              <div>
                <p className={styles.activityTitle}>Payment received for Jazz Night</p>
                <p className={styles.activityTime}>5 hours ago</p>
              </div>
            </div>

            {isAdmin && (
              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>👤</span>
                <div>
                  <p className={styles.activityTitle}>New organizer account created</p>
                  <p className={styles.activityTime}>1 day ago</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
