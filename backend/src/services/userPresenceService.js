/**
 * In-Memory Real-Time User Presence Tracker
 * Accurately tracks when users are actively logged in vs offline
 */
const userPresenceMap = new Map();

/**
 * Record activity heartbeat for a user
 */
export const touchUserPresence = (userId, email) => {
  const now = Date.now();
  if (userId) {
    userPresenceMap.set(`id:${userId}`, now);
  }
  if (email) {
    userPresenceMap.set(`email:${String(email).trim().toLowerCase()}`, now);
  }
};

/**
 * Clear presence upon explicit logout
 */
export const clearUserPresence = (userId, email) => {
  if (userId) {
    userPresenceMap.delete(`id:${userId}`);
  }
  if (email) {
    userPresenceMap.delete(`email:${String(email).trim().toLowerCase()}`);
  }
};

/**
 * Check if user is currently online (active within last 2 minutes)
 */
export const checkIsUserOnline = (userId, email, thresholdMs = 120000) => {
  const now = Date.now();
  if (userId && userPresenceMap.has(`id:${userId}`)) {
    if (now - userPresenceMap.get(`id:${userId}`) < thresholdMs) {
      return true;
    }
  }
  if (email && userPresenceMap.has(`email:${String(email).trim().toLowerCase()}`)) {
    if (now - userPresenceMap.get(`email:${String(email).trim().toLowerCase()}`) < thresholdMs) {
      return true;
    }
  }
  return false;
};

/**
 * Get last seen Date for user, or null if never recorded
 */
export const getUserLastSeen = (userId, email) => {
  let ts = 0;
  if (userId && userPresenceMap.has(`id:${userId}`)) {
    ts = Math.max(ts, userPresenceMap.get(`id:${userId}`));
  }
  if (email && userPresenceMap.has(`email:${String(email).trim().toLowerCase()}`)) {
    ts = Math.max(ts, userPresenceMap.get(`email:${String(email).trim().toLowerCase()}`));
  }
  return ts > 0 ? new Date(ts) : null;
};
