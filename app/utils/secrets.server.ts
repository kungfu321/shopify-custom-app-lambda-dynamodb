import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

/**
 * Retrieves a secret value from AWS Secrets Manager
 * @param secretName The name of the secret to retrieve
 * @returns The parsed secret value
 */
export async function getSecretValue(secretName: string) {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error(`Secret ${secretName} not found or has no value`);
    }

    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw error;
  }
}
