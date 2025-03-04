"use client"
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Upload, Check, X, Loader2 } from 'lucide-react';

const PhotoUpload = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      setUploadError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) {
      setUploadError('Please select a photo to upload');
      return;
    }

    try {
      setUploadError(null);
      setUploadProgress(0);

      const storage = getStorage();
      const firestore = getFirestore();

      const storageRef = ref(storage, `users/${userId}/profile/${selectedFile.name}`);
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }

      await setDoc(doc(firestore, 'users', userId), {
        profileImageUrl: downloadURL
      }, { merge: true });

      setUploadProgress(100);
      setUploadSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/document-upload');
      }, 1500);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload image. Please try again.');
      setUploadProgress(0);
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
          Upload Profile Photo
        </h1>
        <p className="text-gray-600">
          Add a clear photo to make your profile stand out
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <Upload className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profile Photo</h3>
              <p className="text-sm text-gray-600">Upload a clear, recent photo of yourself</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Area */}
          <div className="flex flex-col items-center">
            <input 
              id="file-upload"
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="relative w-48 h-48 mb-4 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill
                  className="object-cover"
                />
                <label 
                  htmlFor="file-upload"
                  className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center 
                    opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-white text-sm">Change Photo</span>
                </label>
              </div>
            ) : (
              <label 
                htmlFor="file-upload"
                className="w-48 h-48 border-2 border-dashed border-pink-200 rounded-xl 
                  flex flex-col items-center justify-center cursor-pointer
                  hover:border-pink-400 hover:bg-pink-50 transition-colors"
              >
                <Upload className="w-10 h-10 text-pink-400 mb-2" />
                <span className="text-sm text-pink-600 font-medium">Click to upload</span>
                <span className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</span>
              </label>
            )}
            
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedFile.name}
              </p>
            )}
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center">
              <X className="w-4 h-4 mr-2" />
              {uploadError}
            </div>
          )}

          {/* Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-pink-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{width: `${uploadProgress}%`}}
              />
            </div>
          )}

          {/* Upload Button */}
          <button 
            onClick={handleUpload}
            disabled={!selectedFile || uploadSuccess}
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
                <span>Upload Photo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Overlay */}
      {uploadSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center max-w-md mx-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Successful!</h3>
            <p className="text-gray-600 text-center mb-6">
              Your profile photo has been updated successfully
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to document upload...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;