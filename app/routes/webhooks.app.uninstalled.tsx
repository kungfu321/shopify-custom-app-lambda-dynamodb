import type { ActionFunctionArgs } from "@remix-run/node";
import shopifyPromise from "../shopify.server";
import { deleteItem } from "../utils/dynamodb.server";
import { Resource } from "sst";

export const action = async ({ request }: ActionFunctionArgs) => {
  const shopify = await shopifyPromise();
  const { shop, session, topic } = await shopify.authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await deleteItem(
      Resource.SessionTable.name,
      {
        id: session.id,
      },
    );
  }

  return new Response();
};
