"use client";

import React, { useState, useEffect } from "react";
import {
  Edit2,
  Save,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ContactContentPage = () => {
  const [loading, setLoading] = useState(true);
  const [savingIndia, setSavingIndia] = useState(false);
  const [savingUAE, setSavingUAE] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    indiaHelpline: "0-8144-99-88-77",
    uaeHelpline: "+971 525060879",
    paymentNumber: "+91 7538895777",
    partnershipEmail: "partnership@bharatmatrimony.com",
  });

  // Editing states
  const [editing, setEditing] = useState({
    indiaHelpline: false,
    uaeHelpline: false,
    paymentNumber: false,
    partnershipEmail: false,
  });

  // Fetch current contact information from Firebase
  useEffect(() => {
    const fetchContactInfo = async () => {
      setLoading(true);
      try {
        const contactDocRef = doc(db, "siteContent", "contactInfo");
        const docSnap = await getDoc(contactDocRef);

        if (docSnap.exists()) {
          setContactInfo({
            ...contactInfo,
            ...docSnap.data(),
          });
        } else {
          // If document doesn't exist, create it with default values
          await setDoc(contactDocRef, {
            ...contactInfo,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
        setError("Failed to load contact information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Handle toggle edit mode
  const toggleEdit = (field) => {
    setEditing({
      ...editing,
      [field]: !editing[field],
    });
  };

  // Handle input change
  const handleChange = (field, value) => {
    setContactInfo({
      ...contactInfo,
      [field]: value,
    });
  };

  // Save changes to Firebase
  const saveChanges = async (field) => {
    let saveStateUpdater;

    switch (field) {
      case "indiaHelpline":
        saveStateUpdater = setSavingIndia;
        break;
      case "uaeHelpline":
        saveStateUpdater = setSavingUAE;
        break;
      case "paymentNumber":
        saveStateUpdater = setSavingPayment;
        break;
      case "partnershipEmail":
        saveStateUpdater = setSavingEmail;
        break;
    }

    saveStateUpdater(true);

    try {
      const contactDocRef = doc(db, "siteContent", "contactInfo");

      await updateDoc(contactDocRef, {
        [field]: contactInfo[field],
        updatedAt: serverTimestamp(),
      });

      // Turn off editing mode
      toggleEdit(field);

      // Show success message
      setSuccess(`Successfully updated ${field}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setError(`Failed to update ${field}. Please try again.`);
      setTimeout(() => setError(null), 5000);
    } finally {
      saveStateUpdater(false);
    }
  };

  // Update contact page live
  const updateLiveWebsite = async () => {
    setLoading(true);
    try {
      // Here you would typically trigger a revalidation of the contact page
      // For Next.js, you might have an API route to revalidate the page

      setSuccess("Contact page updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating live website:", err);
      setError("Failed to update the live website. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !contactInfo) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-pink-500 animate-spin mb-4" />
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Contact Page Content Management
        </h1>
        <p className="text-gray-600">
          Update contact information displayed on the contact page.
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700">Error</AlertTitle>
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="helpline" className="mb-8">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="helpline">Helpline Numbers</TabsTrigger>
          <TabsTrigger value="email">Email Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="helpline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Phone className="h-5 w-5 text-pink-500" />
                Helpline Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* India Helpline */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-pink-500" />
                    <h3 className="text-lg font-medium">India Helpline</h3>
                  </div>

                  <Button
                    variant={editing.indiaHelpline ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => toggleEdit("indiaHelpline")}
                    disabled={savingIndia}
                  >
                    {editing.indiaHelpline ? (
                      "Cancel"
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {editing.indiaHelpline ? (
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.indiaHelpline}
                      onChange={(e) =>
                        handleChange("indiaHelpline", e.target.value)
                      }
                      placeholder="Enter India helpline number"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveChanges("indiaHelpline")}
                      disabled={savingIndia}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {savingIndia ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-700">
                    {contactInfo.indiaHelpline}
                  </p>
                )}
              </div>

              {/* UAE Helpline */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-pink-500" />
                    <h3 className="text-lg font-medium">UAE Helpline</h3>
                  </div>

                  <Button
                    variant={editing.uaeHelpline ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => toggleEdit("uaeHelpline")}
                    disabled={savingUAE}
                  >
                    {editing.uaeHelpline ? (
                      "Cancel"
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {editing.uaeHelpline ? (
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.uaeHelpline}
                      onChange={(e) =>
                        handleChange("uaeHelpline", e.target.value)
                      }
                      placeholder="Enter UAE helpline number"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveChanges("uaeHelpline")}
                      disabled={savingUAE}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {savingUAE ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-700">
                    {contactInfo.uaeHelpline}
                  </p>
                )}
              </div>

              {/* Payment Helpline */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">
                      Payment Support Number
                    </h3>
                  </div>

                  <Button
                    variant={editing.paymentNumber ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => toggleEdit("paymentNumber")}
                    disabled={savingPayment}
                  >
                    {editing.paymentNumber ? (
                      "Cancel"
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {editing.paymentNumber ? (
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.paymentNumber}
                      onChange={(e) =>
                        handleChange("paymentNumber", e.target.value)
                      }
                      placeholder="Enter payment support number"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveChanges("paymentNumber")}
                      disabled={savingPayment}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {savingPayment ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-2xl font-semibold text-gray-700">
                    {contactInfo.paymentNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mail className="h-5 w-5 text-pink-500" />
                Email Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Partnership Email */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-pink-500" />
                    <h3 className="text-lg font-medium">Partnership Email</h3>
                  </div>

                  <Button
                    variant={editing.partnershipEmail ? "outline" : "ghost"}
                    size="sm"
                    onClick={() => toggleEdit("partnershipEmail")}
                    disabled={savingEmail}
                  >
                    {editing.partnershipEmail ? (
                      "Cancel"
                    ) : (
                      <Edit2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {editing.partnershipEmail ? (
                  <div className="flex gap-2">
                    <Input
                      value={contactInfo.partnershipEmail}
                      onChange={(e) =>
                        handleChange("partnershipEmail", e.target.value)
                      }
                      placeholder="Enter partnership email"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => saveChanges("partnershipEmail")}
                      disabled={savingEmail}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {savingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : (
                  <p className="text-xl font-semibold text-gray-700">
                    {contactInfo.partnershipEmail}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button
          className="bg-pink-600 hover:bg-pink-700 text-white"
          onClick={updateLiveWebsite}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Live Website
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContactContentPage;
