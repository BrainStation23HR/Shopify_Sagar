// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import deliveryRoutes from './routes/delivery.js';
import zoneRoutes from './routes/zone.js';
import storefrontZone from './routes/storefront/zone.js'
import storefrontSlot from './routes/storefront/slot.js';
import { connectDB } from "./db/connection.js";
import cors from 'cors';

connectDB();


const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);



app.use(cors());
app.use(express.json());
// storefront apis

app.use('/api/storefront/zones', storefrontZone);
app.use('/api/storefront/slots', storefrontSlot);

// admin apis

app.use("/api/admin/*", shopify.validateAuthenticatedSession());


app.use('/api/admin/zones', zoneRoutes);
app.use('/api/admin/delivery', deliveryRoutes);



app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
