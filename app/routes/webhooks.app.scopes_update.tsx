import type { ActionFunctionArgs } from "@remix-run/node";
import shopifyPromise from "../shopify.server";
import { Resource } from "sst";
import { updateItem } from "../libs/dynamodb";

export const action = async ({ request }: ActionFunctionArgs) => {
  const shopify = await shopifyPromise();
  const { payload, session, topic, shop } = await shopify.authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`, payload);

  const current = payload.current as string[];
  if (session) {
    await updateItem(
      Resource.SessionTable.name,
      { id: session.id },
      { scope: current.toString() },
    );
  }
  return new Response();
};
