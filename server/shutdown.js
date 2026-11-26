// Graceful shutdown: stop accepting connections, let in-flight requests (including an email send) finish, release
// timers and the database client, then exit. A hard deadline prevents a hung connection from blocking a redeploy.
function createShutdown({ server, closers = [], logger, exit = process.exit, deadlineMs = 10000 }) {
  let started = false;
  return async function shutdown(signal) {
    if (started) return;
    started = true;
    logger.info("server.shutdown", { reason: String(signal) });
    const force = setTimeout(() => { logger.error("server.shutdown_forced"); exit(1); }, deadlineMs);
    if (force.unref) force.unref();
    try {
      await new Promise((resolve) => {
        server.close(() => resolve());
        if (server.closeIdleConnections) server.closeIdleConnections();
      });
      for (const close of closers) { try { await close(); } catch { /* keep closing the rest */ } }
      clearTimeout(force);
      exit(0);
    } catch {
      exit(1);
    }
  };
}
module.exports = { createShutdown };
