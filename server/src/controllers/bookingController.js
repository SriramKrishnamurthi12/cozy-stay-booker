import { BookingModel } from "../models/bookingModel.js";
import { RoomModel } from "../models/roomModel.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function listBookings(req, res) {
  const { guest, room_number } = req.query;
  res.json(BookingModel.list({ guest, roomNumber: room_number }));
}

export function createBooking(req, res) {
  const { room_id, guest_name, guest_email, booking_date } = req.body ?? {};

  const errors = {};
  const roomId = Number(room_id);
  if (!Number.isInteger(roomId) || roomId <= 0) errors.room_id = "Room is required.";
  if (!guest_name || String(guest_name).trim() === "") errors.guest_name = "Guest name is required.";
  if (!guest_email || !EMAIL_RE.test(String(guest_email).trim())) errors.guest_email = "Valid email is required.";
  if (!booking_date || !DATE_RE.test(String(booking_date))) errors.booking_date = "Valid date (YYYY-MM-DD) is required.";
  if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", fields: errors });

  const room = RoomModel.findById(roomId);
  if (!room) return res.status(404).json({ error: "Room not found." });

  // Explicit double-booking check (defense in depth; the DB also has a UNIQUE
  // constraint on (room_id, booking_date) that will reject any race condition).
  if (BookingModel.existsForRoomDate(roomId, booking_date)) {
    return res
      .status(409)
      .json({ error: `Room ${room.room_number} is already booked on ${booking_date}.` });
  }

  try {
    const booking = BookingModel.create({
      room_id: roomId,
      guest_name: String(guest_name).trim(),
      guest_email: String(guest_email).trim(),
      booking_date,
    });
    res.status(201).json({ ...booking, room_number: room.room_number, room_type: room.room_type });
  } catch (e) {
    // UNIQUE constraint backup catch
    if (String(e.message).includes("UNIQUE")) {
      return res
        .status(409)
        .json({ error: `Room ${room.room_number} is already booked on ${booking_date}.` });
    }
    res.status(500).json({ error: "Failed to create booking." });
  }
}
