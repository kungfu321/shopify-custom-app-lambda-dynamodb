/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "shopify-custom-app-lambda-dynamodb",
      // removal: input?.stage === "production" ? "retain" : "remove",
      // protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: process.env.AWS_REGION || "ap-southeast-1",
        }
      }
    };
  },
  async run() {
    const sessionTable = new sst.aws.Dynamo("SessionTable", {
      fields: {
        id: "string",
        shop: "string",
      },
      primaryIndex: { hashKey: "id" },
      globalIndexes: {
        shopIndex: {
          hashKey: "shop",
          projection: "all"
        },
      },
      // deletionProtection: true
    });

    // For more information https://sst.dev/docs/component/aws/remix
    new sst.aws.Remix("ShopifyCustomApp", {
      link: [sessionTable],
      environment: {
        SCOPES: process.env.SCOPES!,
        SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL!,
      },
      // If don't using secrets manager to manage keys, you can remove it.
      permissions: [{
        effect: "allow",
        actions: ["secretsmanager:GetSecretValue"],
        resources: process.env.AWS_SECRETS_MANAGER_RESOURCES?.split(",") || [],
      }]
    });
  },
});
