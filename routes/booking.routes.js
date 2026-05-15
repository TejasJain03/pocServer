const express = require('express');

const { createBooking, updateBookingStatus, getBookingDetails, getFutureBookingsByContact, getNextSlotByBooking } = require('../controllers/booking.controller');

const router = express.Router();

router.post('/createbooking', createBooking);
router.put('/updatestatus/:bookingCode', updateBookingStatus);
router.get('/details/:bookingCode', getBookingDetails);
router.get('/future-bookings/:contactId', getFutureBookingsByContact);
router.get('/next-slot/:bookingCode', getNextSlotByBooking);

module.exports = router;
