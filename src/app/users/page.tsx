'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Table from '../../components/Table'
import { Form, FormField, Input, Select, Button } from '../../components/Form'
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
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'organizer' as 'admin' | 'organizer',
    status: 'active' as 'active' | 'inactive'
  })

  useEffect(() => {
    setLoading(true)
    // Mock data
    const mockUsers: User[] = [
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
      },
      {
        id: '3',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'organizer',
        status: 'inactive',
        createdAt: '2024-02-01'
      }
    ]
    setUsers(mockUsers)
    setLoading(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      createdAt: editingUser?.createdAt || new Date().toISOString().split('T')[0]
    }

    if (editingUser) {
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? userData : user
      ))
    } else {
      setUsers(prev => [...prev, userData])
    }

    closeModal()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== id))
    }
  }

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  const openModal = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'organizer',
      status: 'active'
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Role',
      render: (value: string) => (
        <span className={`${styles.roleTag} ${styles[value]}`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: User) => (
        <button
          onClick={() => toggleStatus(row.id)}
          className={`${styles.statusButton} ${styles[value]}`}
        >
          {value}
        </button>
      )
    },
    { key: 'createdAt', label: 'Created At' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: User) => (
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
    <ProtectedRoute allowedRoles={['admin']}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Users Management</h1>
          <Button onClick={openModal} variant="primary">
            Add New User
          </Button>
        </div>

        <Table 
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found."
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