import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const today = () => new Date().toISOString().slice(0, 10);

export default function RoomsPage({ notify }) {
  const [date, setDate] = useState(today());
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // add-room form
  const [form, setForm] = useState({ room_number: "", room_type: "Single", price_per_night: "", description: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // booking form
  const [booking, setBooking] = useState({ room_id: "", guest_name: "", guest_email: "" });
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setRooms(await api.listRooms(date));
    } catch (e) {
      notify({ type: "error", message: e.message });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [date]);

  async function addRoom(e) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await api.createRoom({
        ...form,
        price_per_night: Number(form.price_per_night),
      });
      notify({ type: "success", message: `Room ${form.room_number} added.` });
      setForm({ room_number: "", room_type: "Single", price_per_night: "", description: "" });
      load();
    } catch (e) {
      if (e.fields) setErrors(e.fields);
      else setErrors({ _: e.message });
      notify({ type: "error", message: e.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function submitBooking(e) {
    e.preventDefault();
    setBookingErrors({});
    setBookingSubmitting(true);
    try {
      await api.createBooking({ ...booking, booking_date: date });
      notify({ type: "success", message: "Booking confirmed!" });
      setBooking({ room_id: "", guest_name: "", guest_email: "" });
      load();
    } catch (e) {
      if (e.fields) setBookingErrors(e.fields);
      else setBookingErrors({ _: e.message });
      notify({ type: "error", message: e.message });
    } finally {
      setBookingSubmitting(false);
    }
  }

  const availableRooms = rooms.filter((r) => !r.is_booked);

  return (
    <>
      <div className="card">
        <h2>Rooms</h2>
        <div className="field" style={{ maxWidth: 240 }}>
          <label>View availability on date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : rooms.length === 0 ? (
          <p className="empty">No rooms yet. Add your first one below.</p>
        ) : (
          <div className="grid">
            {rooms.map((r) => (
              <div key={r.id} className={`room ${r.is_booked ? "booked" : ""}`}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>Room {r.room_number}</strong>
                  <span className={`badge ${r.is_booked ? "danger" : "success"}`}>
                    {r.is_booked ? "Booked" : "Available"}
                  </span>
                </div>
                <div className="muted">{r.room_type} · ${r.price_per_night}/night</div>
                {r.description && <p style={{ fontSize: 13 }}>{r.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Book a Room</h2>
        <p className="muted">Booking date: <strong>{date}</strong> (change above)</p>
        <form onSubmit={submitBooking}>
          <div className="row">
            <div className="field">
              <label>Room</label>
              <select
                value={booking.room_id}
                onChange={(e) => setBooking({ ...booking, room_id: e.target.value })}
              >
                <option value="">Select an available room…</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number} — {r.room_type} (${r.price_per_night})
                  </option>
                ))}
              </select>
              {bookingErrors.room_id && <div className="field-error">{bookingErrors.room_id}</div>}
              {availableRooms.length === 0 && (
                <div className="muted" style={{ marginTop: 4 }}>No rooms available for this date.</div>
              )}
            </div>
            <div className="field">
              <label>Guest name</label>
              <input
                value={booking.guest_name}
                onChange={(e) => setBooking({ ...booking, guest_name: e.target.value })}
              />
              {bookingErrors.guest_name && <div className="field-error">{bookingErrors.guest_name}</div>}
            </div>
            <div className="field">
              <label>Guest email</label>
              <input
                type="email"
                value={booking.guest_email}
                onChange={(e) => setBooking({ ...booking, guest_email: e.target.value })}
              />
              {bookingErrors.guest_email && <div className="field-error">{bookingErrors.guest_email}</div>}
            </div>
          </div>
          {bookingErrors._ && <div className="field-error">{bookingErrors._}</div>}
          <button className="primary" disabled={bookingSubmitting}>
            {bookingSubmitting ? "Booking…" : "Confirm booking"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Add a Room</h2>
        <form onSubmit={addRoom}>
          <div className="row">
            <div className="field">
              <label>Room number</label>
              <input
                value={form.room_number}
                onChange={(e) => setForm({ ...form, room_number: e.target.value })}
              />
              {errors.room_number && <div className="field-error">{errors.room_number}</div>}
            </div>
            <div className="field">
              <label>Type</label>
              <select
                value={form.room_type}
                onChange={(e) => setForm({ ...form, room_type: e.target.value })}
              >
                <option>Single</option>
                <option>Double</option>
                <option>Suite</option>
              </select>
            </div>
            <div className="field">
              <label>Price per night ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price_per_night}
                onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
              />
              {errors.price_per_night && <div className="field-error">{errors.price_per_night}</div>}
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          {errors._ && <div className="field-error">{errors._}</div>}
          <button className="primary" disabled={submitting}>
            {submitting ? "Adding…" : "Add room"}
          </button>
        </form>
      </div>
    </>
  );
}
