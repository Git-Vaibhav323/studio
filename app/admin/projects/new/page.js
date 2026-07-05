'use client';

export const dynamic = 'force-dynamic';

import ProjectForm from '../components/ProjectForm';

export default function NewProjectPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          New Project
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Create a new project to showcase in your portfolio
        </p>
      </div>
      
      <ProjectForm />
    </div>
  );
}