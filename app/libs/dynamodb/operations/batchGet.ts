import { BatchGetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { type Key, validateTableName, validateKey, type Item } from "../validations";


export const batchGet = async (
  tableName: string,
  keys: Key[]
): Promise<Item[]> => {
  validateTableName(tableName);
  keys.forEach((key) => validateKey(key));

  const params = {
    RequestItems: {
      [tableName]: {
        Keys: keys.map(key => marshall(key)),
      },
    },
  };

  const command = new BatchGetItemCommand(params);
  const result = await client.send(command);
  return result.Responses?.[tableName]
    ? result.Responses[tableName].map(item => unmarshall(item))
    : [];
};
