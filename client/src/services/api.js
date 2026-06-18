const BASE = "/api";

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed");
    err.status = res.status;
    err.fields = data.fields;
    throw err;
  }
  return data;
}

export const api = {
  listRooms: (date) => request(`/rooms${date ? `?date=${date}` : ""}`),
  createRoom: (payload) => request("/rooms", { method: "POST", body: JSON.stringify(payload) }),
  listBookings: ({ guest, room_number } = {}) => {
    const q = new URLSearchParams();
    if (guest) q.set("guest", guest);
    if (room_number) q.set("room_number", room_number);
    const qs = q.toString();
    return request(`/bookings${qs ? `?${qs}` : ""}`);
  },
  createBooking: (payload) => request("/bookings", { method: "POST", body: JSON.stringify(payload) }),
};
