// Client-safe shim for TanStack Start functions in SPA / client Vite mode
export function useServerFn<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

export function createServerFn() {
  return {
    validator: () => ({
      handler: (handler: any) => handler,
    }),
    handler: (handler: any) => handler,
  };
}

export function createMiddleware() {
  return () => {};
}

export function createCsrfMiddleware() {
  return () => {};
}

export function createStart() {
  return () => {};
}
