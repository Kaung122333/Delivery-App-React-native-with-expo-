import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import { ExpoPushToken } from "expo-notifications";
import * as Notifications from "expo-notifications";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationProvider = ({ children }: PropsWithChildren) => {
  const { profile } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications and get the initial token
    registerForPushNotificationsAsync().then(setExpoPushToken);

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      // Clean up notification listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    // Save the push token to Supabase when the profile is available
    const savePushToken = async (newToken: string | undefined) => {
      if (!newToken || !profile) return;

      try {
        const { error } = await supabase
          .from("profiles")
          .update({ expo_push_token: newToken })
          .eq("id", profile.id);
        if (error) {
          console.error("Error updating push token in Supabase:", error);
        } else {
          console.log("Push token saved to Supabase successfully!");
        }
      } catch (error) {
        console.error("Unexpected error saving push token:", error);
      }
    };

    savePushToken(expoPushToken);
  }, [profile, expoPushToken]);
  console.log("push token", expoPushToken);
  console.log("notification", notification);

  return <>{children}</>;
};

export default NotificationProvider;
