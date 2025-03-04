"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save } from 'lucide-react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import 'react-quill/dist/quill.snow.css';

// Dynamic import for React-Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-50 animate-pulse rounded-lg" />
});

const modules = {
  toolbar: [
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'align': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'script',
  'align',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
];

const CMSEditor = () => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    pageName: '',
    pageTitle: '',
    content: '',
    status: 'Active'
  });

  const fetchPage = async () => {
    if (!params?.id) return;
    
    try {
      const docRef = doc(db, 'cms_pages', params.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const pageData = docSnap.data();
        setFormData({
          pageName: pageData.pageName || '',
          pageTitle: pageData.pageTitle || '',
          content: pageData.content || '',
          status: pageData.status || 'Active'
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching page:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [params?.id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const docRef = doc(db, 'cms_pages', params.id);
      await updateDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp()
      });
      
      router.push('/dashboard/cms-pages');
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {params?.id ? 'Edit CMS Page' : 'New CMS Page'}
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Name:
                </label>
                <input
                  type="text"
                  value={formData.pageName}
                  onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e71c5d] focus:border-transparent"
                  placeholder="Enter page name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Title:
                </label>
                <input
                  type="text"
                  value={formData.pageTitle}
                  onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e71c5d] focus:border-transparent"
                  placeholder="Enter page title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Content:
              </label>
              <div className="border rounded-lg">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  modules={modules}
                  formats={formats}
                  className="h-96 mb-12"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status:
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#e71c5d] focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/dashboard/cms-pages')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#e71c5d] text-white rounded-lg hover:bg-[#d41851] disabled:bg-gray-400 flex items-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CMSEditor;