const express = require('express');

const { createBooking, updateBookingStatus, getBookingDetails } = require('../controllers/booking.controller');

const router = express.Router();

router.post('/createbooking', createBooking);
router.put('/updatestatus/:bookingCode', updateBookingStatus);
router.get('/details/:bookingCode', getBookingDetails);

module.exports = router;
