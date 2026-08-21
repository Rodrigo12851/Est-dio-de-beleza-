import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD67kLzURLYIbDozET0SqaWFE3X4fCsf1k",
  authDomain: "studio-de-beleza-8045a.firebaseapp.com",
  databaseURL: "https://studio-de-beleza-8045a-default-rtdb.firebaseio.com",
  projectId: "studio-de-beleza-8045a",
  storageBucket: "studio-de-beleza-8045a.firebasestorage.app",
  messagingSenderId: "152184282359",
  appId: "1:152184282359:web:ddf731f01d5e784714c7f2",
  measurementId: "G-XJLHGC08WP"
};

// Initialize or reuse existing app instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target Firestore Database ID from AI Studio provisioning
const PROVISIONED_DB_ID = "ai-studio-studiobellaagend-7905ecf7-8a32-4b39-845f-c7bc92c568b1";

let firestoreInstance: Firestore;
try {
  firestoreInstance = getFirestore(app, PROVISIONED_DB_ID);
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
