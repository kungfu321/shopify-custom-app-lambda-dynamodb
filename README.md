# Shopify Custom App - Remix + AWS Lambda + DynamoDB

This project is a Shopify custom app template built with Remix, deployed to AWS Lambda with DynamoDB for data storage and AWS Secrets Manager for secure credential management.

## Architecture

- **Frontend & Backend**: Remix framework
- **Deployment**: AWS Lambda (serverless)
- **Database**: AWS DynamoDB (serverless NoSQL)
- **Secrets Management**: AWS Secrets Manager
- **Infrastructure as Code**: SST (Serverless Stack)
- **CI/CD**: AWS CodeBuild

## Prerequisites

- Node.js 20+
- Yarn package manager
- AWS account with CLI configured
- Shopify Partner account
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) installed

## Setup & Deployment

### 1. Initial Setup

```bash
# Install dependencies
yarn

# Create Shopify app using CLI (if not already created)
npx shopify app create
```

### 2. AWS Configuration

1. Create necessary secrets in AWS Secrets Manager:
   - `SHOPIFY_API_KEY`: Your Shopify API key
   - `SHOPIFY_API_SECRET`: Your Shopify API secret
   - Additional secrets as needed

2. Update your `.env` file with local development settings:
   ```
   SHOPIFY_API_KEY=your_api_key
   SHOPIFY_API_SECRET=your_api_secret
   SCOPES=your_app_scopes
   SHOPIFY_APP_URL=http://localhost:3000 # Will update after first deploy
   AWS_REGION=your_aws_region
   AWS_SECRETS_MANAGER_RESOURCES=your_secrets_manager_arn
   ```

### 3. Deployment Process

```bash
# Manual deployment to AWS
npx sst deploy --stage production

# Update SHOPIFY_APP_URL in .env with the deployed URL
# Example: SHOPIFY_APP_URL=https://a1b2c3d4.execute-api.region.amazonaws.com

# Second deployment to AWS with updated URL
npx sst deploy --stage production

# Update application_url and redirect_urls in shopify.app.toml with deployed URL
```

#### CI/CD Deployment

This project uses AWS CodeBuild for continuous deployment. The configuration is defined in `buildspec.yml`:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - npm install -g aws-cdk yarn sst@3.9.31
      - yarn
  build:
    commands:
      - sst deploy --stage production
```

To set up CI/CD with AWS CodeBuild:
1. Create a CodeBuild project in your AWS account
2. Connect it to your repository
3. Configure necessary IAM permissions for deployment
4. Set up environment variables in the CodeBuild project settings

### 4. Finalize Shopify App Setup

```bash
# Deploy app to Shopify
npx shopify app deploy
```

## Local Development

```bash
# Start local development server
yarn dev

# Run Shopify CLI in development mode
npx shopify app dev
```

## DynamoDB Operations

This template provides a comprehensive DynamoDB library in `app/libs/dynamodb` with operations for:
- CRUD operations (create, read, update, delete)
- Batch operations
- Query and scan operations
- Transaction operations

Some of the DynamoDB utility functions are inspired by or adapted from [node-dynamodb-utils](https://github.com/Vegeta-47/node-dynamodb-utils), a lightweight TypeScript utility package for DynamoDB operations using AWS SDK v3.

## Additional Resources

- [Remix Documentation](https://remix.run/docs/en/main)
- [Shopify App Development](https://shopify.dev/docs/apps)
- [SST Documentation](https://docs.sst.dev)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb)

## Troubleshooting

If you encounter issues during deployment:
- Verify your AWS credentials are correctly configured
- Check CloudWatch logs for Lambda errors
- Ensure all required environment variables are set
- Verify DynamoDB tables have been created correctly
