'use client';

export const dynamic = 'force-dynamic';

import ServiceForm from '../components/ServiceForm';

export default function NewServicePage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          New Service
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Create a new service offering with detailed information
        </p>
      </div>
      
      <ServiceForm />
    </div>
  );
}