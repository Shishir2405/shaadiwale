"use client";
// app/dashboard/cms-pages/page.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Edit2,
  Search,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  orderBy,
  setDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { initialCMSPages } from '@/constant/cmsData';

const CMSPages = () => {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    initializeAndFetchPages();
  }, []);

  const initializeAndFetchPages = async () => {
    try {
      // First, ensure all initial pages exist
      for (const page of initialCMSPages) {
        const docRef = doc(db, 'cms_pages', page.id);
        await setDoc(docRef, {
          ...page,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      }

      // Then fetch all pages
      const pagesRef = collection(db, 'cms_pages');
      const q = query(pagesRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const pagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPages(pagesData);
    } catch (error) {
      console.error('Error initializing/fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 text-[#e71c5d] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">CMS Pages</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#e71c5d] outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Content</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <motion.tr
                key={page.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{page.title}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-600 max-w-md truncate">
                    {typeof page.content === 'object' 
                      ? JSON.stringify(page.content)
                      : page.content
                    }
                  </div>
                </td>
                <td className="px-6 py-4">
                  {page.content === 'Coming soon' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Draft
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Published
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => router.push(`/dashboard/cms-pages/edit/${page.id}`)}
                    className="text-[#e71c5d] hover:text-[#d41851] inline-flex items-center gap-1"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CMSPages;