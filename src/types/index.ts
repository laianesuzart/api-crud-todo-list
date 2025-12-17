import type { IncomingMessage, ServerResponse } from 'node:http';

export type Request = {
  body?: Record<string, unknown>;
  params?: Record<string, string>;
  query?: Record<string, string>;
} & IncomingMessage;

export type Response = ServerResponse<IncomingMessage>;
