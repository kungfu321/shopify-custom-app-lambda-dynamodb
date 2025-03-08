# Shopify App Template - Remix + AWS Lambda + AWS DynamoDB + AWS Secrets Manager

- `yarn i`
- Create keys on AWS Secrets Manager
- Update `.env`
- `npx sst deploy --stage production` deploy first time to AWS
- Copy app URL and update `.env SHOPIFY_APP_URL`
- `npx sst deploy --stage production` deploy second time to AWS
- Update `application_url` and `redirect_urls` on `shopify.app.toml`
- `npx shopify app deploy` deploy app to Shopify

That's it.
