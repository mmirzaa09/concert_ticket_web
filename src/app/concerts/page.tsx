'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { Form, FormField, Input, Textarea, Select, Button } from '../../components/Form'
import { useAuth } from '../../context/AuthContext'
import styles from './concerts.module.css'

interface Concert {
  id: string
  title: string
  description: string
  date: string
  venue: string
  price: number
  status: 'active' | 'inactive'
  organizerId: string
}

export default function Concerts() {
  const { user } = useAuth()
  const [concerts, setConcerts] = useState<Concert[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    price: '',
    status: 'active' as 'active' | 'inactive'
  })

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadConcerts = () => {
      setLoading(true)
      // Mock data
      const mockConcerts: Concert[] = [
        {
          id: '1',
          title: 'Rock Festival 2024',
          description: 'Annual rock music festival featuring top bands',
          date: '2024-12-15',
          venue: 'Stadium Arena',
          price: 150000,
          status: 'active',
          organizerId: user?.id || '1'
        },
        {
          id: '2',
          title: 'Jazz Night',
          description: 'Intimate jazz performance with renowned artists',
          date: '2024-11-20',
          venue: 'Blue Note Club',
          price: 75000,
          status: 'inactive',
          organizerId: user?.id || '1'
        }
      ]
      setConcerts(mockConcerts)
      setLoading(false)
    }

    loadConcerts()
  }, [user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const concertData: Concert = {
      id: editingConcert?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      venue: formData.venue,
      price: Number(formData.price),
      status: formData.status,
      organizerId: user?.id || '1'
    }

    if (editingConcert) {
      // Update existing concert
      setConcerts(prev => prev.map(concert => 
        concert.id === editingConcert.id ? concertData : concert
      ))
    } else {
      // Add new concert
      setConcerts(prev => [...prev, concertData])
    }

    closeModal()
  }

  const handleEdit = (concert: Concert) => {
    setEditingConcert(concert)
    setFormData({
      title: concert.title,
      description: concert.description,
      date: concert.date,
      venue: concert.venue,
      price: concert.price.toString(),
      status: concert.status
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this concert?')) {
      setConcerts(prev => prev.filter(concert => concert.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setConcerts(prev => prev.map(concert => 
      concert.id === id 
        ? { ...concert, status: concert.status === 'active' ? 'inactive' : 'active' }
        : concert
    ))
  }

  const openModal = () => {
    setEditingConcert(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      venue: '',
      price: '',
      status: 'active'
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingConcert(null)
  }

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'venue', label: 'Venue' },
    { key: 'date', label: 'Date' },
    { 
      key: 'price', 
      label: 'Price',
      render: (value: number) => `Rp ${value.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: Concert) => (
        <button
          onClick={() => toggleStatus(row.id)}
          className={`${styles.statusButton} ${styles[value]}`}
        >
          {value}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Concert) => (
        <div className={styles.actions}>
          <button onClick={() => handleEdit(row)} className={styles.editButton}>
            Edit
          </button>
          <button onClick={() => handleDelete(row.id)} className={styles.deleteButton}>
            Delete
          </button>
        </div>
      )
    }
  ]

  return (
    <ProtectedRoute allowedRoles={['admin', 'organizer']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Concerts Management</h1>
          <Button onClick={openModal} variant="primary">
            Add New Concert
          </Button>
        </div>

        <Table 
          columns={columns}
          data={concerts}
          loading={loading}
          emptyMessage="No concerts found. Add your first concert!"
        />

        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{editingConcert ? 'Edit Concert' : 'Add New Concert'}</h2>
                <button onClick={closeModal} className={styles.closeButton}>×</button>
              </div>

              <Form onSubmit={handleSubmit}>
                <FormField label="Title">
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Concert title"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Concert description"
                    required
                  />
                </FormField>

                <FormField label="Date">
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </FormField>

                <FormField label="Venue">
                  <Input
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Venue name"
                    required
                  />
                </FormField>

                <FormField label="Price (Rp)">
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Ticket price"
                    required
                  />
                </FormField>

                <FormField label="Status">
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </FormField>

                <div className={styles.modalActions}>
                  <Button type="button" onClick={closeModal} variant="secondary">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingConcert ? 'Update' : 'Create'} Concert
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}