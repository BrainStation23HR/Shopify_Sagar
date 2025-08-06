import DeliveryZone from '../models/DeliveryZone.js';
import { createMultipleShippingCharges } from './shippingController.js';

// Get all zones for a shop
export async function getZones(req, res) {
    try {
        const { shop } = req.query;
        const zones = await DeliveryZone.find({ shop });
        res.json({ zones });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Create or update a zone
export async function saveZone(req, res) {
    try {
        const { id, shop, name, address, shippingRate, blackout_dates, time_slots } = req.body;
        let zone;
        if (id) {
            zone = await DeliveryZone.findByIdAndUpdate(id, { name, address, shippingRate, blackout_dates, time_slots }, { new: true });
            // await createMultipleShippingCharges(shop, zone);
        } else {
            zone = await DeliveryZone.create({ shop, name, address, shippingRate, blackout_dates, time_slots });
        }
        res.json({ success: true, zone });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

// Delete a zone
export async function deleteZone(req, res) {
    try {
        const { id } = req.params;
        await DeliveryZone.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
