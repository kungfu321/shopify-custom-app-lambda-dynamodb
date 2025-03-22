import type { ActionFunctionArgs } from "@remix-run/node";
import shopifyPromise from "../shopify.server";
import { queryItems, batchWriteItems } from "../utils/dynamodb.server";
import { Resource } from "sst";

export const action = async ({ request }: ActionFunctionArgs) => {
  const shopify = await shopifyPromise();
  const { shop, session, topic } = await shopify.authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    // Delete all sessions for this shop
    const queryResult = await queryItems({
      tableName: Resource.SessionTable.name,
      keyConditionExpression: "shop = :shop",
      expressionAttributeValues: {
        ":shop": shop,
      },
      indexName: "shopIndex",
    });

    if (queryResult.items.length > 0) {
      // Prepare delete requests
      const deleteRequests = queryResult.items.map(item => ({
        DeleteRequest: {
          Key: { id: item.id }
        }
      }));

      // Process in batches of 25 (DynamoDB limit)
      for (let i = 0; i < deleteRequests.length; i += 25) {
        const batch = deleteRequests.slice(i, i + 25);
        await batchWriteItems({
          [Resource.SessionTable.name]: batch
        });
      }
    }
  }

  return new Response();
};
