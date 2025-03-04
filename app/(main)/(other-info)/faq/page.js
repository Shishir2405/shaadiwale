"use client"

import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback FAQ data in case Firebase data isn't available
  const fallbackFaqs = [
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day money-back guarantee for all our products. Items must be unused and in their original packaging."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email that you can use to monitor your delivery status."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay."
    }
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const faqCollection = collection(db, "faqs");
        const faqSnapshot = await getDocs(faqCollection);
        
        if (!faqSnapshot.empty) {
          const faqs = faqSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            question: doc.data().question || 'Untitled Question',
            answer: doc.data().answer || 'No answer provided'
          }));
          
          // Sort by order field if it exists, otherwise by question alphabetically
          const sortedFaqs = faqs.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) {
              return a.order - b.order;
            }
            return a.question.localeCompare(b.question);
          });
          
          setFaqData(sortedFaqs);
        } else {
          // Use fallback data if no FAQs found
          setFaqData(fallbackFaqs);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        // Use fallback data on error
        setFaqData(fallbackFaqs);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
        Frequently Asked Questions
      </h2>
      
      {faqData.length === 0 ? (
        <div className="text-center p-8 border border-dashed border-gray-300 rounded-xl">
          <p className="text-gray-500">No FAQs available at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={faq.id || index}
              className="group border border-gray-200 rounded-xl overflow-hidden transition-all duration-500 ease-in-out hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-5 text-left flex justify-between items-center bg-white transition-all duration-300"
              >
                <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-all duration-500 transform ${
                    openIndex === index ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              
              <div
                className={`transform transition-all duration-500 ease-out origin-top ${
                  openIndex === index
                    ? 'scale-y-100 opacity-100'
                    : 'scale-y-0 opacity-0 h-0'
                }`}
              >
                <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQ;