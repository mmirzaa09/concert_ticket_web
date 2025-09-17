'use client'

import { ReactNode } from 'react'
import styles from './Form.module.css'

interface FormFieldProps {
  label: string
  children: ReactNode
  error?: string
}

export function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

interface FormProps {
  children: ReactNode
  onSubmit: (e: React.FormEvent) => void
  className?: string
}

export function Form({ children, onSubmit, className = '' }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`${styles.form} ${className}`}>
      {children}
    </form>
  )
}

interface InputProps {
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function Input({ type = 'text', className = '', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={`${styles.input} ${className}`}
      {...props}
    />
  )
}

interface SelectProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
  required?: boolean
  className?: string
}

export function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`${styles.input} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

interface TextareaProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  required?: boolean
  rows?: number
  className?: string
}

export function Textarea({ rows = 4, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={`${styles.input} ${styles.textarea} ${className}`}
      {...props}
    />
  )
}

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
}

export function Button({ 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
      {...props}
    />
  )
}