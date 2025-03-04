// app/dashboard/export/page.jsx
"use client"
import React, { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  Loader2 
} from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "react-hot-toast";

const ExportPage = () => {
  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

  // Function to fetch all collections
  const fetchAllData = async () => {
    const collections = [
      'users',
      'membershipPlans',
      'messages',
      'calls',
      'reports',
      'success-stories',
      'partnerPreferences'
    ];

    const allData = {};

    for (const collectionName of collections) {
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        allData[collectionName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
        allData[collectionName] = [];
      }
    }

    return allData;
  };

  // Export as JSON
  const exportAsJson = async () => {
    try {
      setLoading(true);
      setCurrentAction('json');
      const data = await fetchAllData();
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_export_${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('JSON export completed');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setLoading(false);
      setCurrentAction('');
    }
  };

  // Export as CSV
  const exportAsCsv = async () => {
    try {
      setLoading(true);
      setCurrentAction('csv');
      const data = await fetchAllData();
      
      // Create a zip of CSV files
      const zip = require('jszip')();
      
      // Convert each collection to CSV
      for (const [collectionName, documents] of Object.entries(data)) {
        if (documents.length > 0) {
          // Convert to CSV string
          const header = Object.keys(documents[0]).join(',');
          const rows = documents.map(doc => 
            Object.values(doc).map(value => 
              typeof value === 'object' ? JSON.stringify(value) : value
            ).join(',')
          );
          const csv = [header, ...rows].join('\\n');
          
          // Add to zip
          zip.file(`${collectionName}.csv`, csv);
        }
      }
      
      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_export_${new Date().toISOString()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('CSV export completed');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setLoading(false);
      setCurrentAction('');
    }
  };

  // Export as Excel
  const exportAsExcel = async () => {
    try {
      setLoading(true);
      setCurrentAction('excel');
      const data = await fetchAllData();
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Add each collection as a worksheet
      for (const [collectionName, documents] of Object.entries(data)) {
        if (documents.length > 0) {
          // Convert nested objects to strings
          const processedData = documents.map(doc => {
            const processed = {};
            for (const [key, value] of Object.entries(doc)) {
              processed[key] = typeof value === 'object' ? JSON.stringify(value) : value;
            }
            return processed;
          });
          
          const ws = XLSX.utils.json_to_sheet(processedData);
          XLSX.utils.book_append_sheet(wb, ws, collectionName);
        }
      }
      
      // Generate and download Excel file
      XLSX.writeFile(wb, `database_export_${new Date().toISOString()}.xlsx`);
      
      toast.success('Excel export completed');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    } finally {
      setLoading(false);
      setCurrentAction('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Export Database</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        {/* JSON Export */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <FileJson className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-lg font-semibold text-center mb-4">JSON Export</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Export complete database as a structured JSON file
          </p>
          <Button 
            className="w-full"
            onClick={exportAsJson}
            disabled={loading}
          >
            {loading && currentAction === 'json' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as JSON
              </>
            )}
          </Button>
        </div>

        {/* CSV Export */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-lg font-semibold text-center mb-4">CSV Export</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Export each collection as separate CSV files in a ZIP
          </p>
          <Button 
            className="w-full"
            onClick={exportAsCsv}
            disabled={loading}
          >
            {loading && currentAction === 'csv' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </>
            )}
          </Button>
        </div>

        {/* Excel Export */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold text-center mb-4">Excel Export</h2>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Export all collections as sheets in an Excel workbook
          </p>
          <Button 
            className="w-full"
            onClick={exportAsExcel}
            disabled={loading}
          >
            {loading && currentAction === 'excel' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;