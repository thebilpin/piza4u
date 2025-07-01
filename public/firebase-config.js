// Firebase configuration placeholders
// Replace these values with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: for Google Analytics
};

// VAPID key for Firebase Cloud Messaging
const vapidKey = "YOUR_VAPID_KEY";

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = { firebaseConfig, vapidKey };
} else {
  // Browser environment
  window.firebaseConfig = firebaseConfig;
  window.vapidKey = vapidKey;
}