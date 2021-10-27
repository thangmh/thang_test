const express = require("express");
const router = express.Router();
const { createBooking } = require("../controllers/booking.controller");

// Get all
router.get("/all", (req, res) => {
});

// Post new
router.post("/booking", createBooking);

// Delete
router.delete("/delete/:id", (req, res) => {
});

// edit a todo
router.put("/edit", (req, res) => {

});

module.exports = router;
