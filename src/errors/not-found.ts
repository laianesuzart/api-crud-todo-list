export class NotFoundError extends Error {
  public table: string;
  public id: string;
  public status = 404;

  constructor(table: string, id: string) {
    super(`Record not found for id "${id}" in table "${table}"`);
    this.name = 'NotFoundError';
    this.table = table;
    this.id = id;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      table: this.table,
      id: this.id,
      status: this.status,
    };
  }
}
