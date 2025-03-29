import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { validateTableName, validateKey, validateProjection, type Key, type Projection, type Item } from "../validations";

export const getItem = async (
  tableName: string,
  key: Key,
  projection?: Projection
): Promise<Item | null> => {
  validateTableName(tableName);
  validateKey(key);
  validateProjection(projection);

  const params = {
    TableName: tableName,
    Key: marshall(key),
    ProjectionExpression: projection?.join(", "),
  };

  const command = new GetItemCommand(params);
  const result = await client.send(command);
  return result.Item ? unmarshall(result.Item) : null;
};
