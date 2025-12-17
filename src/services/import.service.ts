import { parse } from 'csv-parse';
import type { Readable } from 'node:stream';
import { createTask as createTaskService } from './tasks.service.ts';

type ImportResult = {
  inserted: number;
  skipped: number[];
  errors: Array<{ row: number; reason: string }>;
};

type ImportOptions = {
  maxRows?: number;
};

export function importTasksFromStream(
  stream: Readable,
  opts: ImportOptions = {}
): Promise<ImportResult> {
  const maxRows = opts.maxRows ?? 10000;

  return new Promise<ImportResult>((resolve, reject) => {
    const parser = parse({ columns: true, skip_empty_lines: true, trim: true });

    let inserted = 0;
    const skipped: number[] = [];
    const errors: Array<{ row: number; reason: string }> = [];
    let rowIndex = 0;

    parser.on('readable', () => {
      let record: any;
      while ((record = parser.read()) !== null) {
        rowIndex++;

        if (rowIndex > maxRows) {
          parser.destroy(new Error('Row limit exceeded'));
          return;
        }

        const title = String(record.title ?? '').trim();
        const description = String(record.description ?? '').trim();

        if (!title || !description) {
          skipped.push(rowIndex);
          errors.push({ row: rowIndex, reason: 'missing title or description' });
          continue;
        }

        try {
          createTaskService({ title, description });
          inserted++;
        } catch (e) {
          skipped.push(rowIndex);
          errors.push({
            row: rowIndex,
            reason: String((e as Error).message || 'failed to create task'),
          });
        }
      }
    });

    parser.on('error', (err: Error) => {
      reject(err);
    });

    parser.on('end', () => {
      resolve({ inserted, skipped, errors });
    });

    stream.pipe(parser);
  });
}
