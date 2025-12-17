import http from 'node:http';
import { errorHandler } from './middlewares/error.ts';
import { json } from './middlewares/json.ts';
import { routes } from './routes.ts';
import type { Request } from './types/index.ts';
import { extractQueryParams } from './utils/extract-query-params.ts';

const server = http.createServer(async (req: Request, res) => {
  const { method, url } = req;

  if (!url) {
    return res.writeHead(400).end();
  }

  await json(req, res);

  const route = routes.find((route) => {
    return route.method === method && route.path.test(url);
  });

  if (route) {
    const routeParams = url.match(route.path);

    const groups =
      (routeParams && routeParams.groups) ?? ({} as Record<string, string | undefined>);
    const { query, ...params } = groups as Record<string, string | undefined>;

    req.params = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) as Record<string, string>;

    req.query = query ? extractQueryParams(query) : {};

    try {
      return await route.handler(req, res);
    } catch (err) {
      return errorHandler(err, req, res);
    }
  }

  return res.writeHead(404).end();
});

server.listen(5000);
