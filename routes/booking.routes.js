const express = require('express');

const { createBooking, updateBookingStatus } = require('../controllers/booking.controller');

const router = express.Router();

router.post('/createbooking', createBooking);
router.put('/updatestatus/:bookingCode', updateBookingStatus);

module.exports = router;
