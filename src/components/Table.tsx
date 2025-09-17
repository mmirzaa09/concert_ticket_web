'use client'

import { ReactNode } from 'react'
import styles from './Table.module.css'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => ReactNode
}

interface TableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
}

export default function Table({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'No data available' 
}: TableProps) {
  if (loading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={styles.th}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={styles.tr}>
              {columns.map((column) => (
                <td key={column.key} className={styles.td}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}