'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { Form, FormField, Input, Select, Button } from '../../components/Form'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchUsers, clearError } from '../../store/slices/userSlice'
import styles from './users.module.css'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'organizer'
  status: 'active' | 'inactive'
  createdAt: string
}

export default function Users() {
  const dispatch = useAppDispatch()
  const { users, listUsers, loading, error } = useAppSelector((state) => state.users)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'organizer' as 'admin' | 'organizer',
    status: 'active' as 'active' | 'inactive'
  })

  // Use the users data from Redux, fallback to listUsers if users is empty
  const displayUsers = users.length > 0 ? users : listUsers

  useEffect(() => {
    console.log('Loading users via Redux...')
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      console.error('Users error:', error)
      // Clear error after showing it
      setTimeout(() => {
        dispatch(clearError())
      }, 5000)
    }
  }, [error, dispatch])

  // Fallback data if both Redux arrays are empty and not loading
  const fallbackUsers: User[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Organizer User',
      email: 'organizer@test.com',
      role: 'organizer',
      status: 'active',
      createdAt: '2024-01-20'
    }
  ]

  // Use Redux data, or fallback data if no data and not loading
  const finalDisplayUsers = displayUsers.length > 0 ? displayUsers : (!loading ? fallbackUsers : [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Implement create/update user Redux actions
    console.log('Form submitted:', formData)
    
    if (editingUser) {
      console.log('Updating user:', editingUser.id)
      // For now, just close modal - implement update user API call later
    } else {
      console.log('Creating new user')
      // For now, just close modal - implement create user API call later
    }

    closeModal()
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]

  // Debug: log user data
  useEffect(() => {
    console.log('Users page - Redux state:', { users, listUsers, loading, error })
  }, [users, listUsers, loading, error])

  return (
    <ProtectedRoute allowedRoles={['super_admin']}>
      <div className={styles.container}>

        {error && (
          <div className={styles.error} style={{ 
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

        <Table 
          columns={columns}
          data={finalDisplayUsers}
          loading={loading}
          emptyMessage="No users found. Click 'Add New User' to create your first user."
        />

        {isModalOpen && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                <button onClick={closeModal} className={styles.closeButton}>×</button>
              </div>

              <Form onSubmit={handleSubmit}>
                <FormField label="Name">
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    required
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    required
                  />
                </FormField>

                <FormField label="Role">
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="organizer">Organizer</option>
                    <option value="admin">Admin</option>
                  </Select>
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
                    {editingUser ? 'Update' : 'Create'} User
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