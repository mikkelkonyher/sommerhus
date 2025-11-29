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

export async function openICalendar(booking) {
  if (!booking) return;

  const { start_date, end_date, guest_name, start, end, name } = booking;
  
  // Handle both data formats (from DB or from local state in BookingForm)
  const startDate = start || new Date(start_date);
  const endDate = end || new Date(end_date);
  const guestName = name || guest_name;

  // iCal dates must be in format YYYYMMDD for all-day events
  const startStr = format(startDate, 'yyyyMMdd');
  
  // For all-day events, end date is exclusive, so we add 1 day
  const endPlusOne = new Date(endDate);
  endPlusOne.setDate(endPlusOne.getDate() + 1);
  const endStr = format(endPlusOne, 'yyyyMMdd');

  // Generate a timestamp for the DTSTAMP field (current time in UTC)
  const now = new Date();
  const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");

  // Create iCal content
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sommerhus Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${startStr}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `DTSTAMP:${timestamp}`,
    `SUMMARY:Sommerhus: ${guestName}`,
    'DESCRIPTION:Booking af sommerhus.',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const filename = `sommerhus-${guestName}-${startStr}.ics`;
  const file = new File([icalContent], filename, { type: 'text/calendar;charset=utf-8' });

  // Try using the Web Share API first (great for mobile)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Sommerhus Booking',
        text: 'Booking af sommerhus'
      });
      return;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      // If share fails (or user cancels), fall back to download
      // But if user cancelled, we might not want to download. 
      // However, usually AbortError means user cancelled.
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback: Create a blob and trigger download
  // The browser/OS will recognize the .ics file and open it with the default calendar app
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger the download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
