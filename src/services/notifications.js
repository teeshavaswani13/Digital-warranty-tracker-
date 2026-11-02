/**
 * Notification Service for Browser Push & In-App Expiry Alerts
 */

export const notificationService = {
  // Check if browser supports Web Notifications
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Get current permission status: 'default' | 'granted' | 'denied'
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  // Request browser permission
  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Notification permission error:', err);
      return 'denied';
    }
  },

  // Trigger a browser notification for expiring products
  notifyExpiry(alert) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const isToday = alert.daysRemaining === 0 || alert.isToday;
      const title = isToday
        ? `🚨 Warranty Expiring TODAY: ${alert.productName}`
        : `⚠️ Warranty Expiring Soon: ${alert.productName}`;

      const options = {
        body: alert.message,
        tag: `warranty-${alert.id}-${alert.daysRemaining}`,
        renotify: true,
      };

      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    } catch (err) {
      console.warn('Failed to send browser notification:', err);
      return false;
    }
  },

  // Batch trigger notifications for products expiring today or in <= 7 days
  notifyAllUpcoming(alerts) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    const criticalAlerts = alerts.filter((a) => a.daysRemaining <= 7);
    criticalAlerts.slice(0, 3).forEach((alert) => {
      this.notifyExpiry(alert);
    });
  },
};
