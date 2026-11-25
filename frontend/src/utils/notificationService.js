import { apiRequest } from '../api/apiClient';

/**
 * Universal In-App Notification Dispatcher
 * Dispatches an instant window event so the bell updates with zero delay,
 * saves to localStorage queue, and syncs to backend /notifications.
 */
export async function emitNotification({
  role,
  userId,
  recipientEmail,
  customerEmail,
  jobId,
  jobRef,
  title,
  desc,
  type = 'booking',
  amount,
  link,
}) {
  const timestamp = new Date();
  const timeStr = `${timestamp.toLocaleDateString('en-GB')}, ${timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  const targetEmail = recipientEmail || customerEmail || (typeof userId === 'string' && userId.includes('@') ? userId : undefined);

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
    role: role ? String(role).toUpperCase() : undefined,
    userId: userId ? String(userId) : undefined,
    recipientEmail: targetEmail,
  };

  // 1. Dispatch custom event for immediate reactive update in NotificationDropdown
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('njs_new_action_notification', { detail: notifObj })
    );

    // 2. Persist to localStorage queue so notifications are preserved across reloads and offline
    try {
      const existing = JSON.parse(localStorage.getItem('propertygroup_local_notifications') || '[]');
      const updated = [notifObj, ...existing.filter((n) => n.id !== notifObj.id)].slice(0, 50);
      localStorage.setItem('propertygroup_local_notifications', JSON.stringify(updated));
    } catch {}
  }

  // 3. Persist to backend API so it stays across refreshes and devices
  try {
    await apiRequest('/notifications', {
      method: 'POST',
      body: {
        role: role ? String(role).toUpperCase() : undefined,
        userId: userId ? String(userId).replace(/^usr_/, '').replace(/^srv-/, '') : undefined,
        recipientEmail: targetEmail,
        jobId: jobId ? String(jobId) : undefined,
        jobRef: jobRef ? String(jobRef) : undefined,
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
