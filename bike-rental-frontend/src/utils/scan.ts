/**
 * Runs `task` and resolves with its result, but never sooner than
 * `minMs` after being called.
 *
 * The scan checklist UI (DocumentScanner) advances one step at a
 * time on its own timer so the person can watch the document being
 * "read." The real backend call is usually much faster than that
 * animation - without this, the result would pop in mid-checklist
 * and the scan would visibly get cut off, undermining the sense that
 * anything was actually verified. This keeps the perceived and real
 * completion in sync without ever making a slow request feel slower
 * than it already is (a slow response is simply awaited as normal).
 */
export async function withMinDuration<T>(
  task: () => Promise<T>,
  minMs: number
): Promise<T> {
  const started = Date.now();

  const result = await task();

  const elapsed = Date.now() - started;
  const remaining = minMs - elapsed;

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  return result;
}
