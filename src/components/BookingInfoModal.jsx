import React from 'react';
import { X, Users, User, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { openGoogleCalendar } from '../lib/calendar';

export function BookingInfoModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-fg-default bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-canvas-default text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-border-default">
          <div className="bg-canvas-default px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold leading-6 text-fg-default">
                Booking Information
              </h3>
              <button
                onClick={onClose}
                className="text-fg-muted hover:text-fg-default transition-colors"
                aria-label="Luk"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Booking dates */}
              <div>
                <p className="text-sm font-medium text-fg-muted mb-1">Periode</p>
                <p className="text-base text-fg-default">
                  {format(new Date(booking.start_date), 'd. MMMM yyyy', { locale: da })} - {format(new Date(booking.end_date), 'd. MMMM yyyy', { locale: da })}
                </p>
              </div>

              {/* Who booked */}
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-fg-muted mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-fg-muted mb-1">Booket af</p>
                  <p className="text-base text-fg-default">{booking.guest_name}</p>
                </div>
              </div>

              {/* Number of guests */}
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-fg-muted mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-fg-muted mb-1">Antal personer</p>
                  <p className="text-base text-fg-default">{booking.guest_count}</p>
                </div>
              </div>

              {/* Allow other family members */}
              <div className="flex items-start space-x-3">
                {booking.allow_other_family ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-fg-muted mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium text-fg-muted mb-1">Tillad andre familiemedlemmer</p>
                  <p className="text-base text-fg-default">
                    {booking.allow_other_family ? 'Ja' : 'Nej'}
                  </p>
                </div>
              </div>

              {/* Purpose */}
              {booking.purpose && (
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-fg-muted mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-fg-muted mb-1">Formål</p>
                    <p className="text-base text-fg-default">{booking.purpose}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-canvas-subtle px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-btn-primary-bg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-btn-primary-hover-bg sm:w-auto"
            >
              Luk
            </button>
            <button
              type="button"
              onClick={() => openGoogleCalendar(booking)}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Tilføj til Google Kalender
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

