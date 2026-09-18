'use client';

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported, Messaging } from "firebase/messaging";
import { FIREBASE_CONFIG } from "@/lib/firebase.config";

// Initialize Firebase
const app: FirebaseApp = initializeApp(FIREBASE_CONFIG);
const analytics: Analytics | null = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth: Auth = getAuth(app);

// Initialize Messaging (only in browser and if supported)
let messaging: Messaging | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

/**
 * Get Firebase Messaging instance
 * Returns null if not supported or not in browser
 */
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (messaging) {
    return messaging;
  }
  
  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
    return messaging;
  }
  
  return null;
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  const messagingInstance = await getFirebaseMessaging();
  if (!messagingInstance) {
    console.warn('Firebase Messaging is not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.warn('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Subscribe to foreground messages
 */
export async function onForegroundMessage(
  callback: (payload: any) => void
): Promise<(() => void) | null> {
  const messagingInstance = await getFirebaseMessaging();
  if (!messagingInstance) {
    return null;
  }

  return onMessage(messagingInstance, callback);
}

// Export Firebase instances
export { app, analytics, auth };
export default app;

