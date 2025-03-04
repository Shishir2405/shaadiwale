"use client";

import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  ImageIcon,
  FileType, 
  FileSpreadsheet, 
  File, 
  Check, 
  X, 
  Upload,
  Loader2
} from 'lucide-react';

// Utility to get file icon based on type
const getFileIcon = (fileType) => {
  if (fileType.includes('image')) return <ImageIcon className="w-12 h-12 text-pink-500" />;
  if (fileType.includes('pdf')) return <FileType className="w-12 h-12 text-pink-500" />;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-12 h-12 text-pink-500" />;
  if (fileType.includes('document') || fileType.includes('text')) return <FileText className="w-12 h-12 text-pink-500" />;
  return <File className="w-12 h-12 text-pink-500" />;
};

const DocumentUpload = () => {
  const [userId, setUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const documentTypes = [
    { label: 'Aadhar Card', value: 'aadhar' },
    { label: 'PAN Card', value: 'pan' },
    { label: 'Passport', value: 'passport' },
    { label: 'Other', value: 'other' }
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!userId) {
      setUploadError('User not authenticated. Please log in.');
      return;
    }

    if (!selectedFile || !documentType) {
      setUploadError('Please select a file and document type.');
      return;
    }

    try {
      setUploadError(null);
      setUploadProgress(0);
      setUploadSuccess(false);

      const storage = getStorage();
      const firestore = getFirestore();

      const storageRef = ref(
        storage, 
        `users/${userId}/documents/${documentType}/${Date.now()}_${selectedFile.name}`
      );

      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const documentRef = doc(
        collection(firestore, 'users', userId, 'documents')
      );
      await setDoc(documentRef, {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        documentType: documentType,
        fileSize: selectedFile.size,
        uploadedAt: new Date(),
        downloadURL: downloadURL
      });

      setUploadProgress(100);
      setUploadSuccess(true);
      setSelectedFile(null);
      setDocumentType('');

      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
          <p className="text-pink-600">Please sign in to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Document Upload
        </h1>
        <p className="text-gray-600">
          Upload your identification documents
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <FileText className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Identity Documents</h3>
              <p className="text-sm text-gray-600">Upload your verification documents</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            {documentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setDocumentType(type.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 
                  ${documentType === type.value 
                    ? 'border-pink-500 bg-pink-50 shadow-sm' 
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  {documentType === type.value && <Check className="w-5 h-5 text-pink-500" />}
                </div>
              </button>
            ))}
          </div>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-pink-200 rounded-xl p-8
            hover:border-pink-400 transition-all duration-300 
            bg-pink-50/30 hover:bg-pink-50/50">
            <input 
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center">
              <Upload className="w-12 h-12 text-pink-400 mb-4" />
              <p className="text-sm text-gray-600 text-center">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, JPG, PNG
              </p>
            </label>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="p-4 bg-gray-50 rounded-xl flex items-center space-x-4">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile.type)}
              </div>
              <div className="flex-grow">
                <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center">
              <X className="w-4 h-4 mr-2" />
              {uploadError}
            </div>
          )}

          {/* Upload Button */}
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentType || uploadSuccess}
            className="w-full py-3 rounded-xl 
              bg-gradient-to-r from-pink-500 to-purple-600 
              text-white font-semibold
              hover:from-pink-600 hover:to-purple-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105 active:scale-95
              transition-all duration-300 
              flex items-center justify-center space-x-2"
          >
            {uploadSuccess ? (
              <>
                <Check className="w-5 h-5" />
                <span>Upload Complete</span>
              </>
            ) : uploadProgress > 0 ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </>
            )}
          </button>

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-pink-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${uploadProgress}%`}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;