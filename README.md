# Hotel Booking System

Simple hotel booking app: add rooms, book a room for a date, view booking history. Prevents double-booking both in the UI and the backend.

## Tech Stack

- **Frontend**: React 18 + Vite, plain CSS
- **Backend**: Node.js + Express (REST API)
- **Database**: SQLite via `better-sqlite3` (file: `server/hotel.db`)

## Project Structure

```
/server   Express API + SQLite
/client   React (Vite) frontend
```

## Setup & Run

Requires Node.js 18+.

### 1. Backend

```bash
cd server
npm install
npm run seed   # one-time: inserts sample rooms
npm run dev    # starts API on http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd client
npm install
npm run dev    # starts UI on http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:4000`, so no extra config is needed.

## API Endpoints

| Method | Path                                  | Description                                          |
| ------ | -------------------------------------- | ----------------------------------------------------- |
| GET    | `/api/rooms?date=YYYY-MM-DD`           | List rooms; each includes `is_booked` for the date.   |
| POST   | `/api/rooms`                           | Create a room. Body: `room_number, room_type, price_per_night, description`. |
| GET    | `/api/bookings?guest=&room_number=`    | List bookings (newest first), optional filters.       |
| POST   | `/api/bookings`                        | Create booking. Body: `room_id, guest_name, guest_email, booking_date`. |
| GET    | `/health`                              | Health check.                                          |

### HTTP status codes

- `400` validation error (response includes a `fields` map)
- `404` room not found
- `409` duplicate room number / double-booking
- `500` server error

## Double-Booking Prevention

Enforced in three layers:

1. **Database**: `UNIQUE (room_id, booking_date)` constraint on `bookings`.
2. **API**: Explicit pre-insert check in the booking controller, returning `409` with the message `Room X is already booked on YYYY-MM-DD`.
3. **UI**: Booked rooms are visually greyed out on the selected date and excluded from the booking dropdown.

### Manual verification

```bash
# Book room 1 for 2026-06-20
curl -X POST localhost:4000/api/bookings -H "Content-Type: application/json" \
  -d '{"room_id":1,"guest_name":"Jane","guest_email":"j@x.com","booking_date":"2026-06-20"}'

# Try again — should return 409
curl -X POST localhost:4000/api/bookings -H "Content-Type: application/json" \
  -d '{"room_id":1,"guest_name":"John","guest_email":"k@x.com","booking_date":"2026-06-20"}'
```

## Assumptions

- One booking per room per calendar date (no time slots, no multi-night ranges).
- Single property; no multi-hotel support.
- No authentication, no payments.
- Email validated by format only (no verification email sent).
- Seed script is idempotent (uses `INSERT OR IGNORE` on `room_number`).
