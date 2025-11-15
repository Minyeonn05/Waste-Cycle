import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDQwZJTHaAS4JLEo2CExBp_3lbGJMHqYCo",
  authDomain: "waste-cy.firebaseapp.com",
  projectId: "waste-cy",
  storageBucket: "waste-cy.appspot.com",
  messagingSenderId: "27038277363",
  appId: "1:27038277363:web:33ec29157710e443cae186"
};

const app = initializeApp(firebaseConfig);

export default app;