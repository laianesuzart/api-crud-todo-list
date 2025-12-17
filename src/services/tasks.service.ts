import { randomUUID } from 'node:crypto';
import { database } from '../db/index.ts';
import { NotFoundError } from '../errors/not-found.ts';
import { ValidationError } from '../errors/validation.ts';

export function createTask(data: Record<string, unknown>) {
  const { title, description } = data;
  if (typeof title !== 'string' || typeof description !== 'string') {
    throw new ValidationError('Invalid title or description');
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
  return task;
}

export function listTasks(search?: string | null, fields?: string[] | null) {
  if (typeof search === 'string' && search.length > 0) {
    return database.select('tasks', search, fields ?? ['title', 'description']);
  }

  return database.select('tasks');
}

export function updateTask(id: string, data: Record<string, unknown>) {
  const hasTitle = Object.prototype.hasOwnProperty.call(data, 'title');
  const hasDescription = Object.prototype.hasOwnProperty.call(data, 'description');

  if (!hasTitle && !hasDescription) {
    throw new ValidationError('At least one of "title" or "description" must be provided');
  }

  if (hasTitle && typeof data.title !== 'string') {
    throw new ValidationError('"title" must be a string');
  }

  if (hasDescription && typeof data.description !== 'string') {
    throw new ValidationError('"description" must be a string');
  }

  const timestamp = new Date().toISOString();
  const updateData: Record<string, unknown> = { ...data, updated_at: timestamp };

  database.update('tasks', id, updateData);
}

export function deleteTask(id: string) {
  database.delete('tasks', id);
}

export function toggleComplete(id: string) {
  const rows = database.select('tasks', id, ['id']);
  const task = rows[0];
  if (!task) throw new NotFoundError('tasks', id);

  const timestamp = new Date().toISOString();
  const completed_at = task.completed_at ? null : timestamp;

  database.update('tasks', id, { completed_at, updated_at: timestamp });
}
