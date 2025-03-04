"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Trash2, Upload, Save, AlertCircle } from 'lucide-react';

const PaymentSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    razorpay: {
      enabled: false,
      key: '',
      secretKey: ''
    },
    qr: {
      enabled: false,
      imageUrl: '',
      instructions: ''
    },
    bank: {
      enabled: false,
      accountName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: ''
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'payment');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    }
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `payment/qr-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      setSettings(prev => ({
        ...prev,
        qr: {
          ...prev.qr,
          imageUrl: url
        }
      }));
      
      setSuccess('QR code uploaded successfully');
    } catch (err) {
      setError('Failed to upload QR code');
      console.error('Error uploading QR:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (type) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const docRef = doc(db, 'settings', 'payment');
      await setDoc(docRef, settings, { merge: true });
      
      setSuccess(`${type} settings updated successfully`);
    } catch (err) {
      setError(`Failed to update ${type} settings`);
      console.error('Error updating settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: !prev[type].enabled
      }
    }));
  };

  const handleInputChange = (type, field, value) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
        <p className="text-gray-600">Manage your payment gateway configurations</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-700 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="razorpay" className="space-y-6">
        <TabsList className="grid grid-cols-3 gap-4 bg-muted p-1">
          <TabsTrigger value="razorpay" className="data-[state=active]:bg-white">
            Razorpay
          </TabsTrigger>
          <TabsTrigger value="qr" className="data-[state=active]:bg-white">
            QR Payment
          </TabsTrigger>
          <TabsTrigger value="bank" className="data-[state=active]:bg-white">
            Bank Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="razorpay">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Razorpay Configuration</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.razorpay.enabled}
                    onCheckedChange={() => handleToggle('razorpay')}
                  />
                  <Label>Enable Razorpay</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    placeholder="Enter Razorpay API Key"
                    value={settings.razorpay.key}
                    onChange={(e) => handleInputChange('razorpay', 'key', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter Razorpay Secret Key"
                    value={settings.razorpay.secretKey}
                    onChange={(e) => handleInputChange('razorpay', 'secretKey', e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSubmit('razorpay')}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Razorpay Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>QR Code Payment</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.qr.enabled}
                    onCheckedChange={() => handleToggle('qr')}
                  />
                  <Label>Enable QR Payment</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Instructions</Label>
                    <Input
                      placeholder="Enter payment instructions"
                      value={settings.qr.instructions}
                      onChange={(e) => handleInputChange('qr', 'instructions', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="block mb-2">QR Code Image</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('qr-upload').click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload QR
                      </Button>
                      {settings.qr.imageUrl && (
                        <Button
                          variant="destructive"
                          onClick={() => handleInputChange('qr', 'imageUrl', '')}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <input
                      type="file"
                      id="qr-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleQRUpload}
                    />
                  </div>
                </div>
                {settings.qr.imageUrl && (
                  <div className="border rounded-lg p-4">
                    <img
                      src={settings.qr.imageUrl}
                      alt="Payment QR Code"
                      className="max-w-full h-auto"
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleSubmit('qr')}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save QR Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bank Account Details</CardTitle>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.bank.enabled}
                    onCheckedChange={() => handleToggle('bank')}
                  />
                  <Label>Enable Bank Transfer</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Holder Name</Label>
                  <Input
                    placeholder="Enter account holder name"
                    value={settings.bank.accountName}
                    onChange={(e) => handleInputChange('bank', 'accountName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Enter account number"
                    value={settings.bank.accountNumber}
                    onChange={(e) => handleInputChange('bank', 'accountNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="Enter bank name"
                    value={settings.bank.bankName}
                    onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    placeholder="Enter IFSC code"
                    value={settings.bank.ifscCode}
                    onChange={(e) => handleInputChange('bank', 'ifscCode', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input
                    placeholder="Enter branch name"
                    value={settings.bank.branch}
                    onChange={(e) => handleInputChange('bank', 'branch', e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSubmit('bank')}
                disabled={loading}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Bank Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;