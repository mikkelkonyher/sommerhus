import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function BookingForm({ selectedRange, onSuccess, userEmail }) {
  const [name, setName] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [allowOtherFamily, setAllowOtherFamily] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRange?.from || !selectedRange?.to) {
      setError('Vælg venligst en periode først.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([
          {
            start_date: selectedRange.from,
            end_date: selectedRange.to,
            guest_name: name,
            guest_email: userEmail,
            guest_count: guestCount,
            allow_other_family: allowOtherFamily,
            status: 'confirmed'
          }
        ]);

      if (insertError) throw insertError;

      setName('');
      setGuestCount(1);
      setAllowOtherFamily(false);
      onSuccess();
      alert('Booking oprettet!');
    } catch (err) {
      console.error('Error booking:', err);
      setError('Der skete en fejl. Prøv igen senere.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-fg-default">Navn</label>
        <input
          type="text"
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border-default px-3 py-2 shadow-sm focus:border-accent-fg focus:ring-1 focus:ring-accent-fg sm:text-sm"
          placeholder="Hvem skal bo der?"
        />
      </div>

      <div>
        <label htmlFor="guestCount" className="block text-sm font-medium text-fg-default">Antal personer</label>
        <input
          type="number"
          id="guestCount"
          required
          min="1"
          max="20"
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border border-border-default px-3 py-2 shadow-sm focus:border-accent-fg focus:ring-1 focus:ring-accent-fg sm:text-sm"
        />
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
            Tillad andre familiemedlemmer
          </label>
          <p className="text-fg-muted text-xs">Andre kan også bruge huset i denne periode</p>
        </div>
      </div>

      {error && (
        <div className="text-danger-fg text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedRange?.from || !selectedRange?.to}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-btn-primary-bg hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-fg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Booker...' : 'Book nu'}
      </button>
      
      {!selectedRange?.from && (
        <p className="text-xs text-fg-muted text-center mt-2">Vælg datoer i kalenderen for at booke.</p>
      )}
    </form>
  );
}
