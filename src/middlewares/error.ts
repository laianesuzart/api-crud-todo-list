import { NotFoundError } from '../errors/not-found.ts';
import type { Request, Response } from '../types/index.ts';

export function errorHandler(err: unknown, _req: Request, res: Response) {
  console.error(err);

  if (err instanceof NotFoundError) {
    return res.writeHead(404).end(
      JSON.stringify({
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          status: 404,
        },
      })
    );
  }

  return res.writeHead(500).end();
}
