import {
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import type { Key } from "../validations";


export const batchDelete = async (
  tableName: string,
  keys: Key[]
): Promise<void> => {
  const requests = keys.map((key) => ({
    DeleteRequest: { Key: marshall(key) }
  }));
  const params = { RequestItems: { [tableName]: requests } };

  await client.send(new BatchWriteItemCommand(params));
};
