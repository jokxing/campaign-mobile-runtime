// Reuse an active request. An invalidation during that request schedules one
// trailing refresh so that events arriving after its snapshot are not lost.
export function createRefreshTask(task: () => Promise<void>) {
  let inFlight: Promise<void> | null = null;
  let pending = false;

  return function refresh(invalidate = true): Promise<void> {
    if (inFlight) {
      if (invalidate) pending = true;
      return inFlight;
    }
    inFlight = Promise.resolve().then(async () => {
      do {
        pending = false;
        await task();
      } while (pending);
    }).finally(() => { inFlight = null; });
    return inFlight;
  };
}
