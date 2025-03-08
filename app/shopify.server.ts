import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { DynamoDBSessionStorage } from '@shopify/shopify-app-session-storage-dynamodb';
import { MemorySessionStorage } from '@shopify/shopify-app-session-storage-memory';
import { Resource } from "sst";

import { getSecretValue } from "./utils/secrets.server";

const shopifyPromise = async () => {
  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = await getSecretValue("SHOPIFY_KEY");

  const sessionStorage = process.env.NODE_ENV === "production" ? new DynamoDBSessionStorage({ sessionTableName: Resource.SessionTable.name, shopIndexName: 'shopIndex' }) : new MemorySessionStorage();

  return shopifyApp({
    apiKey: SHOPIFY_API_KEY,
    apiSecretKey: SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.January25,
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage,
    distribution: AppDistribution.AppStore,
    future: {
      unstable_newEmbeddedAuthStrategy: true,
      removeRest: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
      ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
      : {}),
  });
}

export default shopifyPromise;
export const apiVersion = ApiVersion.January25;
