-- =============================================================================
-- HMS — Convert existing prices from the old USD base to the new INR base.
-- Run ONCE, only if you created rooms while prices were treated as USD.
-- New rooms are entered directly in INR, so they should NOT be re-run through
-- this.
--
-- Uses a fixed approximate rate; tweak USD_TO_INR below before running if you
-- want a different rate. This keeps each room's displayed price roughly the
-- same (old display already multiplied USD by the live rate).
-- =============================================================================

-- rooms.price was stored in USD; multiply to INR.
update public.rooms
set price = round(price * 83);

-- NOTE: historical bookings keep their original (USD-era) snapshot amounts.
-- They're past records; new bookings compute correctly from the INR room price.
-- If you have throwaway test bookings, you can clear them instead:
--   delete from public.bookings where status in ('pending');
