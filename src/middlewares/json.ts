import type { Request, Response } from '../types/index.ts';

export async function json(req: Request, res: Response) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString());
  } catch {
    req.body = {};
  }

  res.setHeader('Content-type', 'application/json');
}
