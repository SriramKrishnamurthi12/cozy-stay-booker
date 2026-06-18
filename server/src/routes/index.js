import { Router } from "express";
import { listRooms, createRoom } from "../controllers/roomController.js";
import { listBookings, createBooking } from "../controllers/bookingController.js";

const router = Router();

router.get("/rooms", listRooms);
router.post("/rooms", createRoom);
router.get("/bookings", listBookings);
router.post("/bookings", createBooking);

export default router;
