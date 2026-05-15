require('dotenv').config();
const connectDB = require('../db/connectDB');
const mongoose = require('mongoose');
const Booking = require('../model/booking.model');

const TARGET_BOOKING_ID = '6a04b4af48614650198fe4bf';

const deleteAllBookingsExceptTarget = async () => {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(TARGET_BOOKING_ID)) {
            throw new Error(`Invalid booking id: ${TARGET_BOOKING_ID}`);
        }

        const targetObjectId = new mongoose.Types.ObjectId(TARGET_BOOKING_ID);

        const totalBefore = await Booking.countDocuments();
        const targetExists = await Booking.exists({ _id: targetObjectId });

        if (!targetExists) {
            console.log(`Target booking ${TARGET_BOOKING_ID} not found. No deletions performed.`);
            return;
        }

        const deleteResult = await Booking.deleteMany({ _id: { $ne: targetObjectId } });
        const totalAfter = await Booking.countDocuments();

        console.log(`Total bookings before: ${totalBefore}`);
        console.log(`Deleted bookings: ${deleteResult.deletedCount}`);
        console.log(`Total bookings after: ${totalAfter}`);
        console.log(`Kept booking id: ${TARGET_BOOKING_ID}`);
    } catch (err) {
        console.error('Failed:', err);
        throw err;
    }
};

const main = async () => {
    try {
        await deleteAllBookingsExceptTarget();
        console.log('\nAll tasks completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

main();
