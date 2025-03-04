"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Shield, Lock, Eye } from "lucide-react";
import { motion } from "framer-motion";

const PrivacyPolicyComponent = () => {
  const [policyContent, setPolicyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default privacy policy content in HTML format
  const defaultPolicy = `
  <h1><strong>Privacy Policy</strong></h1>
  <h2>Introduction</h2>
  <p>At [Your Company], we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
  
  <h2>Information We Collect</h2>
  <h3>Personal Data</h3>
  <p>We may collect, use, store, and transfer different kinds of personal data about you which we have grouped as follows:</p>
  <ul>
    <li><p>Identity Data: includes first name, last name, username</p></li>
    <li><p>Contact Data: includes email address and telephone numbers</p></li>
    <li><p>Technical Data: includes internet protocol (IP) address, your login data, browser type and version</p></li>
    <li><p>Usage Data: includes information about how you use our website and services</p></li>
  </ul>
  
  <h3>How We Collect Your Data</h3>
  <p>We use different methods to collect data from and about you including through:</p>
  <ul>
    <li><p>Direct interactions when you fill in forms or correspond with us</p></li>
    <li><p>Automated technologies or interactions as you navigate through our site</p></li>
    <li><p>Third parties or publicly available sources</p></li>
  </ul>
  
  <h2>How We Use Your Information</h2>
  <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
  <ul>
    <li><p>To provide and maintain our service</p></li>
    <li><p>To notify you about changes to our service</p></li>
    <li><p>To allow you to participate in interactive features</p></li>
    <li><p>To provide customer support</p></li>
    <li><p>To gather analysis or valuable information to improve our service</p></li>
  </ul>
  
  <h2>Data Security</h2>
  <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.</p>
  
  <h2>Your Legal Rights</h2>
  <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including:</p>
  <ul>
    <li><p>The right to access</p></li>
    <li><p>The right to rectification</p></li>
    <li><p>The right to erasure</p></li>
    <li><p>The right to restrict processing</p></li>
    <li><p>The right to data portability</p></li>
    <li><p>The right to object</p></li>
  </ul>
  
  <h2>Contact Us</h2>
  <p>If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@yourcompany.com.</p>
  `;

  useEffect(() => {
    const fetchPolicyContent = async () => {
      setLoading(true);
      try {
        const policyRef = doc(db, "policies", "privacyPolicy");
        const policyDoc = await getDoc(policyRef);

        if (policyDoc.exists() && policyDoc.data().content) {
          setPolicyContent(policyDoc.data().content);
        } else {
          // Use default policy if no data found
          setPolicyContent(defaultPolicy);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
        setError("Failed to load privacy policy. Please try again later.");
        // Use default policy on error
        setPolicyContent(defaultPolicy);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative w-20 h-20 mx-auto"
          >
            <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500"></div>
          </motion.div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading privacy policy...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg shadow-lg">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="mt-4 text-gray-600">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-8 shadow-lg border border-pink-100"
      >
        <div className="mb-8 flex items-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-md mr-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Privacy Protection
            </h1>
            <p className="text-gray-500 mt-1">
              How we safeguard your personal information
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-pink max-w-none"
          dangerouslySetInnerHTML={{ __html: policyContent }}
        ></motion.div>

        <motion.div
          className="mt-10 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 shadow-inner"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Lock className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800">
              Your Data Security is Our Priority
            </h3>
          </div>
          <p className="text-gray-700">
            We implement industry-standard security measures to protect your
            personal information. If you have any concerns about your privacy,
            please don't hesitate to contact us.
          </p>
          <div className="mt-4 flex justify-end">
            <a
              href="mailto:privacy@yourcompany.com"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Eye className="w-4 h-4 mr-2" />
              Privacy Inquiry
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center"
        >
          <p className="text-gray-500 text-sm">
            This policy was last updated on: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicyComponent;
