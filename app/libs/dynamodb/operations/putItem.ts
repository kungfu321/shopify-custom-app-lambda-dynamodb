import { PutItemCommand, type PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { validateTableName, validateItem, type Item } from "../validations";

export const putItem = async (
  tableName: string,
  item: Item
): Promise<void> => {
  // Validate inputs
  validateTableName(tableName);
  validateItem(item);

  // Create the PutCommand input
  const params: PutItemCommandInput = {
    TableName: tableName,
    Item: marshall(item),
  };

  // Execute the command
  const command = new PutItemCommand(params);
  await client.send(command);
};
