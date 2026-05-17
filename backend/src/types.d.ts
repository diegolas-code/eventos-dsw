declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

declare const process: {
  env: {
    PORT?: string;
  };
};

declare module 'cors' {
  const cors: (...args: unknown[]) => unknown;
  export default cors;
}

declare module 'express' {
  export type Request = {
    body?: unknown;
    params: Record<string, string>;
  };

  export type Response = {
    json: (body: unknown) => Response;
    status: (code: number) => Response;
    send: (body?: unknown) => Response;
  };

  export type NextFunction = () => void;

  export type Router = {
    get: (...args: unknown[]) => Router;
    post: (...args: unknown[]) => Router;
    patch: (...args: unknown[]) => Router;
    delete: (...args: unknown[]) => Router;
  };

  export type Application = {
    use: (...args: unknown[]) => Application;
    get: (...args: unknown[]) => Application;
    listen: (port: number, callback?: () => void) => void;
  };

  export function Router(): Router;

  const express: {
    (): Application;
    json: () => unknown;
  };

  export default express;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
}
