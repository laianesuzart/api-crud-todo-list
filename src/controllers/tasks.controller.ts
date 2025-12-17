import { randomUUID } from 'node:crypto';
import { database } from '../db/index.ts';
import { NotFoundError } from '../errors/not-found.ts';
import type { Request, Response } from '../types/index.ts';

export function getTasks(req: Request, res: Response) {
  const { search } = req.query!;

  const tasks =
    typeof search === 'string' && search.length > 0
      ? database.select('tasks', search, ['title', 'description'])
      : database.select('tasks');

  return res.end(JSON.stringify(tasks));
}

export function createTask(req: Request, res: Response) {
  const { title, description } = req.body!;

  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.writeHead(400).end();
  }

  const timestamp = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title,
    description,
    completed_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  database.insert('tasks', task);
  return res.writeHead(201).end();
}

export function updateTask(req: Request, res: Response) {
  const { id } = req.params!;
  const body = (req.body ?? {}) as Record<string, unknown>;

  const hasTitle = Object.prototype.hasOwnProperty.call(body, 'title');
  const hasDescription = Object.prototype.hasOwnProperty.call(body, 'description');

  if (!hasTitle && !hasDescription) {
    return res.writeHead(400).end();
  }

  if (hasTitle && typeof body.title !== 'string') return res.writeHead(400).end();
  if (hasDescription && typeof body.description !== 'string') return res.writeHead(400).end();

  const title = hasTitle ? (body.title as string) : undefined;
  const description = hasDescription ? (body.description as string) : undefined;

  const timestamp = new Date().toISOString();
  const data: Record<string, unknown> = { updated_at: timestamp };
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;

  database.update('tasks', id, data);
  return res.writeHead(204).end();
}

export function deleteTask(req: Request, res: Response) {
  const { id } = req.params!;

  database.delete('tasks', id);
  return res.writeHead(204).end();
}

export function toggleCompleteTask(req: Request, res: Response) {
  const { id } = req.params!;

  const rows = database.select('tasks', id, ['id']);
  const task = rows[0];
  if (!task) throw new NotFoundError('tasks', id);

  const timestamp = new Date().toISOString();
  const completed_at = task.completed_at ? null : timestamp;

  database.update('tasks', id, { completed_at, updated_at: timestamp });
  return res.writeHead(204).end();
}
