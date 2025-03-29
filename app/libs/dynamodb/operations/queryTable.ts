import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import type { Item, QueryParams } from "../validations";

export const queryTable = async (params: QueryParams): Promise<{ items: Item[], lastEvaluatedKey: Item | undefined }> => {
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
};
