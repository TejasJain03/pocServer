const Booking = require('../model/booking.model');
const Event = require('../model/event.model');

const createBooking = async (req, res) => {
    try {
        const { eventId, salesforceContactId, paymentStatus, paymentDate } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const amount = event.price;
        let voucherUsed = false;
        let voucherCode = null;
        let discountAmount = 0;
        let finalAmountPaid = amount;

        if (event.isVoucherAvailable && event.voucherName && event.discountPercentage) {
            voucherUsed = true;
            voucherCode = event.voucherName;
            discountAmount = parseFloat(((event.discountPercentage / 100) * amount).toFixed(2));
            finalAmountPaid = parseFloat((amount - discountAmount).toFixed(2));
        }

        const booking = await Booking.create({
            eventId,
            salesforceContactId,
            paymentStatus,
            paymentDate,
            amount,
            voucherUsed,
            voucherCode,
            discountAmount,
            finalAmountPaid,
        });

        return res.status(201).json({
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        console.log(error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to create booking',
            error: error.message
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { bookingCode } = req.params;
        const { paymentStatus } = req.body;

        if (!paymentStatus) {
            return res.status(400).json({
                message: 'Payment status is required'
            });
        }

        const validStatuses = ['Completed', 'Failed', 'Refunded'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                message: `Invalid payment status. Allowed values: ${validStatuses.join(', ')}`
            });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            { bookingCode: bookingCode.toUpperCase() },
            { paymentStatus },
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            message: 'Booking status updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        console.log(error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to update booking status',
            error: error.message
        });
    }
};

const getBookingDetails = async (req, res) => {
    try {
        const { bookingCode } = req.params;

        const booking = await Booking.findOne(
            { bookingCode: bookingCode.toUpperCase() }
        ).populate('eventId', 'name startDate');

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        return res.status(200).json({
            message: 'Booking details fetched successfully',
            data: {
                bookingCode: booking.bookingCode,
                paymentAmount: booking.finalAmountPaid,
                eventName: booking.eventId?.name || 'N/A',
                eventDate: booking.eventId?.startDate || 'N/A',
                contactId: booking.salesforceContactId || 'N/A'
            }
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Failed to fetch booking details',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    updateBookingStatus,
    getBookingDetails
};
