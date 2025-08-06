import React, { useEffect, useState } from 'react'
import DeliveryZones from "../components/DeliveryZones";
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Page } from '@shopify/polaris';

const ZonePage = () => {
    const app = useAppBridge();
    const [shop, setShop] = useState(null);

    useEffect(() => {
        setShop(app.config.shop)
    }, [app]);
    return (
        <Page narrowWidth>
            <TitleBar title="Delivery Zones" />

            {shop && <DeliveryZones shop={shop} />}
            {!shop && <p>Loading shop info...</p>}
        </Page>
    )
}

export default ZonePage;
