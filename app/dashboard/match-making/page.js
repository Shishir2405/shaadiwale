"use client";

import React, { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import {
  Loader2,
  Search,
  Users,
  Heart,
  X,
  ArrowRight,
  Filter,
  ChevronDown,
  Check,
  AlertTriangle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// User Card Component
const UserCard = ({ user, onSelect, isSelected }) => {
  return (
    <div
      className={`bg-white rounded-xl border ${
        isSelected ? "border-pink-500 ring-2 ring-pink-200" : "border-gray-100"
      } shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md relative`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-pink-500 text-white p-1 rounded-full">
          <Check className="w-4 h-4" />
        </div>
      )}

      <div className="relative h-48 w-full bg-gray-100">
        {user.profilePhoto ? (
          <Image
            src={user.profilePhoto}
            alt={`${user.firstName || "User"} ${user.lastName || ""}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.firstName ? user.firstName[0] : "U"}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {user.firstName} {user.lastName}
        </h3>

        <div className="space-y-1 mb-4 text-sm text-gray-600">
          <p>
            {user.age || "--"} years, {user.height || "--"}
          </p>
          <p>
            {user.education ||
              user.highestEducation ||
              "Education not specified"}
          </p>
          <p>{user.occupation || "Occupation not specified"}</p>
          <p>
            {user.residingCity || ""}
            {user.residingCity && user.residingState ? ", " : ""}
            {user.residingState || ""}
          </p>
        </div>

        <button
          onClick={() => onSelect(user)}
          className={`w-full py-2 ${
            isSelected
              ? "bg-pink-100 text-pink-700 border border-pink-200"
              : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700"
          } rounded-lg transition-colors flex items-center justify-center gap-2`}
        >
          {isSelected ? (
            <>
              <X className="w-4 h-4" />
              <span>Deselect</span>
            </>
          ) : (
            <>
              <Heart className="w-4 h-4" />
              <span>Select</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Match Modal Component
const MatchModal = ({
  user1,
  user2,
  onClose,
  matchPercentage,
  compatibilityDetails,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Compatibility Analysis
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-2">
                {user1?.firstName?.[0] || "U"}
              </div>
              <h3 className="font-semibold text-gray-900">
                {user1?.firstName} {user1?.lastName}
              </h3>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full bg-pink-50 flex items-center justify-center mb-2">
                <div className="text-3xl font-bold text-pink-600">
                  {matchPercentage}%
                </div>
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f9a8d4"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="8"
                    strokeDasharray={`${
                      (2 * Math.PI * 45 * matchPercentage) / 100
                    } ${2 * Math.PI * 45 * (1 - matchPercentage / 100)}`}
                    strokeDashoffset={(2 * Math.PI * 45) / 4}
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">Match Score</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto flex items-center justify-center text-white text-3xl font-bold mb-2">
                {user2?.firstName?.[0] || "U"}
              </div>
              <h3 className="font-semibold text-gray-900">
                {user2?.firstName} {user2?.lastName}
              </h3>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Compatibility Summary
            </h3>
            <p className="text-gray-600 mb-2">
              {matchPercentage >= 80
                ? "Excellent match! Their preferences align very well."
                : matchPercentage >= 60
                ? "Good match. They have many compatible preferences."
                : matchPercentage >= 40
                ? "Fair match. They have some compatible preferences, but also notable differences."
                : "Low compatibility. Their preferences have significant differences."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {Object.keys(compatibilityDetails).map((category) => (
                <div
                  key={category}
                  className="bg-white p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                      {compatibilityDetails[category].score}%
                    </div>
                  </div>
                  <ul className="text-sm space-y-1">
                    {compatibilityDetails[category].matches.map(
                      (match, idx) => (
                        <li key={idx} className="flex items-start">
                          <span
                            className={`mr-2 mt-0.5 ${
                              match.match ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {match.match ? "✓" : "✗"}
                          </span>
                          <span className="text-gray-600">{match.detail}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filters Component
const FiltersPanel = ({ filters, setFilters, onApplyFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    onApplyFilters(tempFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const emptyFilters = {
      gender: "",
      ageFrom: "",
      ageTo: "",
      religion: "",
      city: "",
      education: "",
    };
    setTempFilters(emptyFilters);
    setFilters(emptyFilters);
    onApplyFilters(emptyFilters);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div
        className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-50 rounded-lg">
            <Filter className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="font-semibold text-gray-900">Filter Profiles</h2>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={tempFilters.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Age Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="ageFrom"
                  placeholder="From"
                  value={tempFilters.ageFrom}
                  onChange={handleChange}
                  min="18"
                  max="99"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
                <input
                  type="number"
                  name="ageTo"
                  placeholder="To"
                  value={tempFilters.ageTo}
                  onChange={handleChange}
                  min="18"
                  max="99"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Religion
              </label>
              <select
                name="religion"
                value={tempFilters.religion}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              >
                <option value="">All</option>
                <option value="hindu">Hindu</option>
                <option value="muslim">Muslim</option>
                <option value="christian">Christian</option>
                <option value="sikh">Sikh</option>
                <option value="buddhist">Buddhist</option>
                <option value="jain">Jain</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                placeholder="Any city"
                value={tempFilters.city}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Education
              </label>
              <select
                name="education"
                value={tempFilters.education}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              >
                <option value="">All</option>
                <option value="High School">High School</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="Doctorate">Doctorate</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function MatchmakingPage() {
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [compatibilityDetails, setCompatibilityDetails] = useState({});
  const [filters, setFilters] = useState({
    gender: "",
    ageFrom: "",
    ageTo: "",
    religion: "",
    city: "",
    education: "",
  });


  // Using the fetchUsers function similar to the one in your email template page
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Log the current user ID for debugging
      console.log("Current user ID:", user?.uid);

      // Use the query syntax from your email template page that works
      const usersQuery = query(collection(db, "users"));
      const querySnapshot = await getDocs(usersQuery);

      // Log the raw query results for debugging
      console.log(
        "Raw query results:",
        querySnapshot.docs.length,
        "documents found"
      );

      const usersData = querySnapshot.docs.map((doc) => {
        // Log each document ID for debugging
        console.log("Processing document ID:", doc.id);

        // REMOVED THE FILTER FOR CURRENT USER
        // if (doc.id === user?.uid) {
        //   console.log("Skipping current user");
        //   return null;
        // }

        const userData = {
          id: doc.id,
          ...doc.data(),
          // Map profileImageUrl to profilePhoto for UserCard component
          profilePhoto: doc.data().profileImageUrl,
        };

        // Calculate age from dateOfBirth if available
        if (userData.dateOfBirth) {
          try {
            const dob = new Date(userData.dateOfBirth);

            // Check if date is valid
            if (!isNaN(dob.getTime())) {
              const today = new Date();
              const age = today.getFullYear() - dob.getFullYear();
              const monthDiff = today.getMonth() - dob.getMonth();

              if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < dob.getDate())
              ) {
                userData.age = age - 1;
              } else {
                userData.age = age;
              }

              console.log(
                `Calculated age for ${userData.firstName}: ${userData.age}`
              );
            } else {
              console.warn(
                `Invalid date format for user ${doc.id}: ${userData.dateOfBirth}`
              );
            }
          } catch (dateError) {
            console.error("Error calculating age:", dateError);
          }
        }

        return userData;
      });
      // .filter(Boolean); // REMOVED filter since we're keeping all users

      console.log("Fetched users:", usersData.length);

      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
      setLoading(false);
    }
  };
  const handleUserSelect = (selectedUser) => {
    setSelectedUsers((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (user) => user.id === selectedUser.id
      );

      if (isAlreadySelected) {
        // Remove user if already selected
        return prevSelected.filter((user) => user.id !== selectedUser.id);
      } else if (prevSelected.length < 2) {
        // Add user if less than 2 are selected
        return [...prevSelected, selectedUser];
      } else {
        // Replace the first selected user if 2 are already selected
        return [prevSelected[1], selectedUser];
      }
    });
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      applyFilters(filters);
    } else {
      const searchResults = filteredUsers.filter((user) => {
        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.toLowerCase();
        const searchLower = term.toLowerCase();

        return fullName.includes(searchLower);
      });

      setFilteredUsers(searchResults);
    }
  };

  const applyFilters = (newFilters) => {
    let results = [...users];

    // Apply filters
    if (newFilters.gender) {
      results = results.filter((user) => user.gender === newFilters.gender);
    }

    if (newFilters.ageFrom) {
      results = results.filter(
        (user) => !user.age || user.age >= parseInt(newFilters.ageFrom)
      );
    }

    if (newFilters.ageTo) {
      results = results.filter(
        (user) => !user.age || user.age <= parseInt(newFilters.ageTo)
      );
    }

    if (newFilters.religion) {
      results = results.filter((user) => user.religion === newFilters.religion);
    }

    if (newFilters.city) {
      const cityLower = newFilters.city.toLowerCase();
      results = results.filter(
        (user) =>
          user.residingCity &&
          user.residingCity.toLowerCase().includes(cityLower)
      );
    }

    if (newFilters.education) {
      results = results.filter(
        (user) =>
          (user.education && user.education.includes(newFilters.education)) ||
          (user.highestEducation &&
            user.highestEducation.includes(newFilters.education))
      );
    }

    // Apply search term if exists
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter((user) => {
        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.toLowerCase();
        return fullName.includes(searchLower);
      });
    }

    setFilteredUsers(results);
  };

  const analyzeCompatibility = async () => {
    if (selectedUsers.length !== 2) {
      alert("Please select exactly 2 users to compare");
      return;
    }

    try {
      const [user1, user2] = selectedUsers;

      // Fetch users to get the most updated data including preferences
      const user1Doc = await getDoc(doc(db, "users", user1.id));
      const user2Doc = await getDoc(doc(db, "users", user2.id));

      if (!user1Doc.exists() || !user2Doc.exists()) {
        throw new Error("One or both users don't exist");
      }

      const user1Data = { id: user1Doc.id, ...user1Doc.data() };
      const user2Data = { id: user2Doc.id, ...user2Doc.data() };

      // Check if both users have partner preferences
      if (!user1Data.partnerPreferences || !user2Data.partnerPreferences) {
        alert("One or both users don't have partner preferences set");
        return;
      }

      // Calculate match percentage
      const matchResults = calculateMatchPercentage(user1Data, user2Data);
      setMatchPercentage(matchResults.overallPercentage);
      setCompatibilityDetails(matchResults.categoryDetails);

      // Update the selected users with the full data
      setSelectedUsers([user1Data, user2Data]);

      // Show the match modal
      setShowMatchModal(true);
    } catch (err) {
      console.error("Error analyzing compatibility:", err);
      alert("Failed to analyze compatibility");
    }
  };

  const calculateMatchPercentage = (user1, user2) => {
    // Get preferences
    const pref1 = user1.partnerPreferences;
    const pref2 = user2.partnerPreferences;

    // Initialize categories for detailed matching
    const categories = {
      "Basic Details": { score: 0, matches: [] },
      "Religious Preferences": { score: 0, matches: [] },
      "Education & Career": { score: 0, matches: [] },
      Lifestyle: { score: 0, matches: [] },
      "Location & Family": { score: 0, matches: [] },
    };

    // ==== Basic Details ====
    // Age match
    if (user1.age && pref2.ageFrom && pref2.ageTo) {
      const isAgeMatch =
        user1.age >= parseInt(pref2.ageFrom) &&
        user1.age <= parseInt(pref2.ageTo);
      categories["Basic Details"].matches.push({
        match: isAgeMatch,
        detail: isAgeMatch
          ? `${user1.firstName}'s age (${user1.age}) matches ${user2.firstName}'s preference (${pref2.ageFrom}-${pref2.ageTo})`
          : `${user1.firstName}'s age (${user1.age}) is outside ${user2.firstName}'s preference (${pref2.ageFrom}-${pref2.ageTo})`,
      });
    }

    if (user2.age && pref1.ageFrom && pref1.ageTo) {
      const isAgeMatch =
        user2.age >= parseInt(pref1.ageFrom) &&
        user2.age <= parseInt(pref1.ageTo);
      categories["Basic Details"].matches.push({
        match: isAgeMatch,
        detail: isAgeMatch
          ? `${user2.firstName}'s age (${user2.age}) matches ${user1.firstName}'s preference (${pref1.ageFrom}-${pref1.ageTo})`
          : `${user2.firstName}'s age (${user2.age}) is outside ${user1.firstName}'s preference (${pref1.ageFrom}-${pref1.ageTo})`,
      });
    }

    // Height match
    if (user1.height && pref2.heightFrom && pref2.heightTo) {
      const isHeightMatch = heightInRange(
        user1.height,
        pref2.heightFrom,
        pref2.heightTo
      );
      categories["Basic Details"].matches.push({
        match: isHeightMatch,
        detail: isHeightMatch
          ? `${user1.firstName}'s height (${user1.height}) matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s height (${user1.height}) is outside ${user2.firstName}'s preference`,
      });
    }

    if (user2.height && pref1.heightFrom && pref1.heightTo) {
      const isHeightMatch = heightInRange(
        user2.height,
        pref1.heightFrom,
        pref1.heightTo
      );
      categories["Basic Details"].matches.push({
        match: isHeightMatch,
        detail: isHeightMatch
          ? `${user2.firstName}'s height (${user2.height}) matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s height (${user2.height}) is outside ${user1.firstName}'s preference`,
      });
    }

    // Marital status match
    if (user1.maritalStatus && pref2.maritalStatus) {
      const isMaritalMatch =
        pref2.maritalStatus === "dontMatter" ||
        user1.maritalStatus === pref2.maritalStatus;
      categories["Basic Details"].matches.push({
        match: isMaritalMatch,
        detail: isMaritalMatch
          ? `${user1.firstName}'s marital status matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s marital status doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.maritalStatus && pref1.maritalStatus) {
      const isMaritalMatch =
        pref1.maritalStatus === "dontMatter" ||
        user2.maritalStatus === pref1.maritalStatus;
      categories["Basic Details"].matches.push({
        match: isMaritalMatch,
        detail: isMaritalMatch
          ? `${user2.firstName}'s marital status matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s marital status doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Calculate percentage for Basic Details category
    categories["Basic Details"].score = calculateCategoryScore(
      categories["Basic Details"].matches
    );

    // ==== Religious Preferences ====
    // Religion match
    if (user1.religion && pref2.religion) {
      const isReligionMatch = user1.religion === pref2.religion;
      categories["Religious Preferences"].matches.push({
        match: isReligionMatch,
        detail: isReligionMatch
          ? `${user1.firstName}'s religion (${user1.religion}) matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s religion (${user1.religion}) doesn't match ${user2.firstName}'s preference (${pref2.religion})`,
      });
    }

    if (user2.religion && pref1.religion) {
      const isReligionMatch = user2.religion === pref1.religion;
      categories["Religious Preferences"].matches.push({
        match: isReligionMatch,
        detail: isReligionMatch
          ? `${user2.firstName}'s religion (${user2.religion}) matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s religion (${user2.religion}) doesn't match ${user1.firstName}'s preference (${pref1.religion})`,
      });
    }

    // Caste match
    if (user1.caste && pref2.caste) {
      const isCasteMatch = user1.caste === pref2.caste;
      categories["Religious Preferences"].matches.push({
        match: isCasteMatch,
        detail: isCasteMatch
          ? `${user1.firstName}'s caste matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s caste doesn't match ${user2.firstName}'s preference`,
      });
    }

    // Mother tongue match
    if (user1.motherTongue && pref2.motherTongue) {
      const isMotherTongueMatch =
        user1.motherTongue === pref2.motherTongue ||
        pref2.motherTongue === "dontMatter";
      categories["Religious Preferences"].matches.push({
        match: isMotherTongueMatch,
        detail: isMotherTongueMatch
          ? `${user1.firstName}'s mother tongue matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s mother tongue doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.motherTongue && pref1.motherTongue) {
      const isMotherTongueMatch =
        user2.motherTongue === pref1.motherTongue ||
        pref1.motherTongue === "dontMatter";
      categories["Religious Preferences"].matches.push({
        match: isMotherTongueMatch,
        detail: isMotherTongueMatch
          ? `${user2.firstName}'s mother tongue matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s mother tongue doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Calculate percentage for Religious Preferences category
    categories["Religious Preferences"].score = calculateCategoryScore(
      categories["Religious Preferences"].matches
    );

    // ==== Education & Career ====
    // Education match
    if ((user1.education || user1.highestEducation) && pref2.education) {
      const userEducation = user1.education || user1.highestEducation;
      const isEducationMatch =
        userEducation === pref2.education || pref2.education === "dontMatter";
      categories["Education & Career"].matches.push({
        match: isEducationMatch,
        detail: isEducationMatch
          ? `${user1.firstName}'s education matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s education doesn't match ${user2.firstName}'s preference`,
      });
    }

    if ((user2.education || user2.highestEducation) && pref1.education) {
      const userEducation = user2.education || user2.highestEducation;
      const isEducationMatch =
        userEducation === pref1.education || pref1.education === "dontMatter";
      categories["Education & Career"].matches.push({
        match: isEducationMatch,
        detail: isEducationMatch
          ? `${user2.firstName}'s education matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s education doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Occupation match
    if (user1.occupation && pref2.occupation) {
      const isOccupationMatch =
        user1.occupation === pref2.occupation ||
        pref2.occupation === "dontMatter";
      categories["Education & Career"].matches.push({
        match: isOccupationMatch,
        detail: isOccupationMatch
          ? `${user1.firstName}'s occupation matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s occupation doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.occupation && pref1.occupation) {
      const isOccupationMatch =
        user2.occupation === pref1.occupation ||
        pref1.occupation === "dontMatter";
      categories["Education & Career"].matches.push({
        match: isOccupationMatch,
        detail: isOccupationMatch
          ? `${user2.firstName}'s occupation matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s occupation doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Income match
    if (user1.annualIncome && pref2.annualIncomeFrom && pref2.annualIncomeTo) {
      const userIncome = parseIncome(user1.annualIncome);
      const incomeFrom = parseInt(pref2.annualIncomeFrom);
      const incomeTo = parseInt(pref2.annualIncomeTo);

      const isIncomeMatch =
        userIncome >= incomeFrom && (incomeTo === 0 || userIncome <= incomeTo);
      categories["Education & Career"].matches.push({
        match: isIncomeMatch,
        detail: isIncomeMatch
          ? `${user1.firstName}'s income matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s income doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.annualIncome && pref1.annualIncomeFrom && pref1.annualIncomeTo) {
      const userIncome = parseIncome(user2.annualIncome);
      const incomeFrom = parseInt(pref1.annualIncomeFrom);
      const incomeTo = parseInt(pref1.annualIncomeTo);

      const isIncomeMatch =
        userIncome >= incomeFrom && (incomeTo === 0 || userIncome <= incomeTo);
      categories["Education & Career"].matches.push({
        match: isIncomeMatch,
        detail: isIncomeMatch
          ? `${user2.firstName}'s income matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s income doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Calculate percentage for Education & Career category
    categories["Education & Career"].score = calculateCategoryScore(
      categories["Education & Career"].matches
    );

    // ==== Lifestyle ====
    // Diet match
    if (user1.diet && pref2.diet) {
      const isDietMatch =
        user1.diet === pref2.diet || pref2.diet === "dontMatter";
      categories["Lifestyle"].matches.push({
        match: isDietMatch,
        detail: isDietMatch
          ? `${user1.firstName}'s diet matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s diet doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.diet && pref1.diet) {
      const isDietMatch =
        user2.diet === pref1.diet || pref1.diet === "dontMatter";
      categories["Lifestyle"].matches.push({
        match: isDietMatch,
        detail: isDietMatch
          ? `${user2.firstName}'s diet matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s diet doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Smoking match
    if (user1.smoking && pref2.smoking) {
      const isSmokingMatch =
        user1.smoking === pref2.smoking || pref2.smoking === "dontMatter";
      categories["Lifestyle"].matches.push({
        match: isSmokingMatch,
        detail: isSmokingMatch
          ? `${user1.firstName}'s smoking habits match ${user2.firstName}'s preference`
          : `${user1.firstName}'s smoking habits don't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.smoking && pref1.smoking) {
      const isSmokingMatch =
        user2.smoking === pref1.smoking || pref1.smoking === "dontMatter";
      categories["Lifestyle"].matches.push({
        match: isSmokingMatch,
        detail: isSmokingMatch
          ? `${user2.firstName}'s smoking habits match ${user1.firstName}'s preference`
          : `${user2.firstName}'s smoking habits don't match ${user1.firstName}'s preference`,
      });
    }

    // Drinking match
    if (user1.drinking && pref2.drinking) {
      const isDrinkingMatch =
        user1.drinking === pref2.drinking || pref2.drinking === "dontMatter";
      categories["Lifestyle"].matches.push({
        match: isDrinkingMatch,
        detail: isDrinkingMatch
          ? `${user1.firstName}'s drinking habits match ${user2.firstName}'s preference`
          : `${user1.firstName}'s drinking habits don't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.drinking && pref1.drinking) {
      const isDrinkingMatch =
        user2.drinking === pref1.drinking || pref1.drinking === "dontMatter";
      categories["Lifestyle"].matches.push({
        match: isDrinkingMatch,
        detail: isDrinkingMatch
          ? `${user2.firstName}'s drinking habits match ${user1.firstName}'s preference`
          : `${user2.firstName}'s drinking habits don't match ${user1.firstName}'s preference`,
      });
    }

    // Calculate percentage for Lifestyle category
    categories["Lifestyle"].score = calculateCategoryScore(
      categories["Lifestyle"].matches
    );

    // ==== Location & Family ====
    // Location match
    if (user1.residingState && pref2.residingState) {
      const isStateMatch =
        user1.residingState === pref2.residingState ||
        pref2.residingState === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isStateMatch,
        detail: isStateMatch
          ? `${user1.firstName}'s state matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s state doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.residingState && pref1.residingState) {
      const isStateMatch =
        user2.residingState === pref1.residingState ||
        pref1.residingState === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isStateMatch,
        detail: isStateMatch
          ? `${user2.firstName}'s state matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s state doesn't match ${user1.firstName}'s preference`,
      });
    }

    if (user1.residingCity && pref2.residingCity) {
      const isCityMatch =
        user1.residingCity === pref2.residingCity ||
        pref2.residingCity === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isCityMatch,
        detail: isCityMatch
          ? `${user1.firstName}'s city matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s city doesn't match ${user2.firstName}'s preference`,
      });
    }

    // Family type match
    if (user1.familyType && pref2.familyType) {
      const isFamilyTypeMatch =
        user1.familyType === pref2.familyType ||
        pref2.familyType === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isFamilyTypeMatch,
        detail: isFamilyTypeMatch
          ? `${user1.firstName}'s family type matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s family type doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.familyType && pref1.familyType) {
      const isFamilyTypeMatch =
        user2.familyType === pref1.familyType ||
        pref1.familyType === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isFamilyTypeMatch,
        detail: isFamilyTypeMatch
          ? `${user2.firstName}'s family type matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s family type doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Family status match
    if (user1.familyStatus && pref2.familyStatus) {
      const isFamilyStatusMatch =
        user1.familyStatus === pref2.familyStatus ||
        pref2.familyStatus === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isFamilyStatusMatch,
        detail: isFamilyStatusMatch
          ? `${user1.firstName}'s family status matches ${user2.firstName}'s preference`
          : `${user1.firstName}'s family status doesn't match ${user2.firstName}'s preference`,
      });
    }

    if (user2.familyStatus && pref1.familyStatus) {
      const isFamilyStatusMatch =
        user2.familyStatus === pref1.familyStatus ||
        pref1.familyStatus === "dontMatter";
      categories["Location & Family"].matches.push({
        match: isFamilyStatusMatch,
        detail: isFamilyStatusMatch
          ? `${user2.firstName}'s family status matches ${user1.firstName}'s preference`
          : `${user2.firstName}'s family status doesn't match ${user1.firstName}'s preference`,
      });
    }

    // Calculate percentage for Location & Family category
    categories["Location & Family"].score = calculateCategoryScore(
      categories["Location & Family"].matches
    );

    // Calculate overall percentage
    let totalScore = 0;
    let totalCategories = 0;

    for (const category in categories) {
      if (categories[category].matches.length > 0) {
        totalScore += categories[category].score;
        totalCategories++;
      }
    }

    const overallPercentage =
      totalCategories > 0 ? Math.round(totalScore / totalCategories) : 0;

    return { overallPercentage, categoryDetails: categories };
  };

  // Helper function to calculate category score
  const calculateCategoryScore = (matches) => {
    if (matches.length === 0) return 0;

    const totalMatches = matches.filter((match) => match.match).length;
    return Math.round((totalMatches / matches.length) * 100);
  };

  // Helper function to parse income values
  const parseIncome = (incomeString) => {
    if (!incomeString) return 0;

    // Strip non-numeric characters and convert to number
    const numericValue = incomeString.replace(/[^\d.]/g, "");
    return parseFloat(numericValue) || 0;
  };

  // Helper function to check if height is in range
  const heightInRange = (height, fromHeight, toHeight) => {
    // Convert heights to numeric values for comparison
    const heightOrder = [
      "4'0\"",
      "4'1\"",
      "4'2\"",
      "4'3\"",
      "4'4\"",
      "4'5\"",
      "4'6\"",
      "4'7\"",
      "4'8\"",
      "4'9\"",
      "4'10\"",
      "4'11\"",
      "5'0\"",
      "5'1\"",
      "5'2\"",
      "5'3\"",
      "5'4\"",
      "5'5\"",
      "5'6\"",
      "5'7\"",
      "5'8\"",
      "5'9\"",
      "5'10\"",
      "5'11\"",
      "6'0\"",
      "6'1\"",
      "6'2\"",
      "6'3\"",
      "6'4\"",
      "6'5\"",
      "6'6\"",
      "6'7\"",
      "6'8\"",
      "6'9\"",
      "6'10\"",
      "6'11\"",
      "7'0\"",
    ];

    const heightIndex = heightOrder.indexOf(height);
    const fromIndex = heightOrder.indexOf(fromHeight);
    const toIndex = heightOrder.indexOf(toHeight);

    if (heightIndex === -1 || fromIndex === -1 || toIndex === -1) {
      return false;
    }

    return heightIndex >= fromIndex && heightIndex <= toIndex;
  };

 

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard"
            className="text-pink-500 hover:text-pink-700 flex items-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Matchmaking
        </h1>
        <p className="text-gray-600">
          Find compatible matches based on preferences
        </p>
      </div>

      {/* Selected users section */}
      {selectedUsers.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Selected Users ({selectedUsers.length}/2)
              </h2>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
                {selectedUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 bg-pink-50 p-2 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user.firstName ? user.firstName[0] : "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUserSelect(user)}
                      className="p-1 hover:bg-pink-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-pink-500" />
                    </button>
                  </div>
                ))}

                {selectedUsers.length === 1 && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Select one more user</p>
                  </div>
                )}
              </div>

              {selectedUsers.length === 2 && (
                <button
                  onClick={analyzeCompatibility}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Check Compatibility</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
      />

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="Search users by name..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* User list */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No users found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onSelect={handleUserSelect}
              isSelected={selectedUsers.some(
                (selected) => selected.id === user.id
              )}
            />
          ))}
        </div>
      )}

      {/* Match modal */}
      {showMatchModal && (
        <MatchModal
          user1={selectedUsers[0]}
          user2={selectedUsers[1]}
          onClose={() => setShowMatchModal(false)}
          matchPercentage={matchPercentage}
          compatibilityDetails={compatibilityDetails}
        />
      )}
    </div>
  );
}
