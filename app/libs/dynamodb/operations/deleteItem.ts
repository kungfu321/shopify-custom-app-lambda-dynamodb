import { DeleteItemCommand, type DeleteItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { validateTableName, validateKey, type Key, type Item } from "../validations";

export const deleteItem = async (tableName: string, key: Key): Promise<Item | null> => {
  validateTableName(tableName);
  validateKey(key);

  const params: DeleteItemCommandInput = {
    TableName: tableName,
    Key: marshall(key),
    ReturnValues: "ALL_OLD",
  };

  const command = new DeleteItemCommand(params);
  const result = await client.send(command);
  return result.Attributes ? unmarshall(result.Attributes) : null;
};
