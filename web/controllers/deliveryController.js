import DeliverySettings from '../models/DeliverySettings.js';
import DeliveryBooking from '../models/DeliveryBooking.js';

// Get slots for customer
export const getAvailableSlots = async (req, res) => {
    const { shop } = req.query;
    const settings = await DeliverySettings.findOne({ shop });
    if (!settings) return res.json({ available: [] });

    const today = new Date();
    const available = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const iso = date.toISOString().split('T')[0];

        if (!settings.blackout_dates.includes(iso)) {
            const slots = [];

            for (const slot of settings.time_slots) {
                // Use startTime-endTime as the slot identifier
                const slotId = `${slot.startTime}-${slot.endTime}`;
                const count = await DeliveryBooking.countDocuments({ shop, date: iso, time_slot: slotId });
                if (count < slot.capacity) {
                    slots.push({ startTime: slot.startTime, endTime: slot.endTime, capacity: slot.capacity });
                }
            }

            if (slots.length > 0) {
                available.push({ date: iso, slots });
            }
        }
    }

    res.json({ available });
};

// Admin - get current settings
export const getSettings = async (req, res) => {
    const { shop } = req.query;
    const settings = await DeliverySettings.findOne({ shop });
    res.json({ settings });
};

// Admin - save settings
export const saveSettings = async (req, res) => {
    const { shop, blackout_dates, time_slots, cutoff_same_day, cutoff_next_day } = req.body;
    const exists = await DeliverySettings.findOne({ shop });

    if (exists) {
        exists.blackout_dates = blackout_dates;
        exists.time_slots = time_slots;
        exists.cutoff_same_day = cutoff_same_day;
        exists.cutoff_next_day = cutoff_next_day;
        await exists.save();
    } else {
        await DeliverySettings.create({
            shop,
            blackout_dates,
            time_slots,
            cutoff_same_day,
            cutoff_next_day,
        });
    }

    res.json({ success: true });
};
