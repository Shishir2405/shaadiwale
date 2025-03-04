"use client";

import React from 'react';
import { usePayment } from '@/context/PaymentContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export const PaymentProcessor = ({ 
  amount, 
  orderId, 
  description,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onError 
}) => {
  const { gateways, activeGateway, processPayment } = usePayment();
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      const result = await processPayment(amount, {
        orderId,
        description,
        customerName,
        customerEmail,
        customerPhone
      });

      if (result) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        onSuccess?.(result);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment.",
        variant: "destructive"
      });
      onError?.(error);
    }
  };

  if (!activeGateway || !gateways[activeGateway]) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment Not Available</CardTitle>
          <CardDescription>
            No payment gateway is currently configured. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Amount to pay: ₹{amount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Payment Method: {activeGateway.charAt(0).toUpperCase() + activeGateway.slice(1)}
          </div>
          {activeGateway === 'bank' && (
            <div className="text-sm">
              <p>Bank: {gateways.bank.credentials.bankName}</p>
              <p>Account: {gateways.bank.credentials.accountNumber}</p>
              <p>IFSC: {gateways.bank.credentials.ifscCode}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handlePayment}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          Pay Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentProcessor;