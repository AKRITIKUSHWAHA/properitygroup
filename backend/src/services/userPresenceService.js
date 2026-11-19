/**
 * In-Memory Real-Time User Presence Tracker
 * Accurately tracks when users are actively logged in vs offline,
 * and records the exact timestamp when a user goes offline.
 */
const userOnlineHeartbeatMap = new Map();
const userLastSeenTimestampMap = new Map();

/**
 * Record activity heartbeat for a user
 */
export const touchUserPresence = (userId, email) => {
  const now = Date.now();
  if (userId) {
    userOnlineHeartbeatMap.set(`id:${userId}`, now);
    userLastSeenTimestampMap.set(`id:${userId}`, now);
  }
  if (email) {
    const cleanEmail = String(email).trim().toLowerCase();
    userOnlineHeartbeatMap.set(`email:${cleanEmail}`, now);
    userLastSeenTimestampMap.set(`email:${cleanEmail}`, now);
  }
};

/**
 * Clear presence upon explicit logout & lock in the exact logout timestamp
 */
export const clearUserPresence = (userId, email) => {
  const now = Date.now();
  if (userId) {
    userOnlineHeartbeatMap.delete(`id:${userId}`);
    userLastSeenTimestampMap.set(`id:${userId}`, now);
  }
  if (email) {
    const cleanEmail = String(email).trim().toLowerCase();
    userOnlineHeartbeatMap.delete(`email:${cleanEmail}`);
    userLastSeenTimestampMap.set(`email:${cleanEmail}`, now);
  }
};

/**
 * Check if user is currently online (active within last 2 minutes)
 */
export const checkIsUserOnline = (userId, email, thresholdMs = 120000) => {
  const now = Date.now();
  if (userId && userOnlineHeartbeatMap.has(`id:${userId}`)) {
    if (now - userOnlineHeartbeatMap.get(`id:${userId}`) < thresholdMs) {
      return true;
    }
  }
  if (email && userOnlineHeartbeatMap.has(`email:${String(email).trim().toLowerCase()}`)) {
    if (now - userOnlineHeartbeatMap.get(`email:${String(email).trim().toLowerCase()}`) < thresholdMs) {
      return true;
    }
  }
  return false;
};

/**
 * Get the exact last seen Date when user was last active/went offline
 */
export const getUserLastSeen = (userId, email) => {
  let ts = 0;
  if (userId && userLastSeenTimestampMap.has(`id:${userId}`)) {
    ts = Math.max(ts, userLastSeenTimestampMap.get(`id:${userId}`));
  }
  if (email && userLastSeenTimestampMap.has(`email:${String(email).trim().toLowerCase()}`)) {
    ts = Math.max(ts, userLastSeenTimestampMap.get(`email:${String(email).trim().toLowerCase()}`));
  }
  return ts > 0 ? new Date(ts) : null;
};
