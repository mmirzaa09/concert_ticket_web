'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConcerts } from '../../store/slices/concertSlice';
import { fetchOrganizers } from '../../store/slices/organizerSlice';
import { logoutAdmin } from '../../store/slices/authSlice';
import { showSuccessNotification } from '../../store/slices/uiSlice';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { concerts, loading: concertsLoading } = useAppSelector((state) => state.concerts);
  const { organizers, loading: organizersLoading } = useAppSelector((state) => state.organizers);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch initial data
    dispatch(fetchConcerts({ page: 1, limit: 5 }));
    dispatch(fetchOrganizers({ page: 1, limit: 5 }));
  }, [isAuthenticated, dispatch, router]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      dispatch(showSuccessNotification({
        title: 'Logged Out',
        message: 'You have been successfully logged out.'
      }));
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '0.5rem 1rem', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Concerts Section */}
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h2>Recent Concerts</h2>
          {concertsLoading ? (
            <p>Loading concerts...</p>
          ) : (
            <div>
              <p>Total Concerts: {concerts.length}</p>
              {concerts.slice(0, 3).map((concert) => (
                <div key={concert.id} style={{ 
                  padding: '0.5rem', 
                  marginBottom: '0.5rem', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <h4>{concert.name}</h4>
                  <p>Date: {new Date(concert.date).toLocaleDateString()}</p>
                  <p>Status: {concert.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Organizers Section */}
        <div style={{ 
          padding: '1.5rem', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <h2>Organizers</h2>
          {organizersLoading ? (
            <p>Loading organizers...</p>
          ) : (
            <div>
              <p>Total Organizers: {organizers.length}</p>
              {organizers.slice(0, 3).map((organizer) => (
                <div key={organizer.id} style={{ 
                  padding: '0.5rem', 
                  marginBottom: '0.5rem', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <h4>{organizer.name}</h4>
                  <p>Email: {organizer.email}</p>
                  <p>Status: {organizer.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Quick Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h4>Total Concerts</h4>
            <p style={{ fontSize: '2rem', color: '#007bff' }}>{concerts.length}</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h4>Active Organizers</h4>
            <p style={{ fontSize: '2rem', color: '#28a745' }}>
              {organizers.filter(o => o.status === 'active').length}
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h4>Pending Approvals</h4>
            <p style={{ fontSize: '2rem', color: '#ffc107' }}>
              {organizers.filter(o => o.status === 'pending').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
