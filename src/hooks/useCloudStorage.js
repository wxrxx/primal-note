import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export function useCloudStorage(key, initialValue) {
    const { currentUser } = useAuth();
    const isFirstSync = useRef(true);

    // Initialize state function
    const initialize = () => {
        try {
            // Always try to read from local storage first for immediate render
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState(initialize);

    // Effect to sync with Firestore when user is logged in
    useEffect(() => {
        // If not logged in, we rely on local state initialized from localStorage
        if (!currentUser) {
            isFirstSync.current = false;
            return;
        }

        // Reference to the document in Firestore
        // Structure: users/{uid}/data/{key}
        const docRef = doc(db, 'users', currentUser.uid, 'data', key);

        // Subscribe to real-time updates
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data().value;
                // Only update if data is actually different to prevent unnecessary re-renders
                setStoredValue(prev => {
                    const prevStr = JSON.stringify(prev);
                    const newStr = JSON.stringify(data);
                    if (prevStr !== newStr) {
                        window.localStorage.setItem(key, newStr);
                        return data;
                    }
                    return prev;
                });
            }
            isFirstSync.current = false;
        });

        return unsubscribe;
    }, [currentUser, key]);

    // Return a wrapped version of useState's setter function that persists data
    const setValue = async (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));

            // If logged in, save to Firestore
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid, 'data', key);
                await setDoc(docRef, { value: valueToStore });
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}
