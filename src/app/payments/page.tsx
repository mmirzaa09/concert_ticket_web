'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { paymentsAPI } from '../../services/api'
import styles from './payments.module.css'

interface Payment {
  id: string
  customerName: string
  customerEmail: string
  concertTitle: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  transactionDate: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true)
      try {
        const response = await paymentsAPI.getAll()
        setPayments(response.data || [])
      } catch (error) {
        console.error('Failed to load payments:', error)
        // Fallback to mock data if API fails
        const mockPayments: Payment[] = [
          {
            id: '1',
            customerName: 'Alice Johnson',
            customerEmail: 'alice@example.com',
            concertTitle: 'Rock Festival 2024',
            amount: 150000,
            status: 'completed',
            paymentMethod: 'Credit Card',
            transactionDate: '2024-09-10'
          },
          {
            id: '2',
            customerName: 'Bob Smith',
            customerEmail: 'bob@example.com',
            concertTitle: 'Jazz Night',
            amount: 75000,
            status: 'pending',
            paymentMethod: 'Bank Transfer',
            transactionDate: '2024-09-12'
          },
          {
            id: '3',
            customerName: 'Carol Davis',
            customerEmail: 'carol@example.com',
            concertTitle: 'Rock Festival 2024',
            amount: 150000,
            status: 'failed',
            paymentMethod: 'E-Wallet',
            transactionDate: '2024-09-11'
          },
          {
            id: '4',
            customerName: 'David Wilson',
            customerEmail: 'david@example.com',
            concertTitle: 'Jazz Night',
            amount: 75000,
            status: 'completed',
            paymentMethod: 'Credit Card',
            transactionDate: '2024-09-09'
          }
        ]
        setPayments(mockPayments)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  const updatePaymentStatus = async (id: string, newStatus: 'pending' | 'completed' | 'failed') => {
    try {
      await paymentsAPI.updateStatus(id, newStatus)
      setPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, status: newStatus } : payment
      ))
    } catch (error) {
      console.error('Failed to update payment status:', error)
      // Fallback to local state update if API fails
      setPayments(prev => prev.map(payment => 
        payment.id === id ? { ...payment, status: newStatus } : payment
      ))
    }
  }

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.status === filter)

  const getStatusStats = () => {
    const stats = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)

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
      render: (value: number) => `Rp ${value.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: Payment) => (
        <div className={styles.statusColumn}>
          <span className={`${styles.statusTag} ${styles[value]}`}>
            {value}
          </span>
          {value === 'pending' && (
            <div className={styles.statusActions}>
              <button
                onClick={() => updatePaymentStatus(row.id, 'completed')}
                className={styles.approveButton}
                title="Mark as completed"
              >
                ✓
              </button>
              <button
                onClick={() => updatePaymentStatus(row.id, 'failed')}
                className={styles.rejectButton}
                title="Mark as failed"
              >
                ✗
              </button>
            </div>
          )}
        </div>
      )
    },
    { key: 'paymentMethod', label: 'Method' },
    { key: 'transactionDate', label: 'Date' }
  ]

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Payments Management</h1>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <h3>Total Revenue</h3>
            <p className={styles.statValue}>Rp {stats.totalAmount?.toLocaleString() || 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Completed</h3>
            <p className={styles.statValue}>{stats.completed || 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Pending</h3>
            <p className={styles.statValue}>{stats.pending || 0}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Failed</h3>
            <p className={styles.statValue}>{stats.failed || 0}</p>
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
            onClick={() => setFilter('completed')}
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
          >
            Completed ({stats.completed || 0})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`${styles.filterButton} ${filter === 'failed' ? styles.active : ''}`}
          >
            Failed ({stats.failed || 0})
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