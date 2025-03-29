import type { ActionFunctionArgs } from "@remix-run/node";
import shopifyPromise from "../shopify.server";
import { Resource } from "sst";
import { queryTable, batchDelete } from "../libs/dynamodb";

export const action = async ({ request }: ActionFunctionArgs) => {
  const shopify = await shopifyPromise();
  const { shop, session, topic } = await shopify.authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    // Delete all sessions for this shop
    const { items } = await queryTable({
      tableName: Resource.SessionTable.name,
      keyConditionExpression: "shop = :shop",
      expressionAttributeValues: {
        ":shop": shop,
      },
      indexName: "shopIndex",
    });

    if (items.length > 0) {
      const keys = items.map(item => ({ id: item.id }));

      await batchDelete(Resource.SessionTable.name, keys);
    }
  }

  return new Response();
};
