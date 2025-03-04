"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";

const RefundPolicy = () => {
  const [policyContent, setPolicyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default policy content in HTML format (converted from the markdown default)
  const defaultPolicy = `
  <h1><strong>Refund Policy</strong></h1>
  <h2>Overview</h2>
  <p>We strive for 100% customer satisfaction. If you're not satisfied with your purchase, we offer a straightforward refund policy.</p>
  <h2>Eligibility</h2>
  <ul>
    <li><p>Products must be returned within 30 days of purchase</p></li>
    <li><p>Items must be in original packaging and unused</p></li>
    <li><p>Proof of purchase is required</p></li>
  </ul>
  <h2>How to Request a Refund</h2>
  <ol>
    <li><p>Contact our customer service team at support@example.com</p></li>
    <li><p>Provide your order number and reason for return</p></li>
    <li><p>Follow the return instructions provided by our team</p></li>
  </ol>
  <h2>Processing Time</h2>
  <ul>
    <li><p>Refunds are typically processed within 5-7 business days</p></li>
    <li><p>Credit card refunds may take an additional 2-5 business days to appear on your statement</p></li>
  </ul>
  <h2>Exceptions</h2>
  <ul>
    <li><p>Digital products and services cannot be refunded once accessed</p></li>
    <li><p>Customized products are non-refundable unless defective</p></li>
    <li><p>Sale items are final and cannot be refunded</p></li>
  </ul>
  <p>For any questions about our refund policy, please contact our customer service team.</p>
  `;

  useEffect(() => {
    const fetchPolicyContent = async () => {
      setLoading(true);
      try {
        const policyRef = doc(db, "policies", "refundPolicy");
        const policyDoc = await getDoc(policyRef);

        if (policyDoc.exists() && policyDoc.data().content) {
          setPolicyContent(policyDoc.data().content);
        } else {
          // Use default policy if no data found
          setPolicyContent(defaultPolicy);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching refund policy:", err);
        setError("Failed to load refund policy. Please try again later.");
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
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-pink-200"
            ></motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-pink-500 border-r-purple-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            ></motion.div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading refund policy...
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-8 shadow-lg border border-pink-100"
      >
        <div className="mb-6 flex items-center">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center shadow-md mr-4">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Our Policies</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-pink max-w-none"
          dangerouslySetInnerHTML={{ __html: policyContent }}
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100"
        >
          <p className="text-gray-700 text-sm">
            This policy was last updated on: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy;
