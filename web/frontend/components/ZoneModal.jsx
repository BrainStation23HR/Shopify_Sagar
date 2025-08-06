import React from "react";
import { Modal, FormLayout, TextField } from "@shopify/polaris";

export default function ZoneModal({ open, onClose, zoneEditId, zoneForm, setZoneForm, saveZone, isLoading }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={zoneEditId ? 'Edit Zone' : 'Add Zone'}
            primaryAction={{ content: zoneEditId ? 'Save' : 'Add', onAction: saveZone, loading: isLoading }}
            secondaryActions={[{ content: 'Cancel', onAction: onClose }]}
        >
            <Modal.Section title="Zone Information">
                <FormLayout>
                    <TextField
                        label="Zone Name"
                        value={zoneForm.name}
                        onChange={v => setZoneForm(f => ({ ...f, name: v }))}
                        autoComplete="off"
                    />
                    <TextField
                        label="Shipping Rate ($)"
                        type="number"
                        value={zoneForm.shippingRate}
                        onChange={v => setZoneForm(f => ({ ...f, shippingRate: v }))}
                        autoComplete="off"
                    />
                </FormLayout>
            </Modal.Section>
            <Modal.Section title="Address">
                <FormLayout>
                    <TextField
                        label="Street Address"
                        value={zoneForm.address.street}
                        onChange={v => setZoneForm(f => ({ ...f, address: { ...f.address, street: v } }))}
                        autoComplete="off"
                    />
                    <TextField
                        label="City"
                        value={zoneForm.address.city}
                        onChange={v => setZoneForm(f => ({ ...f, address: { ...f.address, city: v } }))}
                        autoComplete="off"
                    />
                    <TextField
                        label="Province/State (ISO Code)"
                        value={zoneForm.address.province}
                        onChange={v => setZoneForm(f => ({ ...f, address: { ...f.address, province: v } }))}
                        autoComplete="off"
                    />
                    <TextField
                        label="Country"
                        value={zoneForm.address.country}
                        onChange={v => setZoneForm(f => ({ ...f, address: { ...f.address, country: v } }))}
                        autoComplete="off"
                    />
                    <TextField
                        label="Zip/Postal Code"
                        value={zoneForm.address.zip}
                        onChange={v => setZoneForm(f => ({ ...f, address: { ...f.address, zip: v } }))}
                        autoComplete="off"
                    />
                </FormLayout>
            </Modal.Section>
        </Modal>
    );
}