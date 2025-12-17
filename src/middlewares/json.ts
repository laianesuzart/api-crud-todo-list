import type { Request, Response } from '../types/index.ts';

export async function json(req: Request, res: Response) {
  const contentType = String(req.headers['content-type'] ?? '').toLowerCase();

  res.setHeader('Content-type', 'application/json');

  if (!contentType.includes('application/json')) {
    return;
  }

  const buffers: Uint8Array[] = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffers).toString());
  } catch {
    req.body = undefined;
  }
}
