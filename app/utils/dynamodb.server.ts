import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import type {
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

// Initialize the DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

/**
 * Type for DynamoDB item attributes
 */
export type DynamoDBItem = Record<string, any>;

/**
 * Type for DynamoDB key attributes
 */
export type DynamoDBKey = Record<string, any>;

/**
 * Type for DynamoDB query parameters
 */
export interface QueryParams {
  tableName: string;
  keyConditionExpression: string;
  expressionAttributeValues?: Record<string, any>;
  expressionAttributeNames?: Record<string, string>;
  filterExpression?: string;
  indexName?: string;
  limit?: number;
  scanIndexForward?: boolean;
}

/**
 * Type for DynamoDB update parameters
 */
export interface UpdateParams {
  tableName: string;
  key: DynamoDBKey;
  updateExpression: string;
  expressionAttributeValues?: Record<string, any>;
  expressionAttributeNames?: Record<string, string>;
  conditionExpression?: string;
}

/**
 * Get an item from a DynamoDB table by its key
 * @param tableName The name of the table
 * @param key The key of the item to get
 * @returns The item if found, null otherwise
 */
export async function getItem(tableName: string, key: DynamoDBKey): Promise<DynamoDBItem | null> {
  try {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });

    const response = await client.send(command);

    if (!response.Item) {
      return null;
    }

    return unmarshall(response.Item);
  } catch (error) {
    console.error(`Error getting item from ${tableName}:`, error);
    throw error;
  }
}

/**
 * Put an item into a DynamoDB table
 * @param tableName The name of the table
 * @param item The item to put
 * @returns The response from DynamoDB
 */
export async function putItem(tableName: string, item: DynamoDBItem) {
  try {
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(item),
    });

    return await client.send(command);
  } catch (error) {
    console.error(`Error putting item into ${tableName}:`, error);
    throw error;
  }
}

/**
 * Update an item in a DynamoDB table
 * @param params The update parameters
 * @returns The updated item if returnValues is specified, otherwise the response from DynamoDB
 */
export async function updateItem(params: UpdateParams) {
  try {
    const { tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames, conditionExpression } = params;

    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues ? marshall(expressionAttributeValues) : undefined,
      ExpressionAttributeNames: expressionAttributeNames,
      ConditionExpression: conditionExpression,
    });

    const response = await client.send(command);

    if (response.Attributes) {
      return unmarshall(response.Attributes);
    }

    return response;
  } catch (error) {
    console.error(`Error updating item:`, error);
    throw error;
  }
}

/**
 * Delete an item from a DynamoDB table
 * @param tableName The name of the table
 * @param key The key of the item to delete
 * @param returnValues Whether to return the deleted item
 * @returns The deleted item if returnValues is ALL_OLD, otherwise the response from DynamoDB
 */
export async function deleteItem(tableName: string, key: DynamoDBKey, returnValues?: string) {
  try {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    });

    const response = await client.send(command);

    if (returnValues === 'ALL_OLD' && response.Attributes) {
      return unmarshall(response.Attributes);
    }

    return response;
  } catch (error) {
    console.error(`Error deleting item from ${tableName}:`, error);
    throw error;
  }
}

/**
 * Query items from a DynamoDB table
 * @param params The query parameters
 * @returns The queried items and the last evaluated key if any
 */
export async function queryItems(params: QueryParams) {
  try {
    const {
      tableName,
      keyConditionExpression,
      expressionAttributeValues,
      expressionAttributeNames,
      filterExpression,
      indexName,
      limit,
      scanIndexForward
    } = params;

    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues ? marshall(expressionAttributeValues) : undefined,
      ExpressionAttributeNames: expressionAttributeNames,
      FilterExpression: filterExpression,
      IndexName: indexName,
      Limit: limit,
      ScanIndexForward: scanIndexForward,
    });

    const response = await client.send(command);

    const items = response.Items ? response.Items.map(item => unmarshall(item)) : [];

    return {
      items,
      lastEvaluatedKey: response.LastEvaluatedKey ? unmarshall(response.LastEvaluatedKey) : undefined,
    };
  } catch (error) {
    console.error(`Error querying items:`, error);
    throw error;
  }
}

/**
 * Scan items from a DynamoDB table
 * @param tableName The name of the table
 * @param filterExpression Optional filter expression
 * @param expressionAttributeValues Optional expression attribute values
 * @param expressionAttributeNames Optional expression attribute names
 * @param limit Optional limit on the number of items to scan
 * @returns The scanned items and the last evaluated key if any
 */
export async function scanItems(
  tableName: string,
  filterExpression?: string,
  expressionAttributeValues?: Record<string, any>,
  expressionAttributeNames?: Record<string, string>,
  limit?: number
) {
  try {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues ? marshall(expressionAttributeValues) : undefined,
      ExpressionAttributeNames: expressionAttributeNames,
      Limit: limit,
    });

    const response = await client.send(command);

    const items = response.Items ? response.Items.map(item => unmarshall(item)) : [];

    return {
      items,
      lastEvaluatedKey: response.LastEvaluatedKey ? unmarshall(response.LastEvaluatedKey) : undefined,
    };
  } catch (error) {
    console.error(`Error scanning items from ${tableName}:`, error);
    throw error;
  }
}

/**
 * Batch write items to DynamoDB tables
 * @param requests Object mapping table names to arrays of put or delete requests
 * @returns The response from DynamoDB
 */
export async function batchWriteItems(requests: Record<string, Array<{ PutRequest?: { Item: DynamoDBItem }, DeleteRequest?: { Key: DynamoDBKey } }>>) {
  try {
    // Marshall the requests
    const marshalledRequests: Record<string, Array<{ PutRequest?: { Item: Record<string, AttributeValue> }, DeleteRequest?: { Key: Record<string, AttributeValue> } }>> = {};

    for (const [tableName, tableRequests] of Object.entries(requests)) {
      marshalledRequests[tableName] = tableRequests.map(request => {
        if (request.PutRequest) {
          return {
            PutRequest: {
              Item: marshall(request.PutRequest.Item),
            },
          };
        } else if (request.DeleteRequest) {
          return {
            DeleteRequest: {
              Key: marshall(request.DeleteRequest.Key),
            },
          };
        }
        return request as any;
      });
    }

    const command = new BatchWriteItemCommand({
      RequestItems: marshalledRequests,
    });

    return await client.send(command);
  } catch (error) {
    console.error(`Error batch writing items:`, error);
    throw error;
  }
}
