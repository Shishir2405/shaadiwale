// components/LanguageList.js
import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const LanguageList = ({ onRefresh }) => {
  const [languages, setLanguages] = useState([]);

  const fetchLanguages = async () => {
    const querySnapshot = await getDocs(collection(db, "languages"));
    const languageList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLanguages(languageList);
  };

  useEffect(() => {
    fetchLanguages();
  }, [onRefresh]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "languages", id));
      await fetchLanguages();
    } catch (error) {
      console.error("Error deleting language:", error);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Saved Languages</h2>
      <div className="space-y-4">
        {languages.map((language) => (
          <div
            key={language.id}
            className="flex items-center justify-between p-4 bg-white rounded shadow"
          >
            <div>
              <p className="font-medium">{language.title}</p>
              <p className="text-gray-600">{language.name}</p>
            </div>
            <button
              onClick={() => handleDelete(language.id)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageList;