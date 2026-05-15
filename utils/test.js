require('dotenv').config();
const connectDB = require('../db/connectDB');
const Event = require('../model/event.model');

// Vouchers to assign randomly across eligible events
const vouchers = [
    { voucherName: 'SUMMER10', discountPercentage: 10 },
    { voucherName: 'EARLY20', discountPercentage: 20 },
    { voucherName: 'AVID15', discountPercentage: 15 },
];

const assignVouchers = async () => {
    try {
        await connectDB();

        // Fetch all events that do NOT have a previousSlot set
        const events = await Event.find({ previousSlot: null });
        console.log(`Fetched ${events.length} events with previousSlot: null`);

        // Shuffle events and pick a random subset (roughly half) to receive vouchers
        const shuffled = events.sort(() => Math.random() - 0.5);
        const voucherCount = Math.max(1, Math.floor(shuffled.length / 2));
        const toVoucher = shuffled.slice(0, voucherCount);
        const toSkip = shuffled.slice(voucherCount);

        // Assign a voucher to selected events
        for (let i = 0; i < toVoucher.length; i++) {
            const voucher = vouchers[i % vouchers.length];
            await Event.findByIdAndUpdate(toVoucher[i]._id, {
                isVoucherAvailable: true,
                voucherName: voucher.voucherName,
                discountPercentage: voucher.discountPercentage,
            });
            console.log(`  [VOUCHER] "${toVoucher[i].name}" -> ${voucher.voucherName} (${voucher.discountPercentage}% off)`);
        }

        // Ensure remaining events have voucher cleared
        for (const event of toSkip) {
            await Event.findByIdAndUpdate(event._id, {
                isVoucherAvailable: false,
                voucherName: null,
                discountPercentage: null,
            });
            console.log(`  [SKIP]    "${event.name}" -> no voucher`);
        }

        console.log(`\nDone. Vouchers assigned to ${toVoucher.length} / ${events.length} events.`);

    } catch (err) {
        console.error('Failed:', err);
        throw err;
    }
};

const createFutureSlot = async () => {
    try {
        // Fetch all events that do NOT have a previousSlot set
        const eventsWithoutPrevious = await Event.find({ previousSlot: null });

        if (eventsWithoutPrevious.length === 0) {
            console.log('No events available to copy.');
            return;
        }

        // Pick a random event
        const randomEvent = eventsWithoutPrevious[Math.floor(Math.random() * eventsWithoutPrevious.length)];
        console.log(`\nSelected random event: "${randomEvent.name}" (ID: ${randomEvent._id})`);

        // Create a copy with a future date (7 days later)
        const futureDate = new Date(randomEvent.startDate);
        futureDate.setDate(futureDate.getDate() + 7);

        const futureSlot = await Event.create({
            name: randomEvent.name,
            startDate: futureDate,
            time: randomEvent.time,
            location: randomEvent.location,
            isVirtual: randomEvent.isVirtual,
            description: randomEvent.description,
            price: randomEvent.price,
            isVoucherAvailable: randomEvent.isVoucherAvailable,
            voucherName: randomEvent.voucherName,
            discountPercentage: randomEvent.discountPercentage,
            previousSlot: randomEvent._id
        });

        console.log(`Created future slot: "${futureSlot.name}" on ${futureSlot.startDate}`);
        console.log(`Future slot previousSlot points to: ${futureSlot.previousSlot}`);

    } catch (err) {
        console.error('Failed:', err);
        throw err;
    }
};

const main = async () => {
    try {
        await connectDB();
        await createFutureSlot();
        console.log('\nAll tasks completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

main();
