import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request) {
  try {
    const formData = await request.json();

    // ── Validate ───────────────────────────────────────────────────────────
    if (!formData.name || !formData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // ── 1. Save lead to Supabase ───────────────────────────────────────────
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{
          name:         formData.name,
          email:        formData.email,
          phone:        formData.phone        || null,
          project_type: formData.project      || null,
          location:     formData.location     || null,
          budget:       formData.budget       || null,
          timeline:     formData.timeline     || null,
          message:      formData.message      || null,
          source:       'website',
          status:       'new',
          priority:     'medium',
        }]);

      if (dbError && dbError.code !== '42P01') {
        console.error('Supabase insert error:', dbError);
        // Non-fatal — still send the email
      }
    }

    // ── 2. Send notification email via Resend ──────────────────────────────
    if (resend) {
      const toEmail   = process.env.RESEND_TO_EMAIL   || 'hello@thespatialedits.com';
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@thespatialedits.com';

      // Notification to studio
      await resend.emails.send({
        from:    `The Spatial Edit <${fromEmail}>`,
        to:      [toEmail],
        subject: `New Enquiry from ${formData.name}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;background:#f4ede0;border:1px solid rgba(180,144,79,0.3);">
            <h2 style="color:#8b7340;font-weight:400;margin-bottom:24px;border-bottom:1px solid rgba(180,144,79,0.3);padding-bottom:12px;">
              New Project Enquiry
            </h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1c1710;">
              <tr><td style="padding:8px 0;font-weight:600;width:130px;">Name</td><td style="padding:8px 0;">${formData.name}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600;">Email</td><td style="padding:8px 0;"><a href="mailto:${formData.email}" style="color:#b4904f;">${formData.email}</a></td></tr>
              ${formData.phone    ? `<tr><td style="padding:8px 0;font-weight:600;">Phone</td><td style="padding:8px 0;"><a href="tel:${formData.phone}" style="color:#b4904f;">${formData.phone}</a></td></tr>` : ''}
              ${formData.project  ? `<tr><td style="padding:8px 0;font-weight:600;">Project Type</td><td style="padding:8px 0;">${formData.project}</td></tr>` : ''}
              ${formData.location ? `<tr><td style="padding:8px 0;font-weight:600;">Location</td><td style="padding:8px 0;">${formData.location}</td></tr>` : ''}
              ${formData.budget   ? `<tr><td style="padding:8px 0;font-weight:600;">Budget</td><td style="padding:8px 0;">${formData.budget}</td></tr>` : ''}
              ${formData.timeline ? `<tr><td style="padding:8px 0;font-weight:600;">Timeline</td><td style="padding:8px 0;">${formData.timeline}</td></tr>` : ''}
              ${formData.message  ? `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">Message</td><td style="padding:8px 0;">${formData.message.replace(/\n/g,'<br/>')}</td></tr>` : ''}
            </table>
            <p style="margin-top:24px;font-size:12px;color:#7a7060;border-top:1px solid rgba(180,144,79,0.2);padding-top:12px;">
              Submitted via thespatialedits.com
            </p>
          </div>
        `,
      });

      // Auto-reply to client
      await resend.emails.send({
        from:    `The Spatial Edit <${fromEmail}>`,
        to:      [formData.email],
        subject: 'We received your enquiry — The Spatial Edit',
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;background:#f4ede0;border:1px solid rgba(180,144,79,0.3);">
            <h2 style="color:#8b7340;font-weight:400;margin-bottom:16px;">Thank you, ${formData.name}.</h2>
            <p style="color:#1c1710;font-size:15px;line-height:1.7;margin-bottom:16px;">
              We've received your enquiry and will get back to you within 24 hours.
            </p>
            <p style="color:#1c1710;font-size:15px;line-height:1.7;margin-bottom:24px;">
              In the meantime, feel free to explore our work or reach us directly at
              <a href="tel:+919100094547" style="color:#b4904f;">+91 91000 94547</a>.
            </p>
            <p style="color:#7a7060;font-size:13px;border-top:1px solid rgba(180,144,79,0.2);padding-top:16px;margin-top:8px;">
              The Spatial Edit &nbsp;·&nbsp; Interior Design Studio, Hyderabad
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll be in touch within 24 hours.",
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
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
