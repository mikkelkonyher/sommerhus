import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { addMonths, isSameDay, isBefore, startOfToday } from 'date-fns';
import { da } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

export function BookingCalendar({ bookings, onSelectDate, selectedRange }) {
  const today = startOfToday();
  const [month, setMonth] = useState(today);

  // Convert bookings to disabled days
  const disabledDays = bookings
    .filter(b => b.status === 'confirmed')
    .map(b => ({
      from: new Date(b.start_date),
      to: new Date(b.end_date)
    }));

  // Add past dates to disabled days
  disabledDays.push({ from: new Date(0), to: new Date(today.getTime() - 86400000) });

  const footer = selectedRange?.from ? (
    <p className="mt-4 text-center text-fg-default text-xs sm:text-sm px-2">
      {selectedRange.to
        ? `${selectedRange.from.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })} - ${selectedRange.to.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : `Fra: ${selectedRange.from.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}`}
    </p>
  ) : (
    <p className="mt-4 text-center text-fg-muted text-xs sm:text-sm px-2">Vælg periode</p>
  );

  // Custom modifiers to show who booked
  const modifiers = {};
  const modifiersStyles = {};
  
  bookings.forEach(booking => {
    if (booking.status === 'confirmed') {
      const key = `booking_${booking.id}`;
      modifiers[key] = {
        from: new Date(booking.start_date),
        to: new Date(booking.end_date)
      };
      modifiersStyles[key] = {
        color: '#57606a', // fg-muted
        backgroundColor: '#f6f8fa', // canvas-subtle
        textDecoration: 'line-through'
      };
    }
  });

  return (
    <div className="w-full flex justify-center">
      <style>{`
        .rdp {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #0969da;
          --rdp-background-color: #ddf4ff;
          margin: 0;
        }
        
        @media (max-width: 640px) {
          .rdp {
            --rdp-cell-size: 32px;
          }
        }
        
        .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]), .rdp-day_selected:active:not([disabled]), .rdp-day_selected:hover:not([disabled]) {
          background-color: var(--rdp-accent-color);
          color: white;
        }
        .rdp-day_today {
          font-weight: bold;
          color: #0969da;
        }
      `}</style>
      <DayPicker
        mode="range"
        selected={selectedRange}
        onSelect={onSelectDate}
        locale={da}
        disabled={disabledDays}
        min={1}
        month={month}
        onMonthChange={setMonth}
        fromMonth={today}
        toMonth={addMonths(today, 60)}
        captionLayout="dropdown"
        numberOfMonths={1}
        className="font-sans"
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        onDayClick={(day, modifiers) => {
           // Check if day is booked and alert who booked it
           const booking = bookings.find(b => 
             b.status === 'confirmed' && 
             day >= new Date(b.start_date) && 
             day <= new Date(b.end_date)
           );
           if (booking) {
             alert(`Booket af: ${booking.guest_name}`);
           }
        }}
      />
      {footer}
    </div>
  );
}
