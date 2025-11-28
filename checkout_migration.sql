-- Add checkout checklist column to bookings table
ALTER TABLE bookings 
ADD COLUMN checkout_checklist jsonb DEFAULT '{"empty_trash": false, "lock_doors": false, "turn_on_alarm": false, "close_windows": false, "turn_off_heat": false, "clean_kitchen": false}'::jsonb;
