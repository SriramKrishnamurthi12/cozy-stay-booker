import { RoomModel } from "../models/roomModel.js";

export function listRooms(req, res) {
  const { date } = req.query;
  const rooms = RoomModel.all();
  if (date) {
    const bookedIds = new Set(RoomModel.bookedRoomIdsForDate(date));
    return res.json(rooms.map((r) => ({ ...r, is_booked: bookedIds.has(r.id) })));
  }
  res.json(rooms.map((r) => ({ ...r, is_booked: false })));
}

export function createRoom(req, res) {
  const { room_number, room_type, price_per_night, description } = req.body ?? {};

  const errors = {};
  if (!room_number || String(room_number).trim() === "") errors.room_number = "Room number is required.";
  if (!room_type || String(room_type).trim() === "") errors.room_type = "Room type is required.";
  const price = Number(price_per_night);
  if (!Number.isFinite(price) || price <= 0) errors.price_per_night = "Price must be a positive number.";
  if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", fields: errors });

  if (RoomModel.findByNumber(String(room_number).trim())) {
    return res.status(409).json({ error: `Room number "${room_number}" already exists.` });
  }

  try {
    const room = RoomModel.create({
      room_number: String(room_number).trim(),
      room_type: String(room_type).trim(),
      price_per_night: price,
      description: description ? String(description).trim() : "",
    });
    res.status(201).json(room);
  } catch (e) {
    res.status(500).json({ error: "Failed to create room." });
  }
}
