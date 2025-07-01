# Firebase Setup Guide

This guide will help you set up Firebase for your Piza4u application. The project supports both dynamic configuration (via Redux store) and static configuration (for Firebase Studio compatibility).

## Prerequisites

1. A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
2. Firebase CLI installed globally: `npm install -g firebase-tools`

## Configuration Options

### Option 1: Static Configuration (Firebase Studio Compatible)

This is the recommended approach for deployment with Firebase Hosting.

#### Step 1: Get Firebase Configuration

1. Go to your Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Click on the gear icon → Project settings
3. Scroll down to "Your apps" section
4. Click "Add app" and select Web app (or use existing web app)
5. Copy the configuration object

#### Step 2: Update Firebase Configuration

Edit `public/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX" // Optional
};
```

#### Step 3: Configure Firebase Cloud Messaging (Optional)

If you want to use push notifications:

1. In Firebase Console, go to Project settings → Cloud Messaging
2. Generate a Web push certificate (VAPID key)
3. Replace `YOUR_VAPID_KEY` in `public/firebase-config.js` with your actual VAPID key

#### Step 4: Include Scripts in HTML

Add these scripts to your HTML pages where you want to use Firebase:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"></script>

<!-- Firebase Configuration -->
<script src="/firebase-config.js"></script>
<script src="/firebase-init.js"></script>
```

### Option 2: Dynamic Configuration (Existing System)

The application already supports dynamic Firebase configuration loaded from the Redux store. This is used when Firebase settings are managed via your backend/admin panel.

No additional setup is required for this option - it works with the existing `src/@core/firebase.js` service.

## Firebase Services Setup

### Authentication

1. In Firebase Console → Authentication → Sign-in method
2. Enable your preferred sign-in providers (Google, Phone, etc.)
3. Configure authorized domains for production

### Firestore Database

1. In Firebase Console → Firestore Database
2. Create database in production mode
3. Set up security rules based on your requirements

### Cloud Messaging

1. In Firebase Console → Cloud Messaging
2. Generate Web credentials (VAPID key)
3. The service worker `public/firebase-messaging-sw.js` is already configured

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite existing files

4. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Project Structure

```
├── firebase.json                 # Firebase hosting configuration
├── public/
│   ├── firebase-config.js        # Static Firebase configuration
│   ├── firebase-init.js          # Static Firebase initialization
│   └── firebase-messaging-sw.js  # Service worker for messaging
└── src/
    ├── @core/firebase.js         # Dynamic Firebase service
    └── components/FirebaseInitializer.jsx  # React component for initialization
```

## Environment Variables

For development, you can also use environment variables by creating a `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

## Troubleshooting

### Common Issues

1. **"Firebase not defined" error**: Make sure Firebase SDK is loaded before the configuration scripts
2. **Permission denied errors**: Check Firestore security rules
3. **Messaging not working**: Verify VAPID key is correct and service worker is registered
4. **Build fails**: Ensure all Firebase configuration is properly set

### Testing

1. Build the project: `npm run build`
2. Serve locally: `firebase serve` or use any static file server
3. Check browser console for any Firebase initialization errors

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## Security Notes

- Never commit real Firebase credentials to version control
- Use environment variables or secure configuration management for production
- Regularly rotate API keys and security credentials
- Configure proper Firestore security rules for production use