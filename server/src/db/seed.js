import { db } from "./database.js";

const rooms = [
  { room_number: "101", room_type: "Single", price_per_night: 89, description: "Cozy single room with city view." },
  { room_number: "102", room_type: "Single", price_per_night: 89, description: "Quiet single room facing the courtyard." },
  { room_number: "201", room_type: "Double", price_per_night: 139, description: "Spacious double room with balcony." },
  { room_number: "202", room_type: "Double", price_per_night: 145, description: "Modern double with king bed." },
  { room_number: "301", room_type: "Suite", price_per_night: 259, description: "Executive suite with lounge area." },
];

const insert = db.prepare(
  "INSERT OR IGNORE INTO rooms (room_number, room_type, price_per_night, description) VALUES (?, ?, ?, ?)"
);

const tx = db.transaction((rs) => {
  for (const r of rs) insert.run(r.room_number, r.room_type, r.price_per_night, r.description);
});
tx(rooms);

console.log(`Seeded ${rooms.length} rooms (existing rooms preserved).`);
process.exit(0);
