import React, { useState, useEffect } from "react";
import { Card, Button, ResourceList, Toast, Frame, LegacyCard } from "@shopify/polaris";
import ZoneModal from "./ZoneModal";
import ZoneList from "./ZoneList";

export default function DeliveryZones({ shop }) {
    const [zones, setZones] = useState([]);
    const [zoneModalOpen, setZoneModalOpen] = useState(false);
    const [zoneForm, setZoneForm] = useState({
        name: '',
        shippingRate: '',
        address: {
            street: '',
            city: '',
            province: '',
            country: '',
            zip: ''
        }
    });
    const [zoneEditId, setZoneEditId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!shop) return;
        fetch(`/api/admin/zones?shop=${shop}`)
            .then((res) => {
                if (!res.ok) {
                    console.error('Failed to fetch zones:', res.status, res.statusText);
                    return { zones: [] };
                }
                return res.json();
            })
            .then((data) => {
                console.log('Fetched zones:', data.zones);
                setZones(data.zones || []);
            })
            .catch((err) => {
                console.error('Error fetching zones:', err);
            });
    }, [shop, toastActive]);

    const openZoneModal = (zone = null) => {
        setZoneEditId(zone?._id || null);
        setZoneForm({
            name: zone?.name || '',
            shippingRate: zone?.shippingRate?.toString() || '',
            address: {
                street: zone?.address?.street || '',
                city: zone?.address?.city || '',
                province: zone?.address?.province || '',
                country: zone?.address?.country || '',
                zip: zone?.address?.zip || ''
            }
        });
        setZoneModalOpen(true);
    };
    const closeZoneModal = () => {
        setZoneModalOpen(false);
        setZoneForm({
            name: '',
            shippingRate: '',
            address: {
                street: '',
                city: '',
                province: '',
                country: '',
                zip: ''
            }
        });
        setZoneEditId(null);
    };
    const saveZone = async () => {
        // Validate required fields
        const requiredFields = [
            zoneForm.name,
            zoneForm.shippingRate,
            zoneForm.address.street,
            zoneForm.address.city,
            zoneForm.address.province,
            zoneForm.address.country,
            zoneForm.address.zip
        ];
        if (requiredFields.some(f => !f || f.trim() === "")) {
            setToastMessage("Please fill in all required fields.");
            setToastActive(true);
            return;
        }
        setIsLoading(true);
        try {
            const body = {
                shop,
                name: zoneForm.name,
                shippingRate: parseFloat(zoneForm.shippingRate),
                address: zoneForm.address,
            };
            let toastMsg = "Saved!";
            if (zoneEditId) {
                body.id = zoneEditId;
                toastMsg = "Updated!";
            }
            const res = await fetch('/api/admin/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Failed to save zone');
            closeZoneModal();
            setToastMessage(toastMsg);
            setToastActive(true);
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    const deleteZone = async (id) => {
        setIsLoading(true);
        try {
            await fetch(`/api/admin/zones/${id}`, { method: 'DELETE' });
            setToastMessage("Deleted!");
            setToastActive(true);
        } catch (e) {
            setErrorMessage(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Frame>
            <LegacyCard title="Delivery Zones (for cost estimate)">
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <Button onClick={() => openZoneModal()} primary>Add Zone</Button>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <ZoneList zones={zones} openZoneModal={openZoneModal} deleteZone={deleteZone} isLoading={isLoading} />
                    </div>
                </div>
            </LegacyCard>
            <ZoneModal
                open={zoneModalOpen}
                onClose={closeZoneModal}
                zoneEditId={zoneEditId}
                zoneForm={zoneForm}
                setZoneForm={setZoneForm}
                saveZone={saveZone}
                isLoading={isLoading}
            />
            {toastActive && <Toast content={toastMessage} onDismiss={() => setToastActive(false)} duration={4500} />}
        </Frame>
    );
}
