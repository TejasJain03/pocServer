require('dotenv').config();
const connectDB = require('../db/connectDB');
const Event = require('../model/event.model');

const run = async () => {
    await connectDB();

    // Fetch 3 random events using $sample
    const events = await Event.aggregate([{ $sample: { size: 3 } }]);

    if (events.length === 0) {
        console.log('No events found in the database.');
        process.exit(0);
    }

    const vouchers = [
        { voucherName: 'SUMMER20', discountPercentage: 20 },
        { voucherName: 'EARLYBIRD15', discountPercentage: 15 },
        { voucherName: 'FESTIVE30', discountPercentage: 30 },
    ];

    for (let i = 0; i < events.length; i++) {
        const { voucherName, discountPercentage } = vouchers[i];
        await Event.findByIdAndUpdate(events[i]._id, {
            isVoucherAvailable: true,
            voucherName,
            discountPercentage,
        });
        console.log(`Updated event "${events[i].name}" with voucher "${voucherName}" (${discountPercentage}% off)`);
    }

    console.log('Done.');
    process.exit(0);
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
