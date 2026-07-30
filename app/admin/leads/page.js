'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { Search, Filter, Eye, Trash2, Phone, Mail, MessageSquare, Calendar, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import styles from './Leads.module.css';

export default function LeadsManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Leads table not found or accessible:', error);
        setLeads([]);
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteLead = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLeads(leads.filter(l => l.id !== id));
      setSelectedLead(null);
      toast.success('Lead deleted successfully');
    } catch (error) {
      toast.error('Error deleting lead');
      console.error('Error:', error);
    }
  };

  const updateLeadStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setLeads(leads.map(l => 
        l.id === id ? { ...l, status } : l
      ));
      
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status });
      }
      
      toast.success(`Lead marked as ${status}`);
    } catch (error) {
      toast.error('Error updating lead status');
      console.error('Error:', error);
    }
  };

  const updateLeadPriority = async (id, priority) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ priority })
        .eq('id', id);

      if (error) throw error;
      
      setLeads(leads.map(l => 
        l.id === id ? { ...l, priority } : l
      ));
      
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, priority });
      }
      
      toast.success(`Priority updated to ${priority}`);
    } catch (error) {
      toast.error('Error updating priority');
      console.error('Error:', error);
    }
  };

  const addNotes = async (id, notes) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          notes,
          followed_up_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      const updatedLead = { ...selectedLead, notes, followed_up_at: new Date().toISOString() };
      setLeads(leads.map(l => 
        l.id === id ? updatedLead : l
      ));
      setSelectedLead(updatedLead);
      
      toast.success('Notes updated successfully');
    } catch (error) {
      toast.error('Error updating notes');
      console.error('Error:', error);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Leads Management</h1>
          <p>Track and manage potential client inquiries</p>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search leads by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.filterBox}>
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className={styles.filterBox}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Leads List */}
        <div className={styles.leadsList}>
          {filteredLeads.length === 0 ? (
            <div className={styles.empty}>
              <h3>No leads found</h3>
              <p>Leads from your contact form will appear here.</p>
            </div>
          ) : (
            <div className={styles.leadsGrid}>
              {filteredLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className={`${styles.leadCard} ${selectedLead?.id === lead.id ? styles.selected : ''}`}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className={styles.leadHeader}>
                    <div className={styles.leadMeta}>
                      <span className={`${styles.statusBadge} ${styles[lead.status]}`}>
                        {lead.status}
                      </span>
                      <span className={`${styles.priorityBadge} ${styles[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </div>
                    <div className={styles.leadDate}>
                      <Calendar size={14} />
                      {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <h3 className={styles.leadName}>{lead.name}</h3>
                  
                  <div className={styles.leadContact}>
                    {lead.email && (
                      <div className={styles.contactItem}>
                        <Mail size={14} />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className={styles.contactItem}>
                        <Phone size={14} />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.leadDetails}>
                    {lead.project_type && (
                      <div className={styles.detailItem}>
                        <strong>Project:</strong> {lead.project_type}
                      </div>
                    )}
                    {lead.location && (
                      <div className={styles.detailItem}>
                        <strong>Location:</strong> {lead.location}
                      </div>
                    )}
                    {lead.budget && (
                      <div className={styles.detailItem}>
                        <strong>Budget:</strong> {lead.budget}
                      </div>
                    )}
                  </div>

                  {lead.message && (
                    <div className={styles.leadMessage}>
                      <MessageSquare size={14} />
                      <p>{lead.message.substring(0, 100)}...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className={styles.leadDetail}>
            <div className={styles.detailHeader}>
              <h2>{selectedLead.name}</h2>
              <div className={styles.detailActions}>
                <button
                  onClick={() => deleteLead(selectedLead.id)}
                  className={styles.deleteButton}
                  title="Delete Lead"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className={styles.detailContent}>
              <div className={styles.statusControls}>
                <div className={styles.controlGroup}>
                  <label>Status</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                <div className={styles.controlGroup}>
                  <label>Priority</label>
                  <select
                    value={selectedLead.priority}
                    onChange={(e) => updateLeadPriority(selectedLead.id, e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className={styles.contactDetails}>
                <h3>Contact Information</h3>
                <div className={styles.contactGrid}>
                  <div className={styles.contactItem}>
                    <Mail size={16} />
                    <span>{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className={styles.contactItem}>
                      <Phone size={16} />
                      <span>{selectedLead.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.projectInfo}>
                <h3>Project Details</h3>
                <div className={styles.infoGrid}>
                  {selectedLead.project_type && (
                    <div className={styles.infoItem}>
                      <strong>Project Type:</strong>
                      <span>{selectedLead.project_type}</span>
                    </div>
                  )}
                  {selectedLead.location && (
                    <div className={styles.infoItem}>
                      <strong>Location:</strong>
                      <span>{selectedLead.location}</span>
                    </div>
                  )}
                  {selectedLead.budget && (
                    <div className={styles.infoItem}>
                      <strong>Budget:</strong>
                      <span>{selectedLead.budget}</span>
                    </div>
                  )}
                  {selectedLead.timeline && (
                    <div className={styles.infoItem}>
                      <strong>Timeline:</strong>
                      <span>{selectedLead.timeline}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedLead.message && (
                <div className={styles.messageSection}>
                  <h3>Message</h3>
                  <div className={styles.message}>
                    {selectedLead.message}
                  </div>
                </div>
              )}

              <div className={styles.notesSection}>
                <h3>Notes</h3>
                <textarea
                  value={selectedLead.notes || ''}
                  onChange={(e) => {
                    setSelectedLead({ ...selectedLead, notes: e.target.value });
                  }}
                  onBlur={(e) => addNotes(selectedLead.id, e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={4}
                  className={styles.notesInput}
                />
                {selectedLead.followed_up_at && (
                  <p className={styles.followUpDate}>
                    Last updated: {format(new Date(selectedLead.followed_up_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNumber}>{leads.length}</span>
          <span className={styles.statLabel}>Total Leads</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {leads.filter(l => l.status === 'new').length}
          </span>
          <span className={styles.statLabel}>New</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {leads.filter(l => l.status === 'qualified').length}
          </span>
          <span className={styles.statLabel}>Qualified</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNumber}>
            {leads.filter(l => l.status === 'converted').length}
          </span>
          <span className={styles.statLabel}>Converted</span>
        </div>
      </div>
    </div>
  );
}