import {
  Page,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import DeliverySettings from "../components/DeliverySettings";

export default function HomePage() {
  const { t } = useTranslation();
  const app = useAppBridge();
  const [shop, setShop] = useState(null);

  useEffect(() => {
    setShop(app.config.shop)
  }, [app]);

  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} />
      {shop ? <DeliverySettings shop={shop} /> : (
        <p>Loading shop info...</p>
      )}
    </Page>
  );
}
