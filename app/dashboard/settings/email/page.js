"use client"
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";

const EmailSettings = () => {
  const [settings, setSettings] = useState({
    smtp: {
      host: '',
      port: '',
      username: '',
      password: '',
      encryption: 'tls'
    },
    sender: {
      name: '',
      email: ''
    },
    notifications: {
      welcomeEmail: true,
      matchAlert: true,
      messageReceived: true,
      profileView: true,
      subscriptionExpiry: true
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "siteSettings", "email");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, "siteSettings", "email"), settings);
      toast.success('Email settings updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update settings');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Email Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg">SMTP Configuration</h3>
          
          <div>
            <Label>Host</Label>
            <Input
              value={settings.smtp.host}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                smtp: { ...prev.smtp, host: e.target.value }
              }))}
              placeholder="smtp.example.com"
              required
            />
          </div>

          <div>
            <Label>Port</Label>
            <Input
              type="number"
              value={settings.smtp.port}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                smtp: { ...prev.smtp, port: e.target.value }
              }))}
              placeholder="587"
              required
            />
          </div>

          <div>
            <Label>Username</Label>
            <Input
              value={settings.smtp.username}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                smtp: { ...prev.smtp, username: e.target.value }
              }))}
              placeholder="username@example.com"
              required
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={settings.smtp.password}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                smtp: { ...prev.smtp, password: e.target.value }
              }))}
              placeholder="Enter SMTP password"
              required
            />
          </div>

          <div>
            <Label>Encryption</Label>
            <select
              className="w-full p-2 border rounded"
              value={settings.smtp.encryption}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                smtp: { ...prev.smtp, encryption: e.target.value }
              }))}
            >
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg">Sender Information</h3>
          
          <div>
            <Label>Sender Name</Label>
            <Input
              value={settings.sender.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                sender: { ...prev.sender, name: e.target.value }
              }))}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div>
            <Label>Sender Email</Label>
            <Input
              type="email"
              value={settings.sender.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                sender: { ...prev.sender, email: e.target.value }
              }))}
              placeholder="noreply@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-semibold text-lg">Email Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Welcome Email</Label>
              <Switch
                checked={settings.notifications.welcomeEmail}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, welcomeEmail: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Match Alert</Label>
              <Switch
                checked={settings.notifications.matchAlert}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, matchAlert: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Message Received</Label>
              <Switch
                checked={settings.notifications.messageReceived}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, messageReceived: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Profile View</Label>
              <Switch
                checked={settings.notifications.profileView}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, profileView: checked }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Subscription Expiry</Label>
              <Switch
                checked={settings.notifications.subscriptionExpiry}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, subscriptionExpiry: checked }
                }))}
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EmailSettings;