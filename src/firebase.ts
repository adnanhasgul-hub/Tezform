import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDtzjLH0thK5qp7n-DtEihVWJ5ikaLMLuA",
  authDomain: "erukvcaistudio.firebaseapp.com",
  projectId: "erukvcaistudio",
  storageBucket: "erukvcaistudio.firebasestorage.app",
  messagingSenderId: "474369625176",
  appId: "1:474369625176:web:777acfeb0dfe8c9de80e2d",
  measurementId: "G-805XBRDBHS"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, "ai-studio-tezform-8d501b7f-cef4-4e86-bd28-bd6dead57dac");

export const PATIENTS_COLLECTION = 'patients';
export const QUESTIONS_COLLECTION = 'custom_questions';

export interface PatientRecord {
  id?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

// Add patient directly to Cloud Firestore (Strict: throws error if offline or failed)
export const savePatientToFirestore = async (data: Record<string, any>): Promise<{ id: string }> => {
  const patientData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timestampIso: new Date().toISOString(),
  };

  const colRef = collection(db, PATIENTS_COLLECTION);
  const docRef = await addDoc(colRef, patientData);
  return { id: docRef.id };
};

// Fetch all patients directly from Cloud Firestore
export const fetchAllPatients = async (): Promise<PatientRecord[]> => {
  const colRef = collection(db, PATIENTS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  const records: PatientRecord[] = [];
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    records.push({
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt || data.timestampIso,
    });
  });

  return records;
};

// Update patient in Cloud Firestore
export const updatePatientInFirestore = async (id: string, updatedFields: Record<string, any>): Promise<boolean> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updatedFields,
    updatedAt: serverTimestamp(),
  });
  return true;
};

// Delete patient from Cloud Firestore
export const deletePatientFromFirestore = async (id: string): Promise<boolean> => {
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
  return true;
};

// Fetch custom questions from Cloud Firestore
export const fetchCustomQuestions = async (): Promise<any[]> => {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  const snapshot = await getDocs(colRef);
  const list: any[] = [];
  snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
  return list;
};

// Add custom question directly to Cloud Firestore
export const addCustomQuestionToFirestore = async (questionData: any): Promise<string> => {
  const colRef = collection(db, QUESTIONS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...questionData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Delete custom question from Cloud Firestore
export const deleteCustomQuestionFromFirestore = async (id: string): Promise<boolean> => {
  const docRef = doc(db, QUESTIONS_COLLECTION, id);
  await deleteDoc(docRef);
  return true;
};
