const Event = require('../model/event.model');

const createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);

        return res.status(201).json({
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.log(error)
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation failed',
                error: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to create event',
            error: error.message
        });
    }
};

const getEvents = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};

        if (startDate || endDate) {
            filter.startDate = {};

            if (startDate) {
                const parsedStartDate = new Date(startDate); // Defaults to 00:00:00
                if (Number.isNaN(parsedStartDate.getTime())) {
                    return res.status(400).json({ message: 'Invalid startDate.' });
                }
                filter.startDate.$gte = parsedStartDate;
            }

            if (endDate) {
                const parsedEndDate = new Date(endDate);
                if (Number.isNaN(parsedEndDate.getTime())) {
                    return res.status(400).json({ message: 'Invalid endDate.' });
                }

                // ADJUSTMENT: Set to the end of the day (23:59:59.999)
                parsedEndDate.setUTCHours(23, 59, 59, 999);

                filter.startDate.$lte = parsedEndDate;
            }
        }

        const events = await Event.find(filter).sort({ startDate: 1 });

        return res.status(200).json({
            count: events.length,
            data: events
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getEvents
};
