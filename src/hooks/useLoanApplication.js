import { useState } from 'react';
import { db, storage } from '../config/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { COLLECTIONS } from '../constants/collections';

export const useLoanApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitLoanApplication = async (applicationData, documents) => {
    setLoading(true);
    try {
      // Upload documents first
      const uploadedDocs = await Promise.all(
        documents.map(async (doc) => {
          const storageRef = ref(storage, `documents/${doc.name}`);
          await uploadBytes(storageRef, doc.file);
          const url = await getDownloadURL(storageRef);
          return { name: doc.name, url };
        })
      );

      // Create loan application
      const applicationRef = await addDoc(collection(db, COLLECTIONS.LOAN_APPLICATIONS), {
        ...applicationData,
        documents: uploadedDocs,
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return applicationRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitLoanApplication, loading, error };
}; 