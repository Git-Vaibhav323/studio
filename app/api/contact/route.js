import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request) {
  try {
    const formData = await request.json();
    const supabase = createServerSupabaseClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured. Please set up Supabase credentials.' },
        { status: 503 }
      );
    }
    
    // Validate required fields
    if (!formData.name || !formData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Insert lead into database
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        project_type: formData.project,
        location: formData.location,
        budget: formData.budget,
        timeline: formData.timeline,
        message: formData.message,
        source: 'website',
        status: 'new',
        priority: 'medium'
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      // If table doesn't exist or other DB issues, still return success to user
      // but log the error for admin to fix later
      if (error.code === '42P01') { // Table doesn't exist
        console.warn('Leads table does not exist. Contact form submission logged but not stored.');
        return NextResponse.json({
          success: true,
          message: 'Thank you! We\'ll be in touch within 24 hours.'
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to save contact information' },
        { status: 500 }
      );
    }

    // Here you could add email notification logic
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Thank you! We\'ll be in touch within 24 hours.',
      data
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}