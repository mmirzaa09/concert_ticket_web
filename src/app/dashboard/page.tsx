'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import styles from './dashboard.module.css';
import { fetchConcertsByRole } from '../../store/slices/concertSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { fetchOrders } from '../../store/slices/orderSlice';

export default function Dashboard() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { concerts, loading, error } = useAppSelector((state) => state.concerts);
  const { totalUsers } = useAppSelector((state) => state.users);
  const { totalOrders, listOrders } = useAppSelector((state) => state.orders);

  const isAdmin = user?.role === 'super_admin';
  const isOrganizer = user?.role === 'organizer';

  useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') {
        dispatch(fetchConcertsByRole({ userRole: 'super_admin' }));
        dispatch(fetchUsers());
        dispatch(fetchOrders());
      }

      if (user.role === 'organizer' && user.id) {
        dispatch(fetchConcertsByRole({ 
          userRole: 'organizer', 
          organizerId: user.id.toString() 
        }));
      }
    }
  }, [dispatch, user]);

  const stats = {
    totalConcerts: concerts.length,
    activeConcerts: concerts.filter(concert => 
      concert.status === 1 || concert.status === 0
    ).length,
    totalUsers: isAdmin ? totalUsers : 0,
    totalOrders: isAdmin ? totalOrders : 0, 
    totalOrderOrganizer: isOrganizer ? listOrders : 0 
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'organizer']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
          {loading && <p>Loading concerts...</p>}
          {error && <p className={styles.error}>Error: {error}</p>}
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
                <h3>Total Orders</h3>
                <p className={styles.statNumber}>{stats.totalOrders}</p>
                <Link href="/payments" className={styles.statLink}>
                  Manage Orders →
                </Link>
              </div>

              <div className={styles.statCard}>
                <h3>List Payments</h3>
                <p className={styles.statNumber}>{stats.totalOrders}</p>
                <Link href="/transactions" className={styles.statLink}>
                  Manage payments →
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

        {/* Concert List Section */}
        <div className={styles.recentActivity}>
          <h2>{isOrganizer ? 'Your Concerts' : 'Recent Concerts'}</h2>
          {concerts.length > 0 ? (
            <div className={styles.activityList}>
              {concerts.slice(0, 6).map((concert) => (
                <div key={concert.id_concert} className={styles.activityItem}>
                  <span className={styles.activityIcon}>🎵</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <p className={styles.activityTitle}>{concert.title || concert.name}</p>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.75rem',
                        backgroundColor: concert.status === 1 ? '#10b981' : '#6b7280',
                        color: 'white'
                      }}>
                        {concert.status || 'draft'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <p className={styles.activityTime}>
                        📅 {new Date(concert.date).toLocaleDateString()} 
                        {concert.time && ` • ⏰ ${concert.time}`}
                      </p>
                      <p className={styles.activityTime}>
                        📍 {concert.venue} • 💰 Rp {concert.price?.toLocaleString() || '0'}
                      </p>
                      <p className={styles.activityTime}>
                        🎫 {concert.available_tickets || concert.availableTickets || 0}/{concert.total_tickets || concert.totalTickets || 0} tickets available
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span className={styles.activityIcon}>🎵</span>
                <div>
                  <p className={styles.activityTitle}>
                    {isOrganizer 
                      ? "You haven't created any concerts yet." 
                      : "No concerts found in the system."
                    }
                  </p>
                  <p className={styles.activityTime}>
                    <Link href="/concerts/create" className={styles.statLink}>
                      Create Your First Concert →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {concerts.length > 6 && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link href="/concerts" className={styles.statLink}>
                View All {concerts.length} Concerts →
              </Link>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
