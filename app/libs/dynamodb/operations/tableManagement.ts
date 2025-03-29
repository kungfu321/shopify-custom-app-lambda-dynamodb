import {
  CreateTableCommand,
  DeleteTableCommand,
  ListTablesCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { client as dynamoClient } from "../dynamodb.server";

export const listTables = async (): Promise<string[]> => {
  const command = new ListTablesCommand({});
  const result = await dynamoClient.send(command);
  return result.TableNames || [];
};

export const describeTable = async (tableName: string): Promise<any> => {
  const command = new DescribeTableCommand({ TableName: tableName });
  const result = await dynamoClient.send(command);
  return result.Table || null;
};

export const createTable = async (params: any): Promise<any> => {
  const command = new CreateTableCommand(params);
  return await dynamoClient.send(command);
};

export const deleteTable = async (tableName: string): Promise<void> => {
  const command = new DeleteTableCommand({ TableName: tableName });
  await dynamoClient.send(command);
};
