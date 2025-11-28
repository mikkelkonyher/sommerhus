import { format } from 'date-fns';

export function openGoogleCalendar(booking) {
  if (!booking) return;

  const { start_date, end_date, guest_name, start, end, name } = booking;
  
  // Handle both data formats (from DB or from local state in BookingForm)
  const startDate = start || new Date(start_date);
  const endDate = end || new Date(end_date);
  const guestName = name || guest_name;

  // Google Calendar dates must be in format YYYYMMDD
  const startStr = format(startDate, 'yyyyMMdd');
  
  // For all-day events, end date is exclusive, so we add 1 day
  const endPlusOne = new Date(endDate);
  endPlusOne.setDate(endPlusOne.getDate() + 1);
  const endStr = format(endPlusOne, 'yyyyMMdd');

  const title = encodeURIComponent(`Sommerhus: ${guestName}`);
  const details = encodeURIComponent('Booking af sommerhus.');
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;

  window.open(url, '_blank');
}
