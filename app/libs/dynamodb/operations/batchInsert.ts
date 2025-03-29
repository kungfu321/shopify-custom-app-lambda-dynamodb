import { BatchWriteItemCommand, type BatchWriteItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { client } from "../dynamodb.server";
import { validateTableName, validateItems, type Item } from "../validations";

export const batchInsert = async (
  tableName: string,
  items: Item[]
): Promise<{ unprocessedItems: Item[] }> => {
  // Validate inputs
  validateTableName(tableName);
  validateItems(items);

  const BATCH_SIZE = 25; // DynamoDB limit for batch write requests
  let unprocessedItems: Item[] = [];

  // Split items into batches of 25
  const batches = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE).map((item) => ({
      PutRequest: { Item: marshall(item) },
    }));
    batches.push({ RequestItems: { [tableName]: batch } });
  }

  // Process each batch and handle retries for unprocessed items
  for (const batch of batches) {
    let retryBatch: BatchWriteItemCommandInput = batch;

    do {
      const command = new BatchWriteItemCommand(retryBatch);
      const result = await client.send(command);

      // Add unprocessed items to the retry batch
      retryBatch = {
        RequestItems: result.UnprocessedItems,
      };

      if (retryBatch.RequestItems && Object.keys(retryBatch.RequestItems).length > 0) {
        const unprocessed = retryBatch.RequestItems[tableName] || [];
        unprocessedItems = unprocessedItems.concat(
          unprocessed
            .filter((request) => request.PutRequest) // Type guard to check existence
            .map((request) => request.PutRequest!.Item) // Use non-null assertion after the guard
        );
      }
    } while (
      retryBatch.RequestItems &&
      Object.keys(retryBatch.RequestItems).length > 0
    );
  }

  return { unprocessedItems };
};
