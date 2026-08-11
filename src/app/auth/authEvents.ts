type Handler = () => void;

let unauthorizedHandler: Handler | null = null;

export const authEvents = {
  onUnauthorized: (fn: Handler) => {
    unauthorizedHandler = fn;
  },
  emitUnauthorized: () => {
    unauthorizedHandler?.();
  },
};
