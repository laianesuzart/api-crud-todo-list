import { importTasksFromStream } from '../services/import.service.ts';
import {
  createTask as createTaskService,
  deleteTask as deleteTaskService,
  listTasks as listTasksService,
  toggleComplete as toggleCompleteService,
  updateTask as updateTaskService,
} from '../services/tasks.service.ts';
import type { Request, Response } from '../types/index.ts';

export function getTasks(req: Request, res: Response) {
  const { search } = req.query!;
  const tasks = listTasksService(search as string | undefined, ['title', 'description']);
  return res.end(JSON.stringify(tasks));
}

export function createTask(req: Request, res: Response) {
  const data = (req.body ?? {}) as Record<string, unknown>;

  createTaskService(data);

  return res.writeHead(201).end();
}

export function updateTask(req: Request, res: Response) {
  const { id } = req.params!;
  const data = (req.body ?? {}) as Record<string, unknown>;

  updateTaskService(id, data);
  return res.writeHead(204).end();
}

export function deleteTask(req: Request, res: Response) {
  const { id } = req.params!;

  deleteTaskService(id);
  return res.writeHead(204).end();
}

export function toggleCompleteTask(req: Request, res: Response) {
  const { id } = req.params!;

  toggleCompleteService(id);
  return res.writeHead(204).end();
}

export async function importTasks(req: Request, res: Response) {
  const contentType = String(req.headers['content-type'] ?? '');

  if (!contentType.includes('text/csv') && !contentType.includes('application/csv')) {
    return res
      .writeHead(415)
      .end(JSON.stringify({ error: 'Unsupported content type, expected text/csv' }));
  }

  try {
    const result = await importTasksFromStream(req, { maxRows: 1000 });
    if (result.inserted > 0) {
      return res.writeHead(201).end(JSON.stringify(result));
    }
    return res.writeHead(400).end(JSON.stringify(result));
  } catch (err) {
    console.error('Import failed:', err);
    return res.writeHead(400).end(JSON.stringify({ error: 'Invalid CSV or data' }));
  }
}
