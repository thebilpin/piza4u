import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/messaging";
import { getFirebaseConfig } from "@/helpers/functionHelper";
import { store } from "../store/store";

class FirebaseService {
  static instance = null;
  initialized = false;
  initializationPromise = null;
  configRetryCount = 0;
  maxRetries = 10; // Maximum number of retries
  retryDelay = 1000; // Delay between retries in ms

  constructor() {
    if (FirebaseService.instance) {
      return FirebaseService.instance;
    }
    FirebaseService.instance = this;
  }

  async waitForConfig() {
    return new Promise((resolve, reject) => {
      const checkConfig = () => {
        const config = getFirebaseConfig();
        if (config) {
          resolve(config);
        } else {
          this.configRetryCount++;
          if (this.configRetryCount >= this.maxRetries) {
            reject(
              new Error("Failed to get Firebase config after maximum retries")
            );
            return;
          }
          setTimeout(checkConfig, this.retryDelay);
        }
      };
      checkConfig();
    });
  }

  async initialize() {
    if (this.initialized) return this.firebase;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = new Promise(async (resolve, reject) => {
      try {
        const config = await this.waitForConfig();

        if (!firebase.apps.length) {
          this.firebase = firebase.initializeApp(config);
        } else {
          this.firebase = firebase.apps[0];
        }

        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.register(
              "/firebase-messaging-sw.js"
            );

            await navigator.serviceWorker.ready;

            registration.active.postMessage({
              type: "INIT_FIREBASE",
              config,
            });
          } catch (error) {
            console.error("Service Worker registration failed:", error);
          }
        }

        this.initialized = true;
        resolve(this.firebase);
      } catch (error) {
        console.error("Firebase initialization failed:", error);
        this.initialized = false;
        this.initializationPromise = null;
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  async reinitialize() {
    this.initialized = false;
    this.initializationPromise = null;
    this.configRetryCount = 0;
    return this.initialize();
  }

  async getAuth() {
    await this.initialize();
    return firebase.auth();
  }

  async getMessaging() {
    await this.initialize();
    return firebase.messaging();
  }

  async getGoogleAuthProvider() {
    await this.initialize();
    return new firebase.auth.GoogleAuthProvider();
  }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
