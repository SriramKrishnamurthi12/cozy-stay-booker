import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function BookingsPage({ notify }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guest, setGuest] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  async function load() {
    setLoading(true);
    try {
      setBookings(await api.listBookings({ guest, room_number: roomNumber }));
    } catch (e) {
      notify({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="card">
      <h2>Booking History</h2>
      <form
        className="row"
        onSubmit={(e) => { e.preventDefault(); load(); }}
        style={{ marginBottom: 16 }}
      >
        <div className="field">
          <label>Search by guest name</label>
          <input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div className="field">
          <label>Filter by room number</label>
          <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="101" />
        </div>
        <div className="field" style={{ display: "flex", alignItems: "end" }}>
          <button className="primary" type="submit">Search</button>
        </div>
      </form>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="empty">No bookings yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Email</th>
              <th>Room</th>
              <th>Date</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.guest_name}</td>
                <td>{b.guest_email}</td>
                <td>Room {b.room_number} ({b.room_type})</td>
                <td>{b.booking_date}</td>
                <td>{b.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
