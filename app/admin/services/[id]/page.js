'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import ServiceForm from '../components/ServiceForm';
import LoadingScreen from '@/app/components/LoadingScreen';
import toast from 'react-hot-toast';

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createSupabaseClient();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchService();
  }, [params.id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Service not found');
          toast.error('Service not found');
          router.push('/admin/services');
          return;
        }
        throw error;
      }

      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to load service');
      toast.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        color: '#6b7280'
      }}>
        <h2 style={{ color: '#ef4444', margin: 0 }}>Error</h2>
        <p style={{ margin: 0 }}>{error}</p>
        <button
          onClick={() => router.push('/admin/services')}
          style={{
            padding: '12px 24px',
            background: '#d4af37',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Services
        </button>
      </div>
    );
  }

  if (!service) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '16px',
        color: '#6b7280'
      }}>
        <h2 style={{ color: '#374151', margin: 0 }}>Service Not Found</h2>
        <p style={{ margin: 0 }}>The service you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/admin/services')}
          style={{
            padding: '12px 24px',
            background: '#d4af37',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          Edit Service: {service.title}
        </h1>
        <p style={{
          color: '#6b7280',
          margin: '8px 0 0 0',
          fontSize: '14px'
        }}>
          Update service information and settings
        </p>
      </div>

      <ServiceForm 
        initialData={service}
        isEditing={true}
      />
    </div>
  );
}