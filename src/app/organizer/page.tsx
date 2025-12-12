'use client'

import { useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import styles from './organizer.module.css'
import { fetchAllOrganizers, updateOrganizerStatus } from '../../store/slices/organizerSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

export default function OrganizerPage() {
  const dispatch = useAppDispatch()
  const { organizers, loading, error } = useAppSelector((state) => state.organizers)

  // Filter to only show organizers with role 'organizer'
  const filteredOrganizers = organizers?.filter((o: { role?: string }) => o.role === 'organizer') || []

  useEffect(() => {
    dispatch(fetchAllOrganizers())
  }, [dispatch])

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === '1' ? '0' : '1'
    dispatch(updateOrganizerStatus({ id, status: newStatus as '1' | '0' }))
  }

  const columns = [
    {
      key: 'id_organizer',
      label: 'ID',
    },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone_number', label: 'Phone' },
    { key: 'address', label: 'Address' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const isActive = value === '1' || !value
        return (
          <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Created At',
      render: (value: string) => {
        if (!value) return '-'
        return new Date(value).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: { id_organizer: string; status?: string }) => {
        const isActive = row.status === '1' || !row.status
        return (
          <button
            className={`${styles.actionBtn} ${isActive ? styles.deactivateBtn : styles.activateBtn}`}
            onClick={() => handleStatusChange(row.id_organizer, row.status || '1')}
            disabled={loading}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
        )
      },
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'organizer']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Organizers</h1>
          <p className={styles.subtitle}>Manage all organizers in the system</p>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{filteredOrganizers.length}</span>
              <span className={styles.statLabel}>Total Organizers</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {filteredOrganizers.filter((o: { status?: string }) => o.status === '1' || !o.status).length}
              </span>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⏸️</div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {filteredOrganizers.filter((o: { status?: string }) => o.status === '0').length}
              </span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={filteredOrganizers}
            loading={loading}
            emptyMessage="No organizers found"
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
