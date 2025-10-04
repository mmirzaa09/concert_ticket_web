'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import styles from './payments.module.css'
import { fetchOrderListDetails } from "../../store/slices/orderSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

interface Payment {
  id: string
  customerName: string
  customerEmail: string
  concertTitle: string
  amount: number | string 
  status: 'pending' | 'paid' | 'cancelled' | 'waiting_approve'
  paymentMethod: string
  bookingDate: string
}
export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>()
  const [filter, setFilter] = useState('all')
  const dispatch = useAppDispatch();
  const { listOrders, totalOrder, loading, error } = useAppSelector(state => state.orders);

  useEffect(() => {
    dispatch(fetchOrderListDetails())
  }, [dispatch])

  useEffect(() => {
    if (listOrders && listOrders.length > 0) {
      return setPayments(listOrders)
    }

    return;
  }, [listOrders])

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(payment => payment.status === filter)

  const getStatusStats = () => {
    
    if (!Array.isArray(payments) || totalOrder === 0) {
      return { pending: 0, paid: 0, cancelled: 0, waiting_approve: 0, totalAmount: 0 }
    }
    
    const stats = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalAmount = payments
      .filter(p => p.status === 'paid') // Only count paid orders for revenue
      // Note: If you want to include 'waiting_approve' in potential revenue:
      // .filter(p => p.status === 'paid' || p.status === 'waiting_approve')
      .reduce((sum, p) => {
        const amount = typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount
        return sum + (amount || 0)
      }, 0)

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
            {value === 'waiting_approve' ? 'Waiting Approve' : value}
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

        {error && (
          <div style={{ 
            background: '#fee', 
            color: '#c33', 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '4px',
            border: '1px solid #fcc'
          }}>
            Error: {error}
          </div>
        )}

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
            <h3>Waiting Approve</h3>
            <p className={styles.statValue}>{stats.waiting_approve || 0}</p>
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
            All ({totalOrder})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          >
            Pending ({stats.pending || 0})
          </button>
          <button
            onClick={() => setFilter('waiting_approve')}
            className={`${styles.filterButton} ${filter === 'waiting_approve' ? styles.active : ''}`}
          >
            Waiting Approve ({stats.waiting_approve || 0})
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

        {filteredPayments && 
        (
          <Table 
            columns={columns}
            data={filteredPayments}
            loading={loading}
            emptyMessage="No payments found."
          />
        )}
      </div>
    </ProtectedRoute>
  )
}