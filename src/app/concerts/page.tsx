'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { Form, FormField, Input, Textarea, Select, Button } from '../../components/Form'
import { useAuth } from '../../context/AuthContext'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchConcertsByRole, createConcert } from '../../store/slices/concertSlice'
import { concertsAPI } from '../../services/api'
import styles from './concerts.module.css'

interface Concert {
  id: string
  title: string
  artist?: string
  description: string
  date: string
  venue: string
  price: number
  status: number // 1 = active, 0 = inactive
  organizerId: string
  image_url?: string
  total_tickets?: number
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
    artist: '',
    description: '',
    date: '',
    venue: '',
    price: '',
    total_tickets: '',
    status: 1 as number // 1 = active, 0 = inactive
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

        console.log('all concerts:', concerts)
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      if (editingConcert) {
        // Update existing concert (simplified for now)
        const concertData = {
          title: formData.title,
          artist: formData.artist,
          description: formData.description,
          date: formData.date,
          venue: formData.venue,
          price: Number(formData.price),
          status: Number(formData.status),
        }
        await concertsAPI.update(editingConcert.id, concertData)
      } else {
        // Create new concert with file upload
        if (!selectedImage) {
          alert('Please select an image for the concert')
          setFormLoading(false)
          return
        }

        // Create FormData for file upload
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title)
        formDataToSend.append('artist', formData.artist)
        formDataToSend.append('date', formData.date)
        formDataToSend.append('venue', formData.venue)
        formDataToSend.append('price', formData.price)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('total_tickets', formData.total_tickets)
        formDataToSend.append('id_organizer', user?.id?.toString() || '')
        formDataToSend.append('image', selectedImage)

        // Use Redux action instead of direct API call
        const result = await dispatch(createConcert(formDataToSend))
        
        if (createConcert.rejected.match(result)) {
          throw new Error(result.payload as string || 'Failed to create concert')
        }
      }

      // Refresh the concerts list for update operations
      // (Create operations are automatically handled by Redux slice)
      if (editingConcert) {
        if (isAdmin) {
          dispatch(fetchConcertsByRole({ userRole: 'super_admin' }))
        } else if (isOrganizer && user?.id) {
          dispatch(fetchConcertsByRole({ 
            userRole: 'organizer', 
            organizerId: user.id.toString() 
          }))
        }
      }

      closeModal()
    } catch (error) {
      console.error('Failed to save concert:', error)
      alert(`Failed to save concert: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (concert: Concert) => {
    setEditingConcert(concert)
    setFormData({
      title: concert.title,
      artist: concert.artist || '',
      description: concert.description,
      date: concert.date,
      venue: concert.venue,
      price: concert.price.toString(),
      total_tickets: concert.total_tickets?.toString() || '',
      status: concert.status
    })
    setSelectedImage(null)
    setImagePreview(null)
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
    const concert = concerts.find(c => c.id_concert === id)
    console.log('Toggling status for concert:', concert)
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
      artist: '',
      description: '',
      date: '',
      venue: '',
      price: '',
      total_tickets: '',
      status: 1
    })
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingConcert(null)
    setSelectedImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
  }

  const columns = [
    {
      key: 'image_url',
      label: 'Image',
      render: (value: string) => {
        const baseImageUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '');
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
    { key: 'artist', label: 'Artist' },
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
      render: (value: number) => `Rp ${value ? value.toLocaleString() : '0'}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: number, row: Concert) => (
        <button
          onClick={() => isOrganizer && toggleStatus(row.id_concert)}
          disabled={!isOrganizer}
          className={`${styles.statusButton} ${value === 1 ? styles.active : styles.inactive}`}
        >
          {value === 1 ? 'Active' : 'Inactive'}
        </button>
      )
    }
  ];

  if (isOrganizer) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Concert) => (
        <div className={styles.actions}>
          <button onClick={() => handleEdit(row)} className={styles.editButton}>
            Edit
          </button>
          <button onClick={() => handleDelete(row.id_concert)} className={styles.deleteButton}>
            Delete
          </button>
        </div>
      )
    });
  }

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'organizer']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Concerts Management</h1>
          {isOrganizer && (
            <Button onClick={openModal} variant="primary">
              Add New Concert
            </Button>
          )}
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

                <FormField label="Artist">
                  <Input
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    placeholder="Artist name"
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

                <FormField label="Total Tickets">
                  <Input
                    type="number"
                    name="total_tickets"
                    value={formData.total_tickets}
                    onChange={handleInputChange}
                    placeholder="Number of tickets available"
                    required
                  />
                </FormField>

                <FormField label="Concert Image">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingConcert}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: '10px' }}>
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={120}
                        style={{ objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </div>
                  )}
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