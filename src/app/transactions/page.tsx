'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import styles from './transactions.module.css'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAllTransactions, updateTransactionStatus } from '../../store/slices/transactionSlice'

interface Transaction {
  id: string
  username: string
  priceOrder: number
  proofImage: string | null
  status: 'pending' | 'approved' | 'rejected' | 'waiting_approve'
  dateUploaded: string | null
  orderId: string
  concertTitle?: string
  paymentMethod?: string
}

export default function Transactions() {
  const dispatch = useAppDispatch()
  const { transactions, loading } = useAppSelector((state) => state.transactions)
  const [filter, setFilter] = useState('all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchAllTransactions())
  }, [dispatch])

  // Handle approve/reject actions
  const handleStatusUpdate = async (transactionId: string, newStatus: 'approved' | 'rejected') => {
    await dispatch(updateTransactionStatus({ transactionId, status: newStatus }))
  }

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null
    const baseImageUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '')
    return `${baseImageUrl}/uploads/${imagePath}`
  }

  // Filter transactions
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(transaction => transaction.transaction_status === filter)

  // Get statistics
  const getStats = () => {
    console.log('Calculating stats from transactions:', transactions); // Debug log
    const stats = transactions.reduce((acc, transaction) => {
      acc[transaction.transaction_status] = (acc[transaction.transaction_status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalRevenue = transactions
      .filter(t => t.transaction_status === 'approved')
      .reduce((sum, t) => {
        const amount = typeof t.total_price === 'string' ? parseFloat(t.total_price) : t.total_price
        return sum + (amount || 0)
      }, 0)

    return { ...stats, totalRevenue }
  }

  const stats = getStats()

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    { 
      key: 'id_order', 
      label: 'Transaction ID',
      render: (value: string) => (
        <span className={styles.transactionId}>#{value}</span>
      )
    },
    { key: 'user_email', label: 'Username' },
    { key: 'concert_title', label: 'Concert' },
    { 
      key: 'total_price', 
      label: 'Price Order',
      render: (value: number) => (
        <span className={styles.price}>Rp {value}</span>
      )
    },
    {
      key: 'payment_proof_url',
      label: 'Proof',
      render: (value: string | null) => {
        return (
        <div className={styles.proofColumn}>
          {value ? (
            <div className={styles.proofContainer}>
              <Image
                src={getImageUrl(value)}
                alt="Payment proof"
                className={styles.proofThumbnail}
                onClick={() => setSelectedImage(value)}
                width={60}
                height={45}
              />
              <span className={styles.proofLabel}>View Proof</span>
            </div>
          ) : (
            <span className={styles.noProof}>No proof uploaded</span>
          )}
        </div>
      )}
    },
    {
      key: 'transaction_status',
      label: 'Status',
      render: (value: string, row: Transaction) => (
        <div className={styles.statusColumn}>
          <span className={`${styles.statusTag} ${styles[value]}`}>
            {value.toUpperCase()}
          </span>
          {value === 'waiting_approve' && (
            <div className={styles.actionButtons}>
              <button
                onClick={() => handleStatusUpdate(row.id_transaction, 'approved')}
                className={styles.approveButton}
                disabled={loading}
                title="Approve transaction"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(row.id_transaction, 'rejected')}
                className={styles.rejectButton}
                disabled={loading}
                title="Reject transaction"
              >
                ✗ Reject
              </button>
            </div>
          )}
        </div>
      )
    },
    { 
      key: 'payment_date', 
      label: 'Date Uploaded',
      render: (value: string | null) => (
        <span className={styles.dateColumn}>
          {formatDate(value)}
        </span>
      )
    }
  ]

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Transaction Management</h1>
          <div className={styles.headerInfo}>
            <span>Total Transactions: {transactions.length}</span>
            <span>•</span>
            <span>Awaiting Approval: {stats.waiting_approve || 0}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Revenue</h3>
            <p className={styles.statValue}>Rp {stats.totalRevenue?.toLocaleString() || 0}</p>
            <small>From approved transactions</small>
          </div>
          <div className={styles.statCard}>
            <h3>Approved</h3>
            <p className={styles.statValue}>{stats.approved || 0}</p>
            <small>Successfully approved</small>
          </div>
          <div className={styles.statCard}>
            <h3>Waiting Approval</h3>
            <p className={styles.statValue}>{stats.waiting_approve || 0}</p>
            <small>Need admin action</small>
          </div>
          <div className={styles.statCard}>
            <h3>Rejected</h3>
            <p className={styles.statValue}>{stats.rejected || 0}</p>
            <small>Declined transactions</small>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('waiting_approve')}
            className={`${styles.filterButton} ${filter === 'waiting_approve' ? styles.active : ''}`}
          >
            Waiting Approval ({stats.waiting_approve || 0})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`${styles.filterButton} ${filter === 'approved' ? styles.active : ''}`}
          >
            Approved ({stats.approved || 0})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          >
            Pending ({stats.pending || 0})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`${styles.filterButton} ${filter === 'rejected' ? styles.active : ''}`}
          >
            Rejected ({stats.rejected || 0})
          </button>
        </div>

        {/* Transactions Table */}
        <Table 
          columns={columns}
          data={filteredTransactions}
          loading={loading}
          emptyMessage="No transactions found."
        />

        {/* Image Modal */}
        {selectedImage && (
          <div className={styles.modal} onClick={() => setSelectedImage(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Payment Proof</h3>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <Image
                  src={getImageUrl(selectedImage)}
                  alt="Payment proof full size"
                  className={styles.fullSizeImage}
                  width={800}
                  height={600}
                  style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}