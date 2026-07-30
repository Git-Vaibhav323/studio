'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import ProjectForm from '../components/ProjectForm';
import toast from 'react-hot-toast';

export default function EditProjectPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      toast.error('Error fetching project');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--cream-warm)',
          borderTop: '3px solid var(--gold)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Project not found</h2>
        <p>The project you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          Edit Project
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Update project details and portfolio information
        </p>
      </div>
      
      <ProjectForm initialData={project} isEditing={true} />
    </div>
  );
}