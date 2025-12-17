import {
  createTask,
  deleteTask,
  getTasks,
  toggleCompleteTask,
  updateTask,
} from './controllers/tasks.controller.ts';
import { buildRoutePath } from './utils/build-route-path.ts';

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: getTasks,
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: createTask,
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: updateTask,
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: deleteTask,
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: toggleCompleteTask,
  },
];
