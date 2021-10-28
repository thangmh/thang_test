const express = require("express");
const router = express.Router();
const {
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
  getBookingById,
} = require("../controllers/booking.controller");
const {
  addBookingValidator,
  updateBookingValidator,
} = require("../validator/booking/booking.validation");

// Get all
router.get("/getbooking", getBooking);

// Get by id
router.get("/find/:id", getBookingById);

// Post new
router.post("/booking", addBookingValidator, createBooking);

// Delete
router.delete("/delete/:id", deleteBooking);

// edit a booking
router.put("/edit", updateBookingValidator, updateBooking);

module.exports = router;
