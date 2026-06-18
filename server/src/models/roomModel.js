import { db } from "../db/database.js";

export const RoomModel = {
  all() {
    return db.prepare("SELECT * FROM rooms ORDER BY room_number ASC").all();
  },
  findById(id) {
    return db.prepare("SELECT * FROM rooms WHERE id = ?").get(id);
  },
  findByNumber(room_number) {
    return db.prepare("SELECT * FROM rooms WHERE room_number = ?").get(room_number);
  },
  create({ room_number, room_type, price_per_night, description }) {
    const info = db
      .prepare(
        "INSERT INTO rooms (room_number, room_type, price_per_night, description) VALUES (?, ?, ?, ?)"
      )
      .run(room_number, room_type, price_per_night, description ?? "");
    return this.findById(info.lastInsertRowid);
  },
  bookedRoomIdsForDate(date) {
    const rows = db
      .prepare("SELECT DISTINCT room_id FROM bookings WHERE booking_date = ?")
      .all(date);
    return rows.map((r) => r.room_id);
  },
};
