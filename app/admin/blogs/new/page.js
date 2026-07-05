'use client';

export const dynamic = 'force-dynamic';

import BlogForm from '../components/BlogForm';

export default function NewBlogPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          New Blog Post
        </h1>
        <p style={{ color: 'var(--muted)' }}>
          Create a new blog post to share insights and expertise
        </p>
      </div>
      
      <BlogForm />
    </div>
  );
}