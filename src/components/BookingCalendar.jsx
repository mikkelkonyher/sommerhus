import React, { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { addMonths, isSameDay, isBefore, startOfToday, startOfDay, startOfYear, eachMonthOfInterval, format, isWithinInterval, eachDayOfInterval, endOfMonth, startOfMonth, getYear } from 'date-fns';
import { da } from 'date-fns/locale';
import { Calendar, Grid } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export function BookingCalendar({ bookings, onSelectDate, selectedRange }) {
  const today = startOfToday();
  const [month, setMonth] = useState(today);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'year'
  const [year, setYear] = useState(getYear(today));

  // Convert bookings to disabled days
  // Normalize dates to start of day to avoid timezone issues
  const disabledDays = bookings
    .filter(b => b.status === 'confirmed')
    .map(b => ({
      from: startOfDay(new Date(b.start_date)),
      to: startOfDay(new Date(b.end_date))
    }));

  // Add past dates to disabled days
  disabledDays.push({ from: new Date(0), to: new Date(today.getTime() - 86400000) });

  const footer = selectedRange?.from ? (
    <p className="mt-4 text-center text-fg-default text-xs sm:text-sm px-2">
      {selectedRange.to
        ? selectedRange.from.getTime() === selectedRange.to.getTime()
          ? selectedRange.from.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
          : `${selectedRange.from.toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })} - ${selectedRange.to.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : selectedRange.from.toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}
    </p>
  ) : (
    <p className="mt-4 text-center text-fg-muted text-xs sm:text-sm px-2">Vælg dato</p>
  );

  // Get all booked dates for quick lookup
  const bookedDates = useMemo(() => {
    const dates = new Set();
    bookings
      .filter(b => b.status === 'confirmed')
      .forEach(booking => {
        const start = startOfDay(new Date(booking.start_date));
        const end = startOfDay(new Date(booking.end_date));
        const days = eachDayOfInterval({ start, end });
        days.forEach(day => {
          dates.add(format(day, 'yyyy-MM-dd'));
        });
      });
    return dates;
  }, [bookings]);

  // Custom modifiers to show who booked - mark in red
  const modifiers = {};
  const modifiersStyles = {};
  
  bookings.forEach(booking => {
    if (booking.status === 'confirmed') {
      const key = `booking_${booking.id}`;
      modifiers[key] = {
        from: startOfDay(new Date(booking.start_date)),
        to: startOfDay(new Date(booking.end_date))
      };
      modifiersStyles[key] = {
        color: '#ffffff',
        backgroundColor: '#dc2626', // Red background for booked dates
        fontWeight: 'bold',
        border: '1px solid #b91c1c'
      };
    }
  });

  // Year view component
  const renderYearView = () => {
    const yearStart = startOfYear(new Date(year, 0, 1));
    const months = eachMonthOfInterval({
      start: yearStart,
      end: new Date(year, 11, 31)
    });

    const weekDays = ['S', 'M', 'T', 'O', 'T', 'F', 'L'];

    return (
      <div className="w-full max-w-full">
        {/* Year selector */}
        <div className="flex items-center justify-between mb-4 px-2 max-w-md mx-auto">
          <button
            onClick={() => setYear(year - 1)}
            className="px-3 py-1.5 text-sm font-medium text-fg-default hover:bg-canvas-subtle rounded-md transition-colors"
            aria-label="Forrige år"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold text-fg-default">{year}</h3>
          <button
            onClick={() => setYear(year + 1)}
            className="px-3 py-1.5 text-sm font-medium text-fg-default hover:bg-canvas-subtle rounded-md transition-colors"
            aria-label="Næste år"
          >
            →
          </button>
        </div>

        {/* Grid of months - consistent spacing and alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((monthDate) => {
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
            const firstDayOfWeek = monthStart.getDay();
            
            // Create calendar grid
            const calendarDays = [];
            // Add empty cells for days before month starts
            for (let i = 0; i < firstDayOfWeek; i++) {
              calendarDays.push(null);
            }
            // Add actual days
            daysInMonth.forEach(day => {
              calendarDays.push(day);
            });

            return (
              <div key={format(monthDate, 'yyyy-MM')} className="border border-border-default rounded-lg p-3 bg-canvas-default w-full">
                <h4 className="text-sm font-semibold text-fg-default mb-2 text-center">
                  {format(monthDate, 'MMMM', { locale: da })}
                </h4>
                
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {weekDays.map((day, idx) => (
                    <div key={idx} className="text-xs text-center text-fg-muted font-medium py-0.5">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-0.5">
                  {calendarDays.map((day, idx) => {
                    if (!day) {
                      return <div key={idx} className="aspect-square w-full" />;
                    }
                    
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const isBooked = bookedDates.has(dayStr);
                    const isPast = day < today;
                    const isToday = isSameDay(day, today);
                    const isSelected = selectedRange?.from && isSameDay(day, selectedRange.from) ||
                                      (selectedRange?.to && isSameDay(day, selectedRange.to)) ||
                                      (selectedRange?.from && selectedRange?.to && 
                                       day >= selectedRange.from && day <= selectedRange.to);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!isPast && !isBooked) {
                            if (!selectedRange?.from || (selectedRange.from && selectedRange.to)) {
                              onSelectDate({ from: day, to: undefined });
                            } else if (selectedRange.from && !selectedRange.to) {
                              if (day < selectedRange.from) {
                                onSelectDate({ from: day, to: selectedRange.from });
                              } else {
                                onSelectDate({ from: selectedRange.from, to: day });
                              }
                            }
                          } else if (isBooked) {
                            const booking = bookings.find(b => {
                              if (b.status !== 'confirmed') return false;
                              const start = startOfDay(new Date(b.start_date));
                              const end = startOfDay(new Date(b.end_date));
                              return day >= start && day <= end;
                            });
                            if (booking) {
                              alert(`Booket af: ${booking.guest_name}`);
                            }
                          }
                        }}
                        disabled={isPast || isBooked}
                        className={`
                          aspect-square w-full text-xs font-medium rounded transition-all
                          flex items-center justify-center
                          ${isPast 
                            ? 'text-fg-muted cursor-not-allowed opacity-50' 
                            : isBooked
                            ? 'bg-red-600 text-white font-bold cursor-pointer hover:bg-red-700 border border-red-700'
                            : isSelected
                            ? 'bg-blue-600 text-white font-semibold hover:bg-blue-700'
                            : isToday
                            ? 'bg-blue-100 text-blue-700 font-bold border-2 border-blue-600 hover:bg-blue-200'
                            : 'text-fg-default hover:bg-canvas-subtle hover:border-border-default border border-transparent'
                          }
                        `}
                        title={isBooked ? `Booket: ${format(day, 'd. MMM yyyy', { locale: da })}` : format(day, 'd. MMM yyyy', { locale: da })}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* View toggle */}
      <div className="flex items-center justify-center mb-4 sm:mb-6 lg:mb-8">
        <div className="inline-flex rounded-lg border border-border-default bg-canvas-subtle p-1 shadow-sm">
          <button
            onClick={() => setViewMode('month')}
            className={`
              flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-md transition-all
              ${viewMode === 'month'
                ? 'bg-canvas-default text-fg-default shadow-sm'
                : 'text-fg-muted hover:text-fg-default'
              }
            `}
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Måned</span>
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`
              flex items-center space-x-2 px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium rounded-md transition-all
              ${viewMode === 'year'
                ? 'bg-canvas-default text-fg-default shadow-sm'
                : 'text-fg-muted hover:text-fg-default'
              }
            `}
          >
            <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>År</span>
          </button>
        </div>
      </div>

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

      {viewMode === 'month' ? (
        <div className="w-full flex justify-center">
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
               // Normalize dates for comparison
               const normalizedDay = startOfDay(day);
               const booking = bookings.find(b => {
                 if (b.status !== 'confirmed') return false;
                 const start = startOfDay(new Date(b.start_date));
                 const end = startOfDay(new Date(b.end_date));
                 return normalizedDay >= start && normalizedDay <= end;
               });
               if (booking) {
                 alert(`Booket af: ${booking.guest_name}`);
               }
            }}
          />
          {footer}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          {renderYearView()}
          {footer && (
            <div className="mt-4">
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
