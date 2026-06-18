import { db } from "../db/database.js";

export const BookingModel = {
  // List bookings joined with room info, newest first. Optional filters.
  list({ guest, roomNumber } = {}) {
    let sql = `
      SELECT b.id, b.guest_name, b.guest_email, b.booking_date, b.created_at,
             r.id AS room_id, r.room_number, r.room_type, r.price_per_night
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      WHERE 1=1
    `;
    const params = [];
    if (guest) {
      sql += " AND LOWER(b.guest_name) LIKE ?";
      params.push(`%${guest.toLowerCase()}%`);
    }
    if (roomNumber) {
      sql += " AND r.room_number LIKE ?";
      params.push(`%${roomNumber}%`);
    }
    sql += " ORDER BY datetime(b.created_at) DESC, b.id DESC";
    return db.prepare(sql).all(...params);
  },

  existsForRoomDate(room_id, booking_date) {
    return !!db
      .prepare("SELECT 1 FROM bookings WHERE room_id = ? AND booking_date = ?")
      .get(room_id, booking_date);
  },

  create({ room_id, guest_name, guest_email, booking_date }) {
    const info = db
      .prepare(
        "INSERT INTO bookings (room_id, guest_name, guest_email, booking_date) VALUES (?, ?, ?, ?)"
      )
      .run(room_id, guest_name, guest_email, booking_date);
    return db.prepare("SELECT * FROM bookings WHERE id = ?").get(info.lastInsertRowid);
  },
};
