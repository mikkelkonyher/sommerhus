import React, { useState } from 'react';
import { format, isWithinInterval, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';
import { CircleDot, CheckCircle2, XCircle, Calendar, Trash2, Edit2, Filter, X, ClipboardCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { CheckoutChecklist } from './CheckoutChecklist';

export function BookingList({ bookings, onUpdate, userEmail }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, bookingId: null });
  const [checklistBooking, setChecklistBooking] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterEmail, setFilterEmail] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterSharedOnly, setFilterSharedOnly] = useState(false);

  // Filter only future bookings and sort by date
  let futureBookings = bookings
    .filter(b => new Date(b.end_date) >= new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  // Apply filters
  if (filterEmail) {
    futureBookings = futureBookings.filter(b => 
      b.guest_email.toLowerCase().includes(filterEmail.toLowerCase())
    );
  }

  if (filterStartDate) {
    futureBookings = futureBookings.filter(b => 
      new Date(b.start_date) >= new Date(filterStartDate)
    );
  }

  if (filterEndDate) {
    futureBookings = futureBookings.filter(b => 
      new Date(b.end_date) <= new Date(filterEndDate)
    );
  }

  if (filterSharedOnly) {
    futureBookings = futureBookings.filter(b => b.allow_other_family === true);
  }

  const clearFilters = () => {
    setFilterEmail('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterSharedOnly(false);
  };

  const hasActiveFilters = filterEmail || filterStartDate || filterEndDate || filterSharedOnly;

  const handleDeleteClick = (id) => {
    setDeleteConfirm({ isOpen: true, bookingId: id });
  };

  const handleDeleteConfirm = () => {
    const { bookingId } = deleteConfirm;
    
    supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .then(({ error }) => {
        if (error) {
          console.error('Error deleting booking:', error);
          alert('Der skete en fejl ved sletning.');
        } else {
          onUpdate();
        }
        setDeleteConfirm({ isOpen: false, bookingId: null });
      });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, bookingId: null });
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    setEditName(booking.guest_name);
  };

  const handleSaveEdit = async (id) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ guest_name: editName })
        .eq('id', id);

      if (error) throw error;
      setEditingId(null);
      onUpdate();
    } catch (err) {
      console.error('Error updating booking:', err);
      alert('Der skete en fejl ved opdatering.');
    }
  };

  return (
    <div>
      {/* Filter Section */}
      <div className="border-b border-border-muted p-4 bg-canvas-subtle">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm font-medium text-fg-default hover:text-accent-fg"
          >
            <Filter className="h-4 w-4" />
            <span>Filtrer bookinger</span>
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-xs text-fg-muted hover:text-danger-fg"
            >
              <X className="h-3 w-3" />
              <span>Ryd filtre</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-fg-default mb-1">Email</label>
              <input
                type="text"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                placeholder="Søg efter email..."
                className="w-full text-sm rounded-md border border-border-default px-2 py-1.5 focus:border-accent-fg focus:ring-1 focus:ring-accent-fg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-default mb-1">Fra dato</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full text-sm rounded-md border border-border-default px-2 py-1.5 focus:border-accent-fg focus:ring-1 focus:ring-accent-fg"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-fg-default mb-1">Til dato</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full text-sm rounded-md border border-border-default px-2 py-1.5 focus:border-accent-fg focus:ring-1 focus:ring-accent-fg"
              />
            </div>

            <div className="flex items-center">
              <input
                id="filterShared"
                type="checkbox"
                checked={filterSharedOnly}
                onChange={(e) => setFilterSharedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border-default text-accent-fg focus:ring-accent-fg"
              />
              <label htmlFor="filterShared" className="ml-2 text-sm text-fg-default">
                Kun delte bookinger
              </label>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-3 text-xs text-fg-muted">
            Viser {futureBookings.length} booking{futureBookings.length !== 1 ? 'er' : ''}
          </div>
        )}
      </div>

      {/* Booking List */}
      {futureBookings.length === 0 ? (
        <div className="text-center p-8 text-fg-muted">
          <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>{hasActiveFilters ? 'Ingen bookinger matcher dine filtre.' : 'Ingen kommende bookinger.'}</p>
        </div>
      ) : (
        <div className="divide-y divide-border-muted">
      {futureBookings.map((booking) => {
        const isOwner = booking.guest_email === userEmail;
        const isEditing = editingId === booking.id;

        return (
          <div key={booking.id} className="p-3 sm:p-4 hover:bg-canvas-subtle transition-colors">
            <div className="flex items-start space-x-3">
              <div className="mt-0.5 flex-shrink-0">
                {booking.status === 'confirmed' ? (
                  <CheckCircle2 className="h-5 w-5 text-success-fg" />
                ) : booking.status === 'cancelled' ? (
                  <XCircle className="h-5 w-5 text-danger-fg" />
                ) : (
                  <CircleDot className="h-5 w-5 text-attention-fg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {/* Mobile: Stack layout */}
                <div className="block sm:hidden space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-fg-default">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-border-default rounded px-2 py-1 text-sm w-full"
                          autoFocus
                        />
                      ) : (
                        booking.guest_name
                      )}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-canvas-subtle border border-border-default text-fg-muted flex-shrink-0">
                      #{booking.id}
                    </span>
                  </div>
                  
                  <div className="text-xs text-fg-default">
                    {format(new Date(booking.start_date), 'd. MMM', { locale: da })} - {format(new Date(booking.end_date), 'd. MMM yyyy', { locale: da })}
                    {booking.guest_count > 1 && (
                      <span className="ml-2 text-fg-muted">({booking.guest_count} personer)</span>
                    )}
                    {booking.allow_other_family && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-success-fg/10 text-success-fg border border-success-fg/20">
                        Delt
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-fg-muted">
                    <span>{booking.guest_email}</span>
                    <div className="flex items-center space-x-2">
                      {/* Checklist - visible to everyone */}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setChecklistBooking(booking)}
                          className="text-accent-fg hover:text-accent-fg/80"
                          title="Tjekliste"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Edit/Delete - only for owner */}
                      {isOwner && booking.status === 'confirmed' && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(booking.id)}
                                className="text-success-fg hover:text-success-fg/80 text-xs"
                              >
                                Gem
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-fg-muted hover:text-fg-default text-xs"
                              >
                                Annuller
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(booking)}
                                className="text-accent-fg hover:text-accent-fg/80"
                                title="Rediger"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(booking.id)}
                                className="text-danger-fg hover:text-danger-fg/80"
                                title="Slet booking"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop: Inline layout */}
                <div className="hidden sm:block">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-fg-default truncate">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-border-default rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                      ) : (
                        <>
                          {booking.guest_name} <span className="font-normal text-fg-muted">bookede</span> {format(new Date(booking.start_date), 'd. MMM', { locale: da })} - {format(new Date(booking.end_date), 'd. MMM yyyy', { locale: da })}
                          {booking.guest_count > 1 && (
                            <span className="ml-2 text-xs text-fg-muted">({booking.guest_count} personer)</span>
                          )}
                          {booking.allow_other_family && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success-fg/10 text-success-fg border border-success-fg/20">
                              Delt
                            </span>
                          )}
                        </>
                      )}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-canvas-subtle border border-border-default text-fg-muted">
                      #{booking.id}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-fg-muted">
                    <div>
                      <span>Oprettet {format(new Date(booking.created_at), 'd. MMM yyyy', { locale: da })}</span>
                      <span className="mx-1">&middot;</span>
                      <span>{booking.guest_email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Checklist - visible to everyone */}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => setChecklistBooking(booking)}
                          className="text-accent-fg hover:text-accent-fg/80"
                          title="Tjekliste"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Edit/Delete - only for owner */}
                      {isOwner && booking.status === 'confirmed' && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(booking.id)}
                                className="text-success-fg hover:text-success-fg/80"
                              >
                                Gem
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-fg-muted hover:text-fg-default"
                              >
                                Annuller
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(booking)}
                                className="text-accent-fg hover:text-accent-fg/80"
                                title="Rediger"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(booking.id)}
                                className="text-danger-fg hover:text-danger-fg/80"
                                title="Slet booking"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
        </div>
      )}
      
      {checklistBooking && (
        <CheckoutChecklist
          booking={checklistBooking}
          onClose={() => setChecklistBooking(null)}
          onUpdate={onUpdate}
        />
      )}
      
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Slet booking"
        message="Er du sikker på at du vil slette denne booking? Denne handling kan ikke fortrydes."
      />
    </div>
  );
}
