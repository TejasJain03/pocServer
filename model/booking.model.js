const mongoose = require('mongoose');
const crypto = require('crypto');

const bookingSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event reference is required']
        },
        salesforceContactId: {
            type: String,
            required: [true, 'Salesforce contact Id is required'],
            trim: true
        },
        contactEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: null
        },
        paymentStatus: {
            type: String,
            enum: ['Completed', 'Failed', 'Refunded', 'Rescheduled'],
            default: 'Completed',
            required: true
        },
        bookingCode: {
            type: String,
            unique: true, // Ensures database-level uniqueness
            uppercase: true,
            trim: true,
            default: () => crypto.randomBytes(3).toString('hex').toUpperCase()
            // Note: 3 bytes = 6 hex characters (0-9, A-F)
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative']
        },
        voucherUsed: {
            type: Boolean,
            default: false
        },
        voucherCode: {
            type: String,
            trim: true,
            default: null
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: [0, 'Discount amount cannot be negative']
        },
        finalAmountPaid: {
            type: Number,
            required: [true, 'Final amount paid is required'],
            min: [0, 'Final amount paid cannot be negative']
        },
        paymentDate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
