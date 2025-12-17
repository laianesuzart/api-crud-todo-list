import { NotFoundError } from '../errors/not-found.ts';
import { ValidationError } from '../errors/validation.ts';
import type { Request, Response } from '../types/index.ts';

export function errorHandler(err: unknown, _req: Request, res: Response) {
  console.error(err);

  if (err instanceof ValidationError) {
    return res.writeHead(err.status).end(JSON.stringify({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        status: err.status,
      },
    }));
  }

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
