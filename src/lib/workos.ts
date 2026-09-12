import { WorkOS } from "@workos-inc/node";

let _workos: WorkOS | null = null;

export function getWorkOS(): WorkOS {
  if (!_workos) {
    const apiKey = process.env.WORKOS_API_KEY;
    if (!apiKey) {
      throw new Error("WORKOS_API_KEY environment variable is not set.");
    }
    _workos = new WorkOS(apiKey);
  }
  return _workos;
}

/** @deprecated use getWorkOS() instead */
export const workos = new Proxy({} as WorkOS, {
  get(_target, prop) {
    return (getWorkOS() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
