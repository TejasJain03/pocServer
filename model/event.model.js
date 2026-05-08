const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date and time are required']
    },
    // If you need "Time" as a separate string (e.g., "14:30"), use this:
    time: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    isVirtual: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
