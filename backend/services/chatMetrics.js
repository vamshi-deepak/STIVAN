// In-memory metrics for chat (simple). For production, replace with persistent metrics store.
const metrics = {
  blockedAttempts: 0,
  acceptedQueries: 0,
};

function incBlocked() { metrics.blockedAttempts += 1; }
function incAccepted() { metrics.acceptedQueries += 1; }
function getMetrics() { return { ...metrics }; }

module.exports = { incBlocked, incAccepted, getMetrics };
