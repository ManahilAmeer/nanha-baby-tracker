import * as Notifications from "expo-notifications";

export async function registerForPushNotifications() {
  // const { status } =
  //   await Notifications.requestPermissionsAsync();

  // if (status !== "granted") return;

  const token = await Notifications.getExpoPushTokenAsync();

  console.log(token);
}