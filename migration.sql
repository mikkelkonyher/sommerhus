-- Add new columns to bookings table
ALTER TABLE bookings 
ADD COLUMN guest_count integer DEFAULT 1 NOT NULL,
ADD COLUMN allow_other_family boolean DEFAULT false NOT NULL;

