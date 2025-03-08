import type { LoaderFunctionArgs } from "@remix-run/node";
import shopifyPromise from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const shopify = await shopifyPromise();
  await shopify.authenticate.admin(request);

  return null;
};
