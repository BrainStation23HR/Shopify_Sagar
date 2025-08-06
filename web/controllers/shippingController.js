import fetch from 'node-fetch';

/**
 * Simple province name to Shopify province code mapping placeholder
 * Extend this mapping for your target provinces
 */
const provinceCodeMap = {
    Ontario: "ON",
    Dhaka: "Dhaka",
    // add more as needed
};




function getTokenFromRequest(req) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) return null; // no auth header

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) return null; // malformed

    const scheme = parts[0];
    const token = parts[1];

    if (/^Bearer$/i.test(scheme)) {
        return token;
    }

    return null;
}

async function shopifyFetch(shop, token, path, method = 'GET', body = null) {
    const url = `https://${shop}/admin/api/2025-07${path}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
        }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(json));
    }
    return json;
}

async function createOrGetShippingProfile(shop, token, profileName = 'Custom Shipping Profile') {
    const profilesData = await shopifyFetch(shop, token, '/shipping_profiles.json');
    let profile = profilesData.shipping_profiles.find(p => p.name === profileName);
    if (!profile) {
        // Create new profile
        const createRes = await shopifyFetch(shop, token, '/shipping_profiles.json', 'POST', {
            shipping_profile: {
                name: profileName,
                shipping_zones: []
            }
        });
        profile = createRes.shipping_profile;
    }
    return profile;
}

async function createShippingZone(shop, token, profileId, zoneName, countries = [], provinces = []) {
    const createRes = await shopifyFetch(shop, token, `/shipping_profiles/${profileId}/shipping_zones.json`, 'POST', {
        shipping_zone: {
            name: zoneName,
            countries,
            provinces
        }
    });
    return createRes.shipping_zone;
}

async function createShippingRate(shop, token, profileId, zoneId, rateName, price) {
    const createRes = await shopifyFetch(shop, token, `/shipping_profiles/${profileId}/shipping_zones/${zoneId}/shipping_rates.json`, 'POST', {
        shipping_rate: {
            name: rateName,
            price: price.toString(),
            delivery_category: 'all',
            price_adjustments: []
        }
    });
    return createRes.shipping_rate;
}

/**
 * Express controller to create multiple shipping charges by location
 */
export async function createMultipleShippingCharges(req, res) {
    try {
        const { shop, zones } = req.body;

        const token = getTokenFromRequest(req);

        if (!shop || !token || !zones || !Array.isArray(zones)) {
            return res.status(400).json({ error: 'Missing shop, token, or zones array in body' });
        }

        // Get or create shipping profile
        const profile = await createOrGetShippingProfile(shop, token);

        const results = [];

        for (const zone of zones) {
            // Prepare countries array for Shopify API (must use ISO country codes)
            // Assuming zone.address.country is country name, map to ISO code, here just placeholder:
            // You should use a proper country name -> ISO code map in production
            let countryCode = zone.address?.countryCode || null;

            if (!countryCode && zone.address?.country) {
                // Simple hardcoded fallback examples
                if (zone.address.country.toLowerCase() === 'canada') countryCode = 'CA';
                else if (zone.address.country.toLowerCase() === 'bangladesh') countryCode = 'BD';
                else if (zone.address.country.toLowerCase() === 'united kingdom') countryCode = 'GB';
                else countryCode = null; // Or throw error
            }
            if (!countryCode) {
                results.push({ zone: zone.name, error: 'Invalid or missing country code' });
                continue;
            }

            const countries = [{ code: countryCode }];

            // Map province names to codes Shopify expects
            let provinces = [];
            if (zone.address?.province) {
                const code = zone.address.province;
                if (code) {
                    provinces.push({ code });
                }
            }

            // Create shipping zone
            let shippingZone;
            try {
                shippingZone = await createShippingZone(shop, token, profile.id, zone.name, countries, provinces);
            } catch (error) {
                results.push({ zone: zone.name, error: 'Failed to create shipping zone: ' + error.message });
                continue;
            }

            // Create shipping rate
            try {
                const shippingRate = await createShippingRate(shop, token, profile.id, shippingZone.id, 'Custom Shipping Rate', zone.shippingRate || 0);
                results.push({ zone: zone.name, shippingZoneId: shippingZone.id, shippingRate });
            } catch (error) {
                results.push({ zone: zone.name, error: 'Failed to create shipping rate: ' + error.message });
            }
        }

        res.json({ profileId: profile.id, results });

    } catch (err) {
        console.error('Error in createMultipleShippingCharges:', err);
        res.status(500).json({ error: err.message });
    }
}
