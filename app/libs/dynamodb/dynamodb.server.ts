import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

// Initialize the DynamoDB client using singleton pattern
let clientInstance: DynamoDBClient | null = null;

function getClient(): DynamoDBClient {
  if (!clientInstance) {
    clientInstance = new DynamoDBClient({
      region: process.env.AWS_REGION || "ap-southeast-1",
      maxAttempts: 3,
    });

    console.log("DynamoDB client initialized");
  }

  return clientInstance;
}

// Export client for direct access if needed
export const client = getClient();
