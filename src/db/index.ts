import fs from 'node:fs/promises';
import { NotFoundError } from '../errors/not-found.ts';

const databasePath = new URL('db.json', import.meta.url);

class Database {
  #database = {} as Record<string, Array<Record<string, any>>>;

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  select(table: string, search?: string, fields?: string[]) {
    const data = this.#database[table] ?? [];

    if (!search) return data;

    const term = search.toLowerCase();
    const lookup = fields && fields.length ? fields : Object.keys(data[0] ?? {});

    return data.filter((row) => {
      return lookup.some((field) => {
        const val = row[field];
        return val != null && String(val).toLowerCase().includes(term);
      });
    });
  }

  insert(table: string, data: Record<string, unknown>) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();
    return data;
  }

  update(table: string, id: string, data: Record<string, unknown>) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      const existingRecord = this.#database[table][rowIndex];
      this.#database[table][rowIndex] = { ...existingRecord, ...data };
      this.#persist();
    } else {
      throw new NotFoundError(table, id);
    }
  }

  delete(table: string, id: string) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id);

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1);
      this.#persist();
    } else {
      throw new NotFoundError(table, id);
    }
  }
}

export const database = new Database();
