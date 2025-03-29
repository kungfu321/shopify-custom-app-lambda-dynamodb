import { UpdateItemCommand, type UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { validateTableName, validateKey, validateItem } from "../validations";
import type { Key, Item } from "../validations";

export const updateItem = async (
  tableName: string,
  key: Key,
  updates: Record<string, any>
): Promise<Item | null> => {
  // Validate inputs
  validateTableName(tableName);
  validateKey(key);
  validateItem(updates);

  // Build the UpdateExpression
  const updateExpression = Object.keys(updates)
    .map((key) => `#${key} = :${key}`)
    .join(", ");

  const params: UpdateItemCommandInput = {
    TableName: tableName,
    Key: marshall(key),
    UpdateExpression: `SET ${updateExpression}`,
    ExpressionAttributeNames: Object.fromEntries(
      Object.keys(updates).map((key) => [`#${key}`, key])
    ),
    ExpressionAttributeValues: marshall(
      Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [`:${key}`, value])
      )
    ),
    ReturnValues: "ALL_NEW", // Use the string literal directly
  };

  // Execute the UpdateCommand
  const command = new UpdateItemCommand(params);
  const result = await client.send(command);
  return result.Attributes ? unmarshall(result.Attributes) : null;
};
