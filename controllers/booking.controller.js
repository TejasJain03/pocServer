const Booking = require('../model/booking.model');

const createBooking = async (req, res) => {
    try {
        const booking = await Booking.create(req.body);

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

module.exports = {
    createBooking,
    updateBookingStatus
};
