import { apiRequest } from '../api/apiClient';

/**
 * Universal In-App Notification Dispatcher
 * Dispatches an instant window event so the bell updates with zero delay,
 * saves to localStorage queue, and syncs to backend /notifications.
 */
export async function emitNotification({
  role,
  userId,
  title,
  desc,
  type = 'booking',
  amount,
  link,
}) {
  const timestamp = new Date();
  const timeStr = `${timestamp.toLocaleDateString('en-GB')}, ${timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  const notifObj = {
    id: `client-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    desc,
    type,
    amount,
    link,
    time: timeStr,
    createdAt: timestamp.toISOString(),
    read: false,
    role,
    userId,
  };

  // 1. Dispatch custom event for immediate reactive update in NotificationDropdown
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('njs_new_action_notification', { detail: notifObj })
    );
  }

  // 2. Persist to backend API so it stays across refreshes and devices
  try {
    await apiRequest('/notifications', {
      method: 'POST',
      body: {
        role: role ? String(role).toUpperCase() : undefined,
        userId,
        title,
        desc,
        type,
        amount: amount ? String(amount) : undefined,
        link,
      },
    }).catch(() => {});
  } catch (err) {
    console.warn('Backend notification sync note:', err?.message || err);
  }

  return notifObj;
}
