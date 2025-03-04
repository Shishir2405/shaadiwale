"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const casteOptions = {
  Hindu: [
    "Brahmin",
    "Kshatriya",
    "Vaishya",
    "Kayastha",
    "Rajput",
    "Maratha",
    "Jat",
    "Yadav",
    "Arora",
    "Agarwal",
    "Baniya",
    "Khatri",
    "Kashyap",
    "Kurmi",
    "Scheduled Caste",
    "Other",
  ],
  Muslim: [
    "Sunni",
    "Shia",
    "Ansari",
    "Khan",
    "Syed",
    "Sheikh",
    "Pathan",
    "Bohra",
    "Khoja",
    "Memon",
    "Other",
  ],
  Christian: [
    "Roman Catholic",
    "Protestant",
    "Orthodox",
    "Baptist",
    "Methodist",
    "Anglican",
    "Other",
  ],
  Sikh: ["Jat", "Khatri", "Ramgarhia", "Arora", "Saini", "Ravidasia", "Other"],
  Buddhist: ["Mahayana", "Theravada", "Vajrayana", "Other"],
  Jain: ["Shvetambar", "Digambar", "Other"],
};

const SearchComponent = () => {
  const router = useRouter();
  const [searchCriteria, setSearchCriteria] = useState({
    lookingFor: "Bride",
    ageFrom: "18",
    ageTo: "30",
    religion: "",
    caste: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "religion") {
      setSearchCriteria((prev) => ({
        ...prev,
        [name]: value,
        caste: "",
      }));
    } else {
      setSearchCriteria((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      const constraints = [];

      // Add gender filter with exact match
      if (searchCriteria.lookingFor) {
        constraints.push(
          where(
            "gender",
            "==",
            searchCriteria.lookingFor === "Bride" ? "female" : "male"
          )
        );
      }

      // Add religion filter if selected (case-sensitive match)
      if (searchCriteria.religion) {
        constraints.push(
          where("religion", "==", searchCriteria.religion.toLowerCase())
        );
      }

      // Add caste filter if selected (exact match)
      if (searchCriteria.caste) {
        constraints.push(where("caste", "==", searchCriteria.caste));
      }

      // Execute query
      const q = query(usersRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const matches = [];
      const currentYear = new Date().getFullYear();

      // Process results with age filtering
      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        // Calculate age from year field
        const userYear = parseInt(userData.year);
        const age = currentYear - userYear;

        // Check if age is within range
        if (
          age >= parseInt(searchCriteria.ageFrom) &&
          age <= parseInt(searchCriteria.ageTo)
        ) {
          matches.push({
            id: doc.id,
            ...userData,
            age,
            // Format display fields
            displayName: `${userData.firstName || ""} ${
              userData.lastName || ""
            }`.trim(),
            displayLocation: `${userData.residingCity || ""}, ${
              userData.residingState || ""
            }`.trim(),
            photoUrl: userData.photos?.profile?.url || null,
          });
        }
      });

      console.log("Search criteria:", searchCriteria); // Debug
      console.log("Matches found:", matches.length); // Debug

      // Store results
      sessionStorage.setItem("searchResults", JSON.stringify(matches));
      sessionStorage.setItem(
        "searchCriteria",
        JSON.stringify({
          ...searchCriteria,
          totalResults: matches.length,
        })
      );

      // Navigate to results page
      router.push("/result");
    } catch (error) {
      console.error("Search error:", error);
      if (error.message.includes("index")) {
        const indexUrl = error.message.match(
          /https:\/\/console\.firebase\.google\.com[^\s]*/
        );
        if (indexUrl) {
          alert(
            "Please create the required index in Firebase. Click OK to open the console."
          );
          window.open(indexUrl[0], "_blank");
        }
      } else {
        alert("An error occurred during search. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const SelectField = ({ label, name, value, onChange, options, disabled }) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 bg-white border border-pink-200 rounded-lg shadow-sm 
                 focus:ring-2 focus:ring-pink-400 focus:border-pink-400
                 disabled:bg-gray-50 disabled:text-gray-500 
                 appearance-none cursor-pointer"
      >
        <option value="">{`Select ${label}`}</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-[38px] pointer-events-none">
        <svg
          className="h-4 w-4 text-pink-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSearch} className="w-screen h-full mx-auto">
        <div className="bg-white rounded-2xl p-6 lg:p-8 space-y-6 border border-pink-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Looking For */}
            <SelectField
              label="Looking For"
              name="lookingFor"
              value={searchCriteria.lookingFor}
              onChange={handleInputChange}
              options={["Bride", "Groom"]}
            />

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <div className="flex items-center space-x-2">
                <select
                  name="ageFrom"
                  value={searchCriteria.ageFrom}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border border-pink-200 rounded-lg shadow-sm 
                           focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                >
                  {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
                <span className="text-pink-400">to</span>
                <select
                  name="ageTo"
                  value={searchCriteria.ageTo}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border border-pink-200 rounded-lg shadow-sm 
                           focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                >
                  {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Religion */}
            <SelectField
              label="Religion"
              name="religion"
              value={searchCriteria.religion}
              onChange={handleInputChange}
              options={Object.keys(casteOptions)}
            />

            {/* Caste */}
            <SelectField
              label="Caste"
              name="caste"
              value={searchCriteria.caste}
              onChange={handleInputChange}
              options={casteOptions[searchCriteria.religion]}
              disabled={!searchCriteria.religion}
            />
          </div>

          {/* Search Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-pink-500 text-white rounded-lg
                       hover:bg-pink-600 focus:ring-4 focus:ring-pink-300 
                       disabled:opacity-50 transition-colors duration-200 ease-in-out
                       flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search Matches</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default SearchComponent;
