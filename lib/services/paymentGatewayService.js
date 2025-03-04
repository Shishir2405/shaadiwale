// services/paymentGatewayService.js
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from '@/lib/firebase';
  
  const COLLECTION_NAME = 'paymentGateways';
  
  export const paymentGatewayService = {
    // Get all payment gateway settings
    async getAllGateways() {
      try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const gateways = {};
        
        querySnapshot.forEach((doc) => {
          gateways[doc.id] = doc.data();
        });
        
        return gateways;
      } catch (error) {
        console.error('Error getting gateways:', error);
        throw error;
      }
    },
  
    // Get specific gateway settings
    async getGateway(gateway) {
      try {
        const docRef = doc(db, COLLECTION_NAME, gateway);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return docSnap.data();
        }
        
        return null;
      } catch (error) {
        console.error('Error getting gateway:', error);
        throw error;
      }
    },
  
    // Save or update gateway settings
    async saveGateway(gateway, data) {
      try {
        const docRef = doc(db, COLLECTION_NAME, gateway);
        const gatewayData = {
          ...data,
          updatedAt: serverTimestamp(),
        };
  
        await setDoc(docRef, gatewayData, { merge: true });
        return { gateway, ...gatewayData };
      } catch (error) {
        console.error('Error saving gateway:', error);
        throw error;
      }
    },
  
    // Update gateway status
    async updateGatewayStatus(gateway, isActive) {
      try {
        const docRef = doc(db, COLLECTION_NAME, gateway);
        await updateDoc(docRef, {
          isActive,
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('Error updating gateway status:', error);
        throw error;
      }
    }
  };