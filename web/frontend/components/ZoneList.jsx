import React from "react";
import { ResourceList, Button, Collapsible, Modal } from "@shopify/polaris";

export default function ZoneList({ zones, openZoneModal, deleteZone, isLoading }) {
    const [collapsed, setCollapsed] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [zoneToDelete, setZoneToDelete] = React.useState(null);

    const openDeleteModal = (zone) => {
        setZoneToDelete(zone);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setZoneToDelete(null);
    };

    const confirmDeleteZone = () => {
        if (zoneToDelete) {
            deleteZone(zoneToDelete._id);
        }
        closeDeleteModal();
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '25px 0 12px 0' }}>
                <h2 style={{ margin: 0, fontWeight: 600, fontSize: '1.2rem' }}>Delivery Zones</h2>
                <Button onClick={() => setCollapsed(!collapsed)} plain aria-label="Toggle zone list">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{collapsed ? 'Show Zones' : 'Hide Zones'}</span>
                        <span style={{ display: 'inline-block', transition: 'transform 0.2s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 8L10 12L14 8" stroke="#5C5F62" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </span>
                </Button>
            </div>
            <Collapsible
                open={!collapsed}
                id="zoneList"
                transition={{ duration: '300ms', timingFunction: 'ease-in-out' }}
            >
                <ResourceList
                    resourceName={{ singular: "zone", plural: "zones" }}
                    items={zones}
                    renderItem={(zone) => (
                        <ResourceList.Item id={zone._id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                    <strong>{zone.name}</strong><br />
                                    Shipping Rate: ${zone.shippingRate?.toFixed(2)}<br />
                                    <span>
                                        Street: {zone.address?.street || 'N/A'},
                                        City: {zone.address?.city || 'N/A'},
                                        Province: {zone.address?.province || 'N/A'},
                                        Country: {zone.address?.country || 'N/A'},
                                        Zip: {zone.address?.zip || 'N/A'}
                                    </span>
                                </span>
                                <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Button onClick={() => openZoneModal(zone)} plain>Edit</Button>
                                    <Button destructive onClick={() => openDeleteModal(zone)} plain>Delete</Button>
                                </span>
                            </div>
                        </ResourceList.Item>
                    )}
                />
            </Collapsible>
            <Modal
                open={deleteModalOpen}
                onClose={closeDeleteModal}
                title="Delete Zone"
                primaryAction={{
                    content: "Delete",
                    destructive: true,
                    onAction: confirmDeleteZone,
                }}
                secondaryActions={[{
                    content: "Cancel",
                    onAction: closeDeleteModal,
                }]}
            >
                <Modal.Section>
                    {zoneToDelete && (
                        <p>Are you sure you want to delete the zone <strong>{zoneToDelete.name}</strong>? This action cannot be undone.</p>
                    )}
                </Modal.Section>
            </Modal>
        </div>
    );
}
