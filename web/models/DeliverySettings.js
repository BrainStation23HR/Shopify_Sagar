import mongoose from 'mongoose';

const DeliverySettingsSchema = new mongoose.Schema({
    shop: String,
    blackout_dates: [String],
    time_slots: [
        {
            time: String,
            capacity: Number,
        },
    ],
    cutoff_same_day: String,
    cutoff_next_day: String,
});

export default mongoose.model('DeliverySettings', DeliverySettingsSchema);
