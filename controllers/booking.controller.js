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
            data: {
                ...booking.toObject(),
                eventName: event.name
            }
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
        ).populate('eventId', 'name startDate discountPercentage');

        if (!updatedBooking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        const cancellationDate = new Date();

        return res.status(200).json({
            message: 'Booking status updated successfully',
            data: {
                bookingCode: updatedBooking.bookingCode,
                eventName: updatedBooking.eventId?.name || 'N/A',
                eventDate: updatedBooking.eventId?.startDate || 'N/A',
                finalAmount: updatedBooking.finalAmountPaid,
                cancellationDate: cancellationDate,
                discountPercentage: updatedBooking.eventId?.discountPercentage || 0
            }
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

const getFutureBookingsByContact = async (req, res) => {
    try {
        const { contactId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfNextDay = new Date(today);
        startOfNextDay.setDate(startOfNextDay.getDate() + 1);

        const bookings = await Booking.find(
            {
                salesforceContactId: contactId,
                paymentStatus: 'Completed'
            }
        ).populate({
            path: 'eventId',
            match: { startDate: { $gte: startOfNextDay } },
            select: 'name startDate'
        });

        const futureBookings = bookings.filter(b => b.eventId !== null);

        return res.status(200).json({
            message: 'Future bookings fetched successfully',
            data: futureBookings.map(b => ({
                bookingCode: b.bookingCode,
                paymentAmount: b.finalAmountPaid,
                paymentStatus: b.paymentStatus,
                eventName: b.eventId.name,
                eventDate: b.eventId.startDate
            }))
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'Failed to fetch future bookings',
            error: error.message
        });
    }
};

const getNextSlotByBooking = async (req, res) => {
    try {
        const { bookingCode } = req.params;

        const booking = await Booking.findOne({ bookingCode: bookingCode.toUpperCase() });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const nextSlotEvent = await Event.findOne({ previousSlot: booking.eventId });
        if (!nextSlotEvent) {
            return res.status(404).json({ message: 'No future slot found for this event' });
        }

        return res.status(200).json({
            message: 'Next slot fetched successfully',
            data: {
                id: nextSlotEvent._id,
                name: nextSlotEvent.name,
                startDate: nextSlotEvent.startDate,
                location: nextSlotEvent.location,
                isVirtual: nextSlotEvent.isVirtual,
                description: nextSlotEvent.description,
                price: nextSlotEvent.price,
                isVoucherAvailable: nextSlotEvent.isVoucherAvailable,
                voucherName: nextSlotEvent.voucherName,
                discountPercentage: nextSlotEvent.discountPercentage,
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Failed to fetch next slot',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    updateBookingStatus,
    getBookingDetails,
    getFutureBookingsByContact,
    getNextSlotByBooking
};
