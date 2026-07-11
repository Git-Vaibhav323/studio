'use client';
import { useState } from 'react';
import Image from 'next/image';
import { createSupabaseClient } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import styles from './ContactForm.module.css';

export default function ContactForm() {
  const [form, setForm] = useState({ 
    name:'', phone:'', email:'', project:'', location:'', message:'' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createSupabaseClient();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: form.name,
          email: form.email,
          phone: form.phone,
          project_type: form.project,
          location: form.location,
          message: form.message,
          source: 'website',
          status: 'new',
          priority: 'medium'
        }]);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Thank you! We\'ll be in touch soon.');
      
      // Reset form after delay
      setTimeout(() => {
        setForm({ name:'', phone:'', email:'', project:'', location:'', message:'' });
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('There was an error submitting your form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className={styles.section}>
      <Toaster position="top-center" />
      <div className={styles.contactLabel}>Contact Us</div>
      {/* Top Bar and sidebar removed per design request */}
      <div className={styles.content}>
        <div className={styles.split}>
          <div className={styles.leftCol}>
            {/* Decorative image — hidden on desktop per request */}
            <div className={styles.vaseLine} aria-hidden="true" />
            <div className={styles.imgWrap}>
              <Image src="/images/vase_books.png" alt="vase and books" fill style={{ objectFit: 'cover', objectPosition: 'center bottom' }} />
            </div>
          </div>
          <div className={styles.rightCol}>
            <div className={styles.formHeader}>
              {/* form title removed per request */}
              <div className={styles.separatorCenter} style={{ marginTop: '16px', marginBottom: '32px' }}>
                <div className={styles.sepLine} />
                <div className={styles.sepDia}>
                  <svg viewBox="0 0 24 24"><path d="M12 0 C 12 10, 14 12, 24 12 C 14 12, 12 14, 12 24 C 12 14, 10 12, 0 12 C 10 12, 12 10, 12 0 Z" fill="var(--gold)"/></svg>
                </div>
                <div className={styles.sepLine} />
              </div>
            </div>
            {submitted ? (
              <div className={styles.thankYou}>
                <svg viewBox="0 0 24 24" stroke="var(--gold)" fill="none" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 15 9"/>
                </svg>
                <h3>Thank you!</h3>
                <p>We&apos;ll be in touch soon.</p>
              </div>
            ) : (
              <form className={styles.formGrid} onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <input type="text" name="name" className={styles.input} placeholder="Full Name" value={form.name} onChange={handleChange} required />
                  <div className={styles.icon}><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                </div>

                {/* Phone Number */}
                <div className={styles.formGroup}>
                  <input type="tel" name="phone" className={styles.input} placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
                  <div className={styles.icon}><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
                </div>

                {/* Email Address */}
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <input type="email" name="email" className={styles.input} placeholder="Email Address" value={form.email} onChange={handleChange} required />
                  <div className={styles.icon}><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                </div>

                {/* Project Type — dropdown */}
                <div className={styles.formGroup}>
                  <select name="project" className={styles.input} value={form.project} onChange={handleChange} required>
                    <option value="" disabled>Project Type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                  <svg className={styles.selectArrow} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>

                {/* Location — text input */}
                <div className={styles.formGroup}>
                  <input type="text" name="location" className={styles.input} placeholder="Enter your location" value={form.location} onChange={handleChange} />
                  <div className={styles.icon}><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                </div>

                {/* Project Description */}
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <textarea name="message" className={`${styles.input} ${styles.textarea}`} placeholder="Tell us about your project (project size, location, budget, design preferences, and any specific requirements)." value={form.message} onChange={handleChange} />
                  <div className={styles.icon}><svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                </div>

                {/* Submit */}
                <div className={`${styles.formGroup} ${styles.full}`}>
                  <button type="submit" disabled={submitting} className={styles.submitBtn}>
                    {submitting ? 'SENDING...' : 'RAISE A REQUEST'}
                    <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      
    </section>
  );
}
