import { updateItem } from "./updateItem";
import type { Item, Key } from "../validations";

export const batchUpdate = async (
  tableName: string,
  updates: { key: Key; data: Item }[]
): Promise<any[]> => {
  return Promise.all(
    updates.map(({ key, data }) => updateItem(tableName, key, data))
  );
};
