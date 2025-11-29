import React, { useState } from 'react';
import { format, startOfDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { openGoogleCalendar, openICalendar } from '../lib/calendar';

export function BookingForm({ selectedRange, onSuccess, userEmail }) {
  const [name, setName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [allowOtherFamily, setAllowOtherFamily] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRange?.from) {
      setError('Vælg venligst en dato først.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If only 'from' is selected, use it as both start and end date (single day booking)
      const endDate = selectedRange.to || selectedRange.from;
      
      // Format dates as date-only strings (YYYY-MM-DD) to avoid timezone issues
      // Use startOfDay to normalize to midnight local time, then format as date string
      const startDateStr = format(startOfDay(selectedRange.from), 'yyyy-MM-dd');
      const endDateStr = format(startOfDay(endDate), 'yyyy-MM-dd');
      
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([
          {
            start_date: startDateStr,
            end_date: endDateStr,
            guest_name: name,
            guest_email: userEmail,
            guest_count: guestCount,
            allow_other_family: allowOtherFamily,
            purpose: purpose || null,
            status: 'confirmed'
          }
        ]);

      if (insertError) throw insertError;

      // Store booking details for the success view
      setLastBooking({
        start: selectedRange.from,
        end: endDate,
        name: name
      });

      setName('');
      setGuestCount(1);
      setAllowOtherFamily(false);
      setPurpose('');
      // Don't call onSuccess immediately, let user see the success screen
    } catch (err) {
      console.error('Error booking:', err);
      setError('Der skete en fejl. Prøv igen senere.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCalendar = () => {
    if (!lastBooking) return;
    openGoogleCalendar(lastBooking);
  };

  const handleICalendar = () => {
    if (!lastBooking) return;
    openICalendar(lastBooking);
  };

  const handleCloseSuccess = () => {
    setLastBooking(null);
    onSuccess(); // Refresh parent
  };

  if (lastBooking) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="space-y-2">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-fg-default">Booking bekræftet!</h3>
          <p className="text-sm text-fg-muted">
            Din booking er registreret.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleCalendar}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
            </svg>
            Tilføj til Google Kalender
          </button>

          <button
            type="button"
            onClick={handleICalendar}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
               <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
            </svg>
            Tilføj til iCal
          </button>

          <button
            type="button"
            onClick={handleCloseSuccess}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-btn-primary-bg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg"
          >
            Luk
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-fg-default">Navn</label>
        <select
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border-default px-3 py-2 shadow-sm focus:border-accent-fg focus:ring-1 focus:ring-accent-fg sm:text-sm bg-white"
        >
          <option value="">Vælg navn...</option>
          <option value="Kurt">Kurt</option>
          <option value="Beth">Beth</option>
          <option value="Katrine">Katrine</option>
          <option value="Stefan">Stefan</option>
          <option value="Mina">Mina</option>
          <option value="Mikkel">Mikkel</option>
        </select>
      </div>

      <div>
        <label htmlFor="guestCount" className="block text-sm font-medium text-fg-default">Antal personer</label>
        <select
          id="guestCount"
          required
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border border-border-default px-3 py-2 shadow-sm focus:border-accent-fg focus:ring-1 focus:ring-accent-fg sm:text-sm bg-white"
        >
          {[...Array(20)].map((_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="allowOtherFamily"
            type="checkbox"
            checked={allowOtherFamily}
            onChange={(e) => setAllowOtherFamily(e.target.checked)}
            className="h-4 w-4 rounded border-border-default text-accent-fg focus:ring-accent-fg"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="allowOtherFamily" className="font-medium text-fg-default">
           Delt
          </label>
          <p className="text-fg-muted text-xs">Andre kan også bruge huset i denne periode</p>
        </div>
      </div>

      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-fg-default">Formål (valgfrit)</label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="f.eks. reparation af vandskade"
          rows={3}
          className="mt-1 block w-full rounded-md border border-border-default px-3 py-2 shadow-sm focus:border-accent-fg focus:ring-1 focus:ring-accent-fg sm:text-sm bg-white resize-none"
        />
      </div>

      {error && (
        <div className="text-danger-fg text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedRange?.from}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-btn-primary-bg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Booker...' : 'Book nu'}
      </button>
      
      {!selectedRange?.from && (
        <p className="text-xs text-fg-muted text-center mt-2">Vælg dato i kalenderen for at booke.</p>
      )}
    </form>
  );
}
