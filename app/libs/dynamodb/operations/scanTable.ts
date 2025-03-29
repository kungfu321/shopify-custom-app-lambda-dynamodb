import { ScanCommand, type ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { buildFilterExpression } from "../validations";

export const scanTable = async (
  tableName: string,
  filter?: Record<string, any>,
  projection?: string[],
  limit?: number
): Promise<any[]> => {
  const params: ScanCommandInput = {
    TableName: tableName,
  };

  if (filter) {
    const { expression, attributeNames, attributeValues } = buildFilterExpression(filter);
    params.FilterExpression = expression;
    params.ExpressionAttributeNames = attributeNames;
    params.ExpressionAttributeValues = marshall(attributeValues);
  }
  if (projection) {
    params.ProjectionExpression = projection.join(", ");
  }
  if (limit) {
    params.Limit = limit;
  }

  const command = new ScanCommand(params);
  const result = await client.send(command);
  return result.Items ? result.Items.map(item => unmarshall(item)) : [];
};
