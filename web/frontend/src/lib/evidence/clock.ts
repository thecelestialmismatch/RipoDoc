/**
 * Server clock access.
 *
 * Reading the clock is impure, so it is kept out of component render bodies
 * (React's purity rule) and behind an async boundary. Isolating it here also
 * gives tests and future request-scoped overrides a single seam.
 */

export const currentUnixSeconds = async (): Promise<number> =>
  Math.floor(Date.now() / 1000);
