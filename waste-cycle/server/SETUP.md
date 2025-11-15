# Backend Server Setup Guide

## Firebase Admin SDK Configuration

The backend server requires Firebase Admin SDK credentials to interact with Firebase services. You have two options:

### Option 1: Service Account JSON File (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/waste-cycle-a6c6e/settings/serviceaccounts/adminsdk
   - Or: Firebase Console > Project Settings > Service Accounts

2. **Generate Private Key**
   - Click "Generate new private key"
   - Confirm by clicking "Generate key"
   - A JSON file will be downloaded

3. **Place the File**
   - Move the downloaded JSON file to the `waste-cycle/server/` directory
   - The file should be named: `waste-cycle-a6c6e-firebase-adminsdk-xxxxx.json`
   - The server will auto-detect it!

### Option 2: Environment Variables

Create a `.env` file in the `waste-cycle/server/` directory:

```env
FIREBASE_PROJECT_ID=waste-cycle-a6c6e
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@waste-cycle-a6c6e.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=waste-cycle-a6c6e.firebasestorage.app
FIREBASE_DATABASE_URL=https://waste-cycle-a6c6e.firebaseio.com

PORT=8000
```

**Important:** 
- Replace `xxxxx` with your actual service account values
- Get these values from the service account JSON file
- Keep your `.env` file secure and never commit it to git

## Running the Server

After setting up Firebase credentials:

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:8000` by default.

## Troubleshooting

- **Error: "Firebase configuration not found"**
  - Make sure you've followed one of the options above
  - Check that the service account JSON file is in the correct directory
  - Verify your `.env` file has all required variables

- **Error: "Could not read service account file"**
  - Check the file path is correct
  - Verify the file has proper JSON format
  - Ensure the file has read permissions

