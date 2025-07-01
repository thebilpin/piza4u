// Firebase initialization script for static deployment
// This script provides an alternative to the dynamic Firebase configuration
// used in the main application. Include this script in your HTML if you want
// to use static Firebase configuration instead of the Redux store configuration.

(function() {
  'use strict';

  // Check if Firebase is already loaded
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded. Please include Firebase SDK before this script.');
    return;
  }

  // Check if configuration is available
  if (typeof window.firebaseConfig === 'undefined') {
    console.warn('Firebase configuration not found. Please include firebase-config.js before this script.');
    return;
  }

  // Initialize Firebase if not already initialized
  if (firebase.apps.length === 0) {
    try {
      firebase.initializeApp(window.firebaseConfig);
      console.log('Firebase initialized successfully with static configuration');
      
      // Set global flag to indicate static initialization
      window.firebaseStaticInit = true;
      
      // Initialize Firebase services if needed
      if (window.firebaseConfig.measurementId) {
        // Initialize Analytics if measurement ID is provided
        if (firebase.analytics) {
          firebase.analytics();
          console.log('Firebase Analytics initialized');
        }
      }
      
      // Initialize Auth
      if (firebase.auth) {
        firebase.auth();
        console.log('Firebase Auth initialized');
      }
      
      // Initialize Firestore
      if (firebase.firestore) {
        firebase.firestore();
        console.log('Firebase Firestore initialized');
      }
      
      // Initialize Messaging if supported and VAPID key is available
      if (firebase.messaging && window.vapidKey && 'serviceWorker' in navigator) {
        const messaging = firebase.messaging();
        
        // Request permission for notifications
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Notification permission granted');
            
            // Get FCM token
            messaging.getToken({ vapidKey: window.vapidKey }).then((currentToken) => {
              if (currentToken) {
                console.log('FCM Token:', currentToken);
                // Store token in localStorage for application use
                localStorage.setItem('fcm_token', currentToken);
              } else {
                console.log('No registration token available.');
              }
            }).catch((err) => {
              console.log('An error occurred while retrieving token. ', err);
            });
          }
        });
        
        // Handle foreground messages
        messaging.onMessage((payload) => {
          console.log('Message received in foreground: ', payload);
          // You can customize how to handle foreground messages here
        });
      }
      
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  } else {
    console.log('Firebase already initialized');
  }
})();