import mongoose from 'mongoose';

const DeliveryBookingSchema = new mongoose.Schema({
    shop: String,
    date: String,
    time_slot: String,
    order_id: String,
    customer_id: String,
});

export default mongoose.model('DeliveryBooking', DeliveryBookingSchema);
