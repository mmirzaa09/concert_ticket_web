'use client'

import { useEffect } from 'react'
import Table from '@/components/Table'
import styles from './revenue.module.css'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchAllTransactions } from '@/store/slices/transactionSlice'

interface RevenueData {
  id: string;
  concertName: string;
  totalRevenue: number;
}

export default function Revenue() {
  const dispatch = useAppDispatch()
  const { transactions, loading } = useAppSelector((state) => state.transactions)

  useEffect(() => {
    dispatch(fetchAllTransactions())
  }, [dispatch])

  const columns = [
    { key: 'concertName', label: 'Concert Name' },
    { 
      key: 'totalRevenue', 
      label: 'Total Revenue',
      render: (value: number) => `Rp ${value.toLocaleString('id-ID')}`
    },
  ]

  const revenueData: RevenueData[] = transactions
    .filter(t => t.transaction_status === 'approved')
    .reduce((acc: RevenueData[], t) => {
      const existingConcert = acc.find(item => item.concertName === t.concert_title);
      const price = typeof t.total_price === 'string' ? parseFloat(t.total_price) : t.total_price;

      if (existingConcert) {
        existingConcert.totalRevenue += price;
      } else {
        acc.push({
          id: t.concert_id,
          concertName: t.concert_title,
          totalRevenue: price,
        });
      }
      return acc;
    }, []);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Revenue by Concert</h1>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Revenue</h3>
          <p className={styles.statValue}>Rp {totalRevenue.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={revenueData} 
        loading={loading}
        emptyMessage="No revenue data available."
      />
    </div>
  )
}
