export const MIN_BOOKING_LEAD_MINUTES = 5;

export function getMinimumBookingStartsAt(now = new Date()) {
  const minimumStartsAt = new Date(now);

  minimumStartsAt.setSeconds(0, 0);
  minimumStartsAt.setMinutes(
    minimumStartsAt.getMinutes() + MIN_BOOKING_LEAD_MINUTES,
  );

  return minimumStartsAt;
}
