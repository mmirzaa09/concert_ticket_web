'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { Form, FormField, Input, Textarea, Select, Button } from '../../components/Form'
import { useAuth } from '../../context/AuthContext'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchConcertsByRole } from '../../store/slices/concertSlice'
import { concertsAPI } from '../../services/api'
import styles from './concerts.module.css'

interface Concert {
  id: string
  title: string
  artist: string
  description: string
  date: string
  venue: string
  price: number
  total_tickets: number
  status: number // 1 = active, 0 = inactive
  organizerId: string
  image_url?: string
}

export default function Concerts() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const { concerts, loading, error } = useAppSelector((state) => state.concerts)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConcert, setEditingConcert] = useState<Concert | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    price: '',
    status: 1 as number // 1 = active, 0 = inactive
  })

  const isAdmin = user?.role === 'super_admin'
  const isOrganizer = user?.role === 'organizer'

  // Load concerts based on user role
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        console.log('Fetching all concerts for super_admin')
        dispatch(fetchConcertsByRole({ userRole: 'super_admin' }))
      } else if (isOrganizer && user.id) {
        console.log('Fetching concerts for organizer ID:', user.id)
        dispatch(fetchConcertsByRole({ 
          userRole: 'organizer', 
          organizerId: user.id.toString() 
        }))
      }
    }
  }, [user, dispatch, isAdmin, isOrganizer])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      const concertData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        venue: formData.venue,
        price: Number(formData.price),
        status: Number(formData.status),
      }

      if (editingConcert) {
        // Update existing concert
        await concertsAPI.update(editingConcert.id, concertData)
      } else {
        // Add new concert
        await concertsAPI.create(concertData)
      }

      // Refresh the concerts list based on user role
      if (isAdmin) {
        dispatch(fetchConcertsByRole({ userRole: 'super_admin' }))
      } else if (isOrganizer && user?.id) {
        dispatch(fetchConcertsByRole({ 
          userRole: 'organizer', 
          organizerId: user.id.toString() 
        }))
      }

      closeModal()
    } catch (error) {
      console.error('Failed to save concert:', error)
    } finally {
      setFormLoading(false)
    }
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this concert?')) {
      try {
        await concertsAPI.delete(id)
        
        // Refresh the concerts list based on user role
        if (isAdmin) {
          dispatch(fetchConcertsByRole({ userRole: 'super_admin' }))
        } else if (isOrganizer && user?.id) {
          dispatch(fetchConcertsByRole({ 
            userRole: 'organizer', 
            organizerId: user.id.toString() 
          }))
        }
      } catch (error) {
        console.error('Failed to delete concert:', error)
      }
    }
  }

  const toggleStatus = async (id: string) => {
    const concert = concerts.find(c => c.id === id)
    if (!concert) return

    const newStatus = concert.status === 1 ? 0 : 1
    
    try {
      await concertsAPI.updateStatus(id, newStatus === 1 ? 'active' : 'inactive')
      
      // Refresh the concerts list based on user role
      if (isAdmin) {
        dispatch(fetchConcertsByRole({ userRole: 'super_admin' }))
      } else if (isOrganizer && user?.id) {
        dispatch(fetchConcertsByRole({ 
          userRole: 'organizer', 
          organizerId: user.id.toString() 
        }))
      }
    } catch (error) {
      console.error('Failed to update concert status:', error)
    }
  }

  const openModal = () => {
    setEditingConcert(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      venue: '',
      price: '',
      status: 1
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingConcert(null)
  }

  const columns = [
    {
      key: 'image_url',
      label: 'Image',
      render: (value: string) => {
        // Construct full image URL from environment variable + image filename
        const baseImageUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://192.168.1.135:3030';
        const fullImageUrl = value ? `${baseImageUrl}/uploads/${value}` : null;
        
        return (
          <div style={{ width: '60px', height: '40px', overflow: 'hidden', borderRadius: '4px', position: 'relative' }}>
            {fullImageUrl ? (
              <Image 
                src={fullImageUrl} 
                alt="Concert"
                fill
                style={{ objectFit: 'cover' }}
                onError={() => {
                  // Handle error if needed
                }}
              />
            ) : (
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundColor: '#f3f4f6', 
                  display: 'flex',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#6b7280'
                }}
              >
                No Image
              </div>
            )}
          </div>
        )
      }
    },
    { key: 'title', label: 'Title' },
    { key: 'venue', label: 'Venue' },
    { 
      key: 'date', 
      label: 'Date',
      render: (value: string) => {
        const date = new Date(value)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    },
    { 
      key: 'price', 
      label: 'Price',
      render: (value: number) => `Rp ${value.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: number, row: Concert) => (
        <button
          onClick={() => toggleStatus(row.id)}
          className={`${styles.statusButton} ${value === 1 ? styles.active : styles.inactive}`}
        >
          {value === 1 ? 'Active' : 'Inactive'}
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
    <ProtectedRoute allowedRoles={['super_admin', 'organizer']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Concerts Management</h1>
          <p>{isAdmin ? 'Manage all concerts in the system' : 'Manage your concerts'}</p>
          {error && <p className={styles.error}>Error: {error}</p>}
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
                    value={formData.status.toString()}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </Select>
                </FormField>

                <div className={styles.modalActions}>
                  <Button type="button" onClick={closeModal} variant="secondary">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : (editingConcert ? 'Update' : 'Create')} Concert
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