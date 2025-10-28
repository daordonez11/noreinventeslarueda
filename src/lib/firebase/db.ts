import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  WhereFilterOp,
  Query,
  DocumentData,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { adminDb } from './admin';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  LIBRARIES: 'libraries',
  VOTES: 'votes',
} as const;

// Types matching Prisma models
export interface User {
  id: string;
  email: string;
  name: string;
  oauthProvider: string;
  oauthId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  slug: string;
  nameEs: string;
  nameEn: string;
  descriptionEs?: string;
  descriptionEn?: string;
  icon?: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Library {
  id: string;
  categoryId: string;
  name: string;
  descriptionEs: string;
  descriptionEn?: string;
  githubUrl: string;
  githubId?: number;
  stars: number;
  forks: number;
  language?: string;
  lastCommitDate?: Date;
  lastGithubSync?: Date;
  curationScore: number;
  communityVotesSum: number;
  deprecatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  libraryId: string;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}

// Convert Firestore Timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Generic CRUD operations for client-side
export const firestoreClient = {
  // Get a single document
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data } as T;
    }
    return null;
  },

  // Get multiple documents with query
  async getDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  // Create or update a document
  async setDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  },

  // Update a document
  async updateDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data as any);
  },

  // Delete a document
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },
};

// Generic CRUD operations for server-side (admin)
export const firestoreAdmin = {
  // Get a single document
  async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    const docRef = adminDb.collection(collectionName).doc(docId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      return { id: docSnap.id, ...data } as T;
    }
    return null;
  },

  // Get multiple documents with query
  async getDocuments<T>(
    collectionName: string,
    queryFn?: (ref: FirebaseFirestore.CollectionReference) => FirebaseFirestore.Query
  ): Promise<T[]> {
    let ref: FirebaseFirestore.Query = adminDb.collection(collectionName);
    
    if (queryFn) {
      ref = queryFn(adminDb.collection(collectionName));
    }
    
    const querySnapshot = await ref.get();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  // Create or update a document
  async setDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = adminDb.collection(collectionName).doc(docId);
    await docRef.set(data, { merge: true });
  },

  // Update a document
  async updateDocument<T>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ): Promise<void> {
    const docRef = adminDb.collection(collectionName).doc(docId);
    await docRef.update(data);
  },

  // Delete a document
  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    const docRef = adminDb.collection(collectionName).doc(docId);
    await docRef.delete();
  },

  // Batch operations
  async batchWrite(
    operations: Array<{
      type: 'set' | 'update' | 'delete';
      collection: string;
      docId: string;
      data?: any;
    }>
  ): Promise<void> {
    const batch = adminDb.batch();
    
    operations.forEach(op => {
      const docRef = adminDb.collection(op.collection).doc(op.docId);
      
      if (op.type === 'set') {
        batch.set(docRef, op.data, { merge: true });
      } else if (op.type === 'update') {
        batch.update(docRef, op.data);
      } else if (op.type === 'delete') {
        batch.delete(docRef);
      }
    });
    
    await batch.commit();
  },
};
