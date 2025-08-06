import mongoose from 'mongoose';

const DeliveryZoneSchema = new mongoose.Schema({
    shop: { type: String, required: true },
    name: { type: String, required: true },
    address: {
        street: { type: String, required: false },
        city: { type: String, required: false },
        province: { type: String, required: false },
        country: { type: String, required: false },
        zip: { type: String, required: false },
    },
    shippingRate: { type: Number, required: true },
});

export default mongoose.model('DeliveryZone', DeliveryZoneSchema);
