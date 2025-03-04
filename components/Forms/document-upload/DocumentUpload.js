"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Link2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DocumentUpload = ({ userId, onContinue }) => {
  const [docUrl, setDocUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDocUpload = async () => {
    if (!docUrl || !userId) return;
    
    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      const updatedDocs = {
        ...userData?.documents,
        resume: {
          url: docUrl,
          uploadedAt: new Date().toISOString(),
          type: 'resume',
          status: 'pending_verification'
        }
      };

      await updateDoc(userRef, { documents: updatedDocs });
      toast({ title: "Success", description: "Document uploaded successfully!" });
      if (onContinue) onContinue(docUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto bg-white shadow-lg">
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 hover:border-[#e71c5d] transition-colors">
            <div className="w-full aspect-[3/4] bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
              {docUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
                  <FileText className="w-16 h-16 text-[#e71c5d]" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500 mb-2">Resume/CV</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Document URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="Enter document URL"
                  className="w-full pl-9 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#e71c5d] focus:border-[#e71c5d]"
                />
                <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Supported formats: PDF, DOC, DOCX
            </div>
          </div>
        </div>

        <button
          onClick={handleDocUpload}
          disabled={!docUrl || isLoading}
          className="w-full px-6 py-3 bg-[#e71c5d] text-white rounded-lg font-medium
            transform transition-all duration-300
            hover:bg-opacity-90 hover:shadow-md hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload & Continue'
          )}
        </button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;