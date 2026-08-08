export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}

export function sendNotification(title: string, body: string) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/favicon.svg' })
}
