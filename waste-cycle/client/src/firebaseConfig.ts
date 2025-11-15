import admin from 'firebase-admin';
import serviceAccount from './waste-cy-firebase-adminsdk-v4a5t-61f26533c3.json' assert { type: 'json' };

let app;

if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'waste-cy',
  });
} else {
  app = admin.app();
}

const auth = app.auth();
const db = app.firestore();
const storage = app.storage();

export { auth, db, storage, app };