import type { ActionFunctionArgs } from "@remix-run/node";
import shopifyPromise from "../shopify.server";
import { updateItem } from "../utils/dynamodb.server";
import { Resource } from "sst";

export const action = async ({ request }: ActionFunctionArgs) => {
  const shopify = await shopifyPromise();
  const { payload, session, topic, shop } = await shopify.authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`, payload);

  const current = payload.current as string[];
  if (session) {
    await updateItem({
      tableName: Resource.SessionTable.name,
      key: {
        id: session.id,
      },
      updateExpression: "SET scope = :scope",
      expressionAttributeValues: {
        ":scope": current.toString(),
      },
    });
  }
  return new Response();
};
