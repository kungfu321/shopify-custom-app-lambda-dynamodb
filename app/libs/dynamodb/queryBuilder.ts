export class QueryBuilder {
  private tableName: string;
  private keyConditions: Record<string, any> = {};
  private filter: Record<string, any> = {};
  private projection: string[] = [];
  private limit?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  addKeyCondition(key: string, operator: string, value: any): QueryBuilder {
    this.keyConditions[key] = { operator, value };
    return this;
  }

  addFilter(key: string, operator: string, value: any): QueryBuilder {
    this.filter[key] = { operator, value };
    return this;
  }

  addProjection(...fields: string[]): QueryBuilder {
    this.projection.push(...fields);
    return this;
  }

  setLimit(limit: number): QueryBuilder {
    this.limit = limit;
    return this;
  }

  build(): any {
    return {
      tableName: this.tableName,
      keyConditions: this.keyConditions,
      filter: this.filter,
      projection: this.projection,
      limit: this.limit,
    };
  }
}