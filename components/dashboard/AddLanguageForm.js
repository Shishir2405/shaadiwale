"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const SUPPORTED_LANGUAGES = {
  as: "Assamese",
  bn: "Bengali",
  bh: "Bhojpuri",
  doi: "Dogri",
  gu: "Gujarati",
  hi: "Hindi",
  kn: "Kannada",
  ks: "Kashmiri",
  kok: "Konkani",
  mai: "Maithili",
  ml: "Malayalam",
  mr: "Marathi",
  mni: "Meitei",
  ne: "Nepali",
  or: "Odia",
  pa: "Punjabi",
  sa: "Sanskrit",
  sd: "Sindhi",
  ta: "Tamil",
  te: "Telugu",
  ur: "Urdu",
};

const AddLanguageForm = ({ onLanguageAdded, editData, onCancel }) => {
  const [formData, setFormData] = useState({ name: "", title: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEditing = Boolean(editData?.id);

  useEffect(() => {
    if (editData) {
      setFormData({ name: editData.name, title: editData.title });
    }
  }, [editData]);

  const resetForm = () => {
    setFormData({ name: "", title: "" });
    setError("");
    if (onCancel) onCancel();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.name || !formData.title) {
        throw new Error("Please fill in all fields");
      }

      // Check for duplicates only when adding new language
      if (!isEditing) {
        const q = query(
          collection(db, "languages"),
          where("name", "==", formData.name)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          throw new Error("Language already exists");
        }

        await addDoc(collection(db, "languages"), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Update existing language
        await updateDoc(doc(db, "languages", editData.id), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
      }

      resetForm();
      onLanguageAdded();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "name") {
        // When language code is selected, auto-fill the title
        return {
          ...prev,
          [name]: value,
          title: SUPPORTED_LANGUAGES[value] || prev.title,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
    setError("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Language" : "Add New Language"}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language Code
          </label>
          <select
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
            disabled={loading || isEditing}
          >
            <option value="">Select a language</option>
            {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
              <option key={code} value={code}>
                {code.toUpperCase()} - {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Enter language title"
            required
            disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-md transition-colors
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
              ? "Update Language"
              : "Add Language"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 
                       transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddLanguageForm;
