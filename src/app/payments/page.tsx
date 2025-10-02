'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { ordersAPI } from '../../services/api'
import styles from './payments.module.css'

interface Payment {
  id: string
  customerName: string
  customerEmail: string
  concertTitle: string
  amount: number | string  // Handle both number and string types
  status: 'pending' | 'paid' | 'cancelled'
  paymentMethod: string
  bookingDate: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      try {
        const response = await ordersAPI.getAllWithDetails()
        setLoading(false)
        setPayments(response.data || [])
      } catch (error) {
        console.error('Failed to load payments:', error)
        setPayments(mockPayments)
      }
    }

    loadPayments()
  }, [])

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.status === filter)

  const getStatusStats = () => {
    // Debug: check payment data types
    console.log('First payment amount:', payments[0]?.amount, 'Type:', typeof payments[0]?.amount)
    
    const stats = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => {
        const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount
        console.log('Processing amount:', p.amount, 'Type:', typeof p.amount, 'Converted:', amount, 'Running sum:', sum)
        return sum + (amount || 0)
      }, 0)

      console.log('Payment stats:', stats, 'Total Amount:', totalAmount)

    return { ...stats, totalAmount }
  }

  const stats = getStatusStats()

  const columns = [
    { key: 'customerName', label: 'Customer' },
    { key: 'customerEmail', label: 'Email' },
    { key: 'concertTitle', label: 'Concert' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value: number | string) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value
        return `Rp ${(amount || 0).toLocaleString()}`
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <div className={styles.statusColumn}>
          <span className={`${styles.statusTag} ${styles[value]}`}>
            {value}
          </span>
        </div>
      )
    },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'bookingDate', label: 'Date' }
  ]

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Order Management</h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Revenue</h3>
            <p className={styles.statValue}>Rp {stats.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Completed</h3>
            <p className={styles.statValue}>{stats.paid || 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pending</h3>
            <p className={styles.statValue}>{stats.pending || 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Cancelled</h3>
            <p className={styles.statValue}>{stats.cancelled || 0}</p>
          </div>
        </div>

        <div className={styles.filters}>
          <button
            onClick={() => setFilter('all')}
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          >
            Pending ({stats.pending || 0})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`${styles.filterButton} ${filter === 'paid' ? styles.active : ''}`}
          >
            Completed ({stats.paid || 0})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`${styles.filterButton} ${filter === 'cancelled' ? styles.active : ''}`}
          >
            Failed ({stats.cancelled || 0})
          </button>
        </div>

        <Table 
          columns={columns}
          data={filteredPayments}
          loading={loading}
          emptyMessage="No payments found."
        />
      </div>
    </ProtectedRoute>
  )
}