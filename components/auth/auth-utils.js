// auth-utils.js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '@/lib/firebase';

const db = getFirestore();

// Email sign in with Firestore data fetch
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    const userData = userDoc.data();

    // Update last login
    await setDoc(userDocRef, {
      lastLoginAt: new Date().toISOString()
    }, { merge: true });

    return { user, userData };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Phone number validation
export const validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid length
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false;
  }
  
  return true;
};

// Format phone number for Firebase
export const formatPhoneNumber = (phoneNumber, countryCode = '+91') => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  return countryCode + cleaned;
};

// Error message mapper
export const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-credential': 'Invalid email or password',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Invalid email format',
    'auth/user-disabled': 'This account has been disabled',
    'auth/invalid-phone-number': 'Invalid phone number format',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/code-expired': 'Verification code has expired',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    default: 'Authentication failed. Please try again'
  };
  return errorMessages[errorCode] || errorMessages.default;
};