'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../store/hooks';
import { verifyToken } from '../store/slices/authSlice';
import styles from './page.module.css';

export default function InitiatePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        try {
          // Verify token with Redux
          await dispatch(verifyToken()).unwrap();
          // If token is valid, redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } catch {
          // If token is invalid, redirect to login
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        // No token, redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    };

    checkAuth();
  }, [router, dispatch]);

  return (
    <div className={styles.container}>
      <div className={styles.initiateCard}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
        <h1 className={styles.title}>Concert Ticket Admin</h1>
        <p className={styles.subtitle}>Initializing admin dashboard...</p>
        <div className={styles.progress}>
          <div className={styles.progressBar}></div>
        </div>
      </div>
    </div>
  );
}