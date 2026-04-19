import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyByzNVkv_UWaQhlHY2vTQh3SA9D2A1k2rY",
  authDomain: "udyame-ai.firebaseapp.com",
  projectId: "udyame-ai",
  storageBucket: "udyame-ai.firebasestorage.app",
  messagingSenderId: "324196652301",
  appId: "1:324196652301:web:846ff0ac06ea38cd33cc44",
  measurementId: "G-SXNGBKE41F"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize analytics only on client side and if supported
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.error("Firebase analytics not supported:", err);
  });
}

export { app, analytics };
