importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

let firebaseInitialized = false;

self.addEventListener("message", (event) => {
  // console.log('Service Worker received message:', event.data);
  if (event.data && event.data.type === "INIT_FIREBASE") {
    const firebaseConfig = event.data.config;
    // console.log('Received Firebase config:', firebaseConfig);

    if (!firebaseInitialized) {
      try {
        firebase.initializeApp(firebaseConfig);
        // console.log('Firebase initialized in Service Worker');
        const messaging = firebase.messaging();
        firebaseInitialized = true;

        // Listen for background messages
        messaging.onBackgroundMessage((payload) => {
          console.log("Received background message ", payload);
          const notificationTitle = payload.data.title;
          const notificationOptions = {
            body: payload.data.body,
            icon: payload.data.image,
          };

          self.registration.showNotification(
            notificationTitle,
            notificationOptions
          );
        });
      } catch (error) {
        console.error("Error initializing Firebase in Service Worker:", error);
      }
    } else {
      // console.log("Firebase already initialized in Service Worker");
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click event in Service Worker:", event);
});
