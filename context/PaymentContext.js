// contexts/PaymentContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { 
  initializeRazorpay, 
  initializePayUMoney, 
  processDirectBankTransfer 
} from '@/utils/paymentUtils';

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [gateways, setGateways] = useState({
    razorpay: null,
    payumoney: null,
    bank: null
  });
  
  const [activeGateway, setActiveGateway] = useState(null);

  // Listen for gateway configuration changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'paymentGateways'),
      (snapshot) => {
        const updatedGateways = {};
        snapshot.forEach((doc) => {
          if (doc.data().isActive) {
            updatedGateways[doc.id] = doc.data();
            if (!activeGateway) {
              setActiveGateway(doc.id);
            }
          }
        });
        setGateways(updatedGateways);
      }
    );

    return () => unsubscribe();
  }, []);

  const processPayment = async (amount, orderDetails) => {
    if (!activeGateway || !gateways[activeGateway]) {
      throw new Error('No active payment gateway configured');
    }

    const gateway = gateways[activeGateway];
    const amountInSmallestUnit = amount * 100; // Convert to paise/cents

    try {
      switch (activeGateway) {
        case 'razorpay':
          return await initializeRazorpay({
            key: gateway.credentials.razorpayKey,
            amount: amountInSmallestUnit,
            currency: 'INR',
            name: orderDetails.businessName || 'Your Business',
            description: orderDetails.description || 'Order Payment',
            orderId: orderDetails.orderId,
            customerName: orderDetails.customerName,
            customerEmail: orderDetails.customerEmail,
            customerPhone: orderDetails.customerPhone
          });

        case 'payumoney':
          return await initializePayUMoney({
            merchantKey: gateway.credentials.merchantKey,
            transactionId: orderDetails.orderId,
            amount: amount,
            productInfo: orderDetails.description,
            customerName: orderDetails.customerName,
            customerEmail: orderDetails.customerEmail,
            customerPhone: orderDetails.customerPhone,
            successUrl: `${window.location.origin}/payment/success`,
            failureUrl: `${window.location.origin}/payment/failure`,
            hash: orderDetails.hash // Generate this server-side
          });

        case 'bank':
          return await processDirectBankTransfer(gateway.credentials);

        default:
          throw new Error('Invalid payment gateway');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  return (
    <PaymentContext.Provider value={{
      gateways,
      activeGateway,
      setActiveGateway,
      processPayment
    }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};