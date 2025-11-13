export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return;
  }

  // Check current permission
  let permission = Notification.permission;

  // Request permission if not granted or denied
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  // Show notification if permission granted
  if (permission === "granted") {
    try {
      const notification = new Notification(title, {
        icon: "/time-horizon/universe.svg",
        badge: "/time-horizon/universe.svg",
        tag: options?.tag, // Prevents duplicate notifications with same tag
        requireInteraction: options?.requireInteraction ?? false,
        silent: options?.silent ?? false,
        ...options,
      });

      // Auto-close after 5 seconds if not requiring interaction
      if (!options?.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.warn("Error showing notification:", error);
    }
  } else {
    console.warn("Notification permission denied");
  }
};
