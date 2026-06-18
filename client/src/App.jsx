import { useState } from "react";
import RoomsPage from "./pages/RoomsPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const [tab, setTab] = useState("rooms");
  const [toast, setToast] = useState(null);

  return (
    <>
      <header>
        <h1>🏨 Hotel Booking</h1>
        <nav>
          <button className={tab === "rooms" ? "active" : ""} onClick={() => setTab("rooms")}>
            Rooms & Booking
          </button>
          <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}>
            Booking History
          </button>
        </nav>
      </header>
      <div className="container">
        {tab === "rooms" ? <RoomsPage notify={setToast} /> : <BookingsPage notify={setToast} />}
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
