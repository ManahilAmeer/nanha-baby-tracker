import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { type Reminder } from "./reminders";

const NOTIFICATION_ID_PREFIX = "nanha-reminder-";
const REMINDER_CHANNEL_ID = "baby-care-reminders";

export type NotificationSyncResult = {
  scheduled: number;
  skipped: number;
  permissionStatus: "granted" | "denied" | "unsupported";
};

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function syncReminderNotifications(
  reminders: Reminder[]
): Promise<NotificationSyncResult> {
  if (Platform.OS === "web") {
    return {
      scheduled: 0,
      skipped: reminders.length,
      permissionStatus: "unsupported",
    };
  }

  // Android 13 does not display the notification-permission prompt until an
  // Android notification channel exists.
  await configureAndroidNotificationChannel();

  const hasPermission = await ensureNotificationPermission();

  if (!hasPermission) {
    await cancelExistingReminderNotifications();

    return {
      scheduled: 0,
      skipped: reminders.length,
      permissionStatus: "denied",
    };
  }

  await cancelExistingReminderNotifications();

  const schedulableReminders = reminders
    .filter((reminder) => reminder.enabled && !reminder.completed)
    .map((reminder) => ({
      reminder,
      triggerDate: getReminderTriggerDate(reminder),
    }))
    .filter(
      (item): item is { reminder: Reminder; triggerDate: Date } =>
        Boolean(item.triggerDate)
    );

  await Promise.all(
    schedulableReminders.map(({ reminder, triggerDate }) =>
      Notifications.scheduleNotificationAsync({
        identifier: getReminderNotificationId(reminder),
        content: {
          title: reminder.title,
          body: getReminderNotificationBody(reminder),
          data: {
            reminderId: reminder.id,
            reminderType: reminder.type,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: REMINDER_CHANNEL_ID,
        },
      })
    )
  );

  return {
    scheduled: schedulableReminders.length,
    skipped: reminders.length - schedulableReminders.length,
    permissionStatus: "granted",
  };
}

async function ensureNotificationPermission() {
  const permission = await Notifications.getPermissionsAsync();

  if (hasNotificationPermission(permission)) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return hasNotificationPermission(requestedPermission);
}

function hasNotificationPermission(permission: unknown) {
  const permissionResponse = permission as {
    granted?: boolean;
    status?: string;
  };

  return (
    permissionResponse.granted === true ||
    permissionResponse.status === Notifications.PermissionStatus.GRANTED
  );
}

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Baby care reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#9B6A43",
  });
}

async function cancelExistingReminderNotifications() {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();
  const reminderNotifications = scheduledNotifications.filter((notification) =>
    notification.identifier.startsWith(NOTIFICATION_ID_PREFIX)
  );

  await Promise.all(
    reminderNotifications.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );
}

function getReminderNotificationId(reminder: Reminder) {
  return `${NOTIFICATION_ID_PREFIX}${reminder.id}`;
}

function getReminderTriggerDate(reminder: Reminder) {
  if (!reminder.dueDate) {
    return null;
  }

  const dueDate = new Date(`${reminder.dueDate}T09:00:00`);

  if (Number.isNaN(dueDate.getTime())) {
    return null;
  }

  if (dueDate.getTime() <= Date.now()) {
    return null;
  }

  return dueDate;
}

function getReminderNotificationBody(reminder: Reminder) {
  if (reminder.type === "vaccine") {
    return reminder.dueDate
      ? `Due on ${reminder.dueDate}. Consider confirming with your pediatrician.`
      : "A vaccine reminder is due. Consider confirming with your pediatrician.";
  }

  return reminder.timing;
}
