"use client";

import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TermsConditionsComponent = () => {
  const [termsContent, setTermsContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [hasScrolled, setHasScrolled] = useState(false);
  const containerRef = useRef(null);

  // Default terms content in HTML format
  const defaultTerms = `
  <h1><strong>Terms and Conditions</strong></h1>
  <h2>Acceptance of Terms</h2>
  <p>By accessing and using this website, you accept and agree to be bound by the terms and conditions set forth in this agreement. If you do not agree to abide by these terms, please do not use this website.</p>
  
  <h2>Use License</h2>
  <p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
  <ul>
    <li><p>Modify or copy the materials</p></li>
    <li><p>Use the materials for any commercial purpose</p></li>
    <li><p>Attempt to decompile or reverse engineer any software contained on the website</p></li>
    <li><p>Remove any copyright or other proprietary notations from the materials</p></li>
    <li><p>Transfer the materials to another person or "mirror" the materials on any other server</p></li>
  </ul>
  
  <h2>Disclaimer</h2>
  <p>The materials on our website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
  
  <h2>Limitations</h2>
  <p>In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
  
  <h2>Governing Law</h2>
  <p>These terms and conditions are governed by and construed in accordance with the laws of your country and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
  `;

  useEffect(() => {
    const fetchTermsContent = async () => {
      setLoading(true);
      try {
        const termsRef = doc(db, "policies", "termsConditions");
        const termsDoc = await getDoc(termsRef);

        if (termsDoc.exists() && termsDoc.data().content) {
          setTermsContent(termsDoc.data().content);
        } else {
          // Use default terms if no data found
          setTermsContent(defaultTerms);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching terms and conditions:", err);
        setError(
          "Failed to load terms and conditions. Please try again later."
        );
        // Use default terms on error
        setTermsContent(defaultTerms);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsContent();
  }, []);

  // Extract sections from HTML content
  useEffect(() => {
    if (!loading && termsContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(termsContent, "text/html");
      const headings = Array.from(doc.querySelectorAll("h2"));

      const extractedSections = headings.map((heading, index) => {
        // Get all elements until the next h2
        const content = [];
        let nextElement = heading.nextElementSibling;

        while (nextElement && nextElement.tagName !== "H2") {
          content.push(nextElement.outerHTML);
          nextElement = nextElement.nextElementSibling;
        }

        return {
          id: `section-${index}`,
          title: heading.textContent,
          content: content.join(""),
        };
      });

      setSections(extractedSections);
    }
  }, [loading, termsContent]);

  // Set up scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPosition = window.scrollY;
        if (scrollPosition > 100 && !hasScrolled) {
          setHasScrolled(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const scrollToContent = () => {
    containerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-pink-200"
            ></motion.div>
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-pink-300 border-dashed"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
            <motion.div
              className="absolute inset-4 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <BookOpen className="w-8 h-8 text-purple-500" />
            </motion.div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Loading terms and conditions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-red-50 rounded-lg shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
      <div className="relative z-10">
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full filter blur-3xl opacity-30 -z-10"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-purple-200 to-pink-300 rounded-full filter blur-3xl opacity-20 -z-10"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 inline-block">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Please read these terms and conditions carefully before using our
          services. By accessing or using our website, you agree to be bound by
          these terms.
        </p>

        {!hasScrolled && (
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="flex flex-col items-center cursor-pointer"
              onClick={scrollToContent}
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-purple-600 mb-2">Explore Terms</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="w-6 h-6 text-pink-500" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      <div ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl p-8 shadow-lg border border-pink-100"
        >
          <div className="mb-8 flex items-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-md mr-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Our Legal Terms
              </h1>
              <p className="text-gray-500 mt-1">
                These terms govern your use of our services
              </p>
            </div>
          </div>

          <AnimatePresence>
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                className="mb-4 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div
                  className={`p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                    expandedSection === index
                      ? "bg-gradient-to-r from-pink-50 to-purple-50 shadow-md"
                      : "hover:bg-pink-50"
                  }`}
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-purple-700 flex items-center">
                      {expandedSection === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-2 h-2 bg-pink-500 rounded-full mr-2"
                        />
                      )}
                      {section.title}
                    </h2>
                    <motion.div
                      animate={{ rotate: expandedSection === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`w-6 h-6 flex items-center justify-center rounded-full ${
                        expandedSection === index
                          ? "bg-pink-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 ${
                          expandedSection === index
                            ? "text-pink-500"
                            : "text-gray-500"
                        }`}
                      />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSection === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-5 pt-2 pb-4 overflow-hidden"
                    >
                      <div
                        className="pt-4 pl-4 border-l-2 border-pink-200 prose prose-pink max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      ></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            className="mt-10 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 shadow-inner"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-purple-800">
                Acceptance
              </h3>
            </div>
            <p className="text-gray-700">
              By using our services, you acknowledge that you have read and
              understood these Terms and Conditions and agree to be bound by
              them.
            </p>
            <div className="mt-4 flex justify-end">
              <motion.button
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg shadow-md"
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 10px 15px -3px rgba(213, 63, 140, 0.1), 0 4px 6px -4px rgba(213, 63, 140, 0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                I Accept
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-center"
          >
            <p className="text-gray-500 text-sm">
              These terms were last updated on:{" "}
              {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsConditionsComponent;
