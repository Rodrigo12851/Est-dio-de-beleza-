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

// Connect directly to standard (default) Firestore database for project studio-de-beleza-8045a
export const db = getFirestore(app);
