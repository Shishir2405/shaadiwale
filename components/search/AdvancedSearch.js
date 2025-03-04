"use client"

import React, { useState, useCallback } from 'react';
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  MapPin,
  UserCircle2,
  GraduationCap,
  Sparkles,
  Church,
  Ruler,
  Users,
  Image as ImageIcon,
  Briefcase,
  IndianRupee,
  Clock,
  Star,
  Filter,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import {
  HEIGHT_OPTIONS,
  MARITAL_STATUS,
  RELIGIONS,
  EDUCATION,
  OCCUPATIONS,
  ANNUAL_INCOME,
  CASTES,
  INDIAN_STATES,
} from "@/lib/constant/serach";

const selectClassName = "h-9 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

// StepIndicator component for showing progress
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center space-x-2 mb-6">
    {[...Array(totalSteps)].map((_, index) => (
      <motion.div
        key={index}
        className={`h-2 rounded-full ${
          index === currentStep
            ? "w-8 bg-gradient-to-r from-pink-500 to-purple-600"
            : "w-2 bg-gray-200"
        }`}
        animate={{ scale: index === currentStep ? 1.1 : 1 }}
        transition={{ duration: 0.2 }}
      />
    ))}
  </div>
);

// SearchStep component for each step section
const SearchStep = ({ title, description, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-pink-50 rounded-lg">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

// PreferenceCard component for selection options
const PreferenceCard = ({ icon: Icon, label, isSelected, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full p-4 rounded-lg border-2 transition-colors ${
      isSelected
        ? "border-pink-500 bg-pink-50 text-pink-700"
        : "border-gray-200 hover:border-pink-200 text-gray-600"
    }`}
  >
    <div className="flex flex-col items-center space-y-2">
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  </motion.button>
);

// MatchCard component for displaying search results
const MatchCard = ({ profile, onFavorite, isFavorite }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
  >
    <div className="relative">
      {profile.photoUrl ? (
        <img
          src={profile.photoUrl}
          alt={profile.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
          <UserCircle2 className="w-20 h-20 text-gray-300" />
        </div>
      )}
      <button
        onClick={() => onFavorite(profile.id)}
        className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center transition-colors ${
          isFavorite ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>
    </div>

    <div className="p-4 space-y-3">
      <div>
        <h3 className="font-medium text-gray-900">
          {profile.name || `Profile ${profile.id.slice(0, 4)}`}
        </h3>
        <p className="text-sm text-gray-600">
          {profile.age} years • {profile.religion}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{profile.education}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{profile.occupation}</span>
        </div>

        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {profile.location?.city}, {profile.location?.state}
          </span>
        </div>
      </div>

      {(profile.isPremium || profile.isFeatured) && (
        <div className="flex gap-2">
          {profile.isPremium && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full">
              Premium
            </span>
          )}
          {profile.isFeatured && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              Featured
            </span>
          )}
        </div>
      )}
    </div>
  </motion.div>
);

export default function StepAdvancedSearch() {
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;

  // Core states
  const [searchParams, setSearchParams] = useState({
    gender: "Bride",
    ageFrom: 18,
    ageTo: 30,
    heightFrom: "",
    heightTo: "",
    maritalStatus: "",
    religion: "",
    caste: "",
    country: "India",
    state: "",
    city: "",
    education: "",
    occupation: "",
    annualIncome: "",
    withPhoto: false,
    profileType: "all",
    lastActive: "anytime",
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState(new Set());

  const handleInputChange = useCallback((field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  }, []);

  const handleFavoriteToggle = useCallback((profileId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(profileId)) {
        newFavorites.delete(profileId);
      } else {
        newFavorites.add(profileId);
      }
      return newFavorites;
    });
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const usersRef = collection(db, "users");
      const searchGender = searchParams.gender === "Bride" ? "female" : "male";
      let queryConstraints = [where("gender", "==", searchGender)];

      if (searchParams.religion) {
        queryConstraints.push(where("religion", "==", searchParams.religion.toLowerCase()));
      }

      if (searchParams.education) {
        queryConstraints.push(where("education", "==", searchParams.education));
      }

      const q = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      let profiles = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (meetsAllCriteria(data)) {
          profiles.push({
            id: doc.id,
            ...data
          });
        }
      });

      setResults(profiles);

      if (profiles.length === 0) {
        setError("No matching profiles found. Try adjusting your search criteria.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const meetsAllCriteria = useCallback((profile) => {
    if (profile.age < searchParams.ageFrom || profile.age > searchParams.ageTo) return false;
    
    if (searchParams.heightFrom && searchParams.heightTo) {
      const height = parseInt(profile.height);
      if (height < parseInt(searchParams.heightFrom) || height > parseInt(searchParams.heightTo)) return false;
    }

    if (searchParams.maritalStatus && profile.maritalStatus !== searchParams.maritalStatus) return false;
    if (searchParams.caste && profile.caste !== searchParams.caste) return false;
    if (searchParams.city && profile.location?.city.toLowerCase() !== searchParams.city.toLowerCase()) return false;
    if (searchParams.state && profile.location?.state !== searchParams.state) return false;
    if (searchParams.occupation && profile.occupation !== searchParams.occupation) return false;
    if (searchParams.annualIncome && profile.annualIncome < parseInt(searchParams.annualIncome)) return false;
    if (searchParams.withPhoto && !profile.photoUrl) return false;
    if (searchParams.profileType === 'premium' && !profile.isPremium) return false;
    if (searchParams.profileType === 'featured' && !profile.isFeatured) return false;

    return true;
  }, [searchParams]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Advanced Partner Search
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Find your perfect match with our comprehensive search
        </motion.p>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <SearchStep
            key="step1"
            title="Basic Preferences"
            description="Tell us who you're looking for"
            icon={Users}
          >
            <div className="space-y-6">
              {/* Gender Selection */}
              <div className="grid grid-cols-2 gap-4">
                <PreferenceCard
                  icon={Users}
                  label="Bride"
                  isSelected={searchParams.gender === "Bride"}
                  onClick={() => handleInputChange("gender", "Bride")}
                />
                <PreferenceCard
                  icon={Users}
                  label="Groom"
                  isSelected={searchParams.gender === "Groom"}
                  onClick={() => handleInputChange("gender", "Groom")}
                />
              </div>

              {/* Age Range Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Age Range (Years)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <select
                      value={searchParams.ageFrom}
                      onChange={(e) => handleInputChange("ageFrom", parseInt(e.target.value))}
                      className={selectClassName}
                    >
                      {[...Array(43)].map((_, i) => (
                        <option key={i + 18} value={i + 18}>
                          {i + 18} years
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={searchParams.ageTo}
                      onChange={(e) => handleInputChange("ageTo", parseInt(e.target.value))}
                      className={selectClassName}
                    >
                      {[...Array(43)].map((_, i) => (
                        <option key={i + 18} value={i + 18}>
                          {i + 18} years
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Height Range */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Height Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={searchParams.heightFrom}
                    onChange={(e) => handleInputChange("heightFrom", e.target.value)}
                    className={selectClassName}
                  >
                    <option value="">Any Height</option>
                    {HEIGHT_OPTIONS.map((height) => (
                      <option key={height.value} value={height.value}>
                        {height.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={searchParams.heightTo}
                    onChange={(e) => handleInputChange("heightTo", e.target.value)}
                    className={selectClassName}
                    disabled={!searchParams.heightFrom}
                  >
                    <option value="">Any Height</option>
                    {HEIGHT_OPTIONS.map((height) => (
                      <option 
                        key={height.value} 
                        value={height.value}
                        disabled={parseInt(height.value) < parseInt(searchParams.heightFrom || "0")}
                      >
                        {height.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Marital Status */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Marital Status
                </label>
                <select
                  value={searchParams.maritalStatus}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Any Status</option>
                  {MARITAL_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SearchStep>
        )}

        {currentStep === 1 && (
          <SearchStep
            key="step2"
            title="Religion & Community"
            description="Find someone who shares your values"
            icon={Church}
          >
            <div className="space-y-6">
              {/* Religion Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Religion Preference
                </label>
                <select
                  value={searchParams.religion}
                  onChange={(e) => handleInputChange("religion", e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Any Religion</option>
                  {RELIGIONS.map((religion) => (
                    <option key={religion.value} value={religion.value}>
                      {religion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Caste Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Caste Preference
                  </label>
                  {!searchParams.religion && (
                    <span className="text-xs text-gray-500">
                      Select a religion first
                    </span>
                  )}
                </div>
                <select
                  value={searchParams.caste}
                  onChange={(e) => handleInputChange("caste", e.target.value)}
                  className={selectClassName}
                  disabled={!searchParams.religion}
                >
                  <option value="">Any Caste</option>
                  {searchParams.religion &&
                    CASTES[searchParams.religion.toLowerCase()]?.map((caste) => (
                      <option key={caste} value={caste}>
                        {caste}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </SearchStep>
        )}

        {currentStep === 2 && (
          <SearchStep
            key="step3"
            title="Location & Career"
            description="Set your location and professional preferences"
            icon={MapPin}
          >
            <div className="space-y-6">
              {/* Location Selection */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Location Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">State</label>
                    <select
                      value={searchParams.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Any State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">City</label>
                    <input
                      type="text"
                      value={searchParams.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter city name"
                      className={selectClassName}
                    />
                  </div>
                </div>
              </div>

              {/* Career Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Professional Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Education</label>
                    <select
                      value={searchParams.education}
                      onChange={(e) => handleInputChange("education", e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Any Education</option>
                      {EDUCATION.map((edu) => (
                        <option key={edu.value} value={edu.value}>
                          {edu.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Occupation</label>
                    <select
                      value={searchParams.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      className={selectClassName}
                    >
                      <option value="">Any Occupation</option>
                      {OCCUPATIONS.map((occ) => (
                        <option key={occ.value} value={occ.value}>{occ.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Income */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Annual Income
                </label>
                <select
                  value={searchParams.annualIncome}
                  onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Any Income</option>
                  {ANNUAL_INCOME.map((income) => (
                    <option key={income.value} value={income.value}>
                      ₹{income.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </SearchStep>
        )}

        {currentStep === 3 && (
          <SearchStep
            key="step4"
            title="Additional Preferences"
            description="Set your profile and photo preferences"
            icon={Filter}
          >
            <div className="space-y-6">
              {/* Photo Preference */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="withPhoto"
                    checked={searchParams.withPhoto}
                    onChange={(e) => handleInputChange("withPhoto", e.target.checked)}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="withPhoto" className="text-sm text-gray-700">
                    Show only profiles with photos
                  </label>
                </div>
              </div>

              {/* Profile Type */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Profile Type
                </label>
                <select
                  value={searchParams.profileType}
                  onChange={(e) => handleInputChange("profileType", e.target.value)}
                  className={selectClassName}
                >
                  <option value="all">All Profiles</option>
                  <option value="premium">Premium Profiles</option>
                  <option value="featured">Featured Profiles</option>
                </select>
              </div>

              {/* Last Active */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Last Active
                </label>
                <select
                  value={searchParams.lastActive}
                  onChange={(e) => handleInputChange("lastActive", e.target.value)}
                  className={selectClassName}
                >
                  <option value="anytime">Any Time</option>
                  <option value="week">Within a Week</option>
                  <option value="month">Within a Month</option>
                </select>
              </div>
            </div>
          </SearchStep>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 flex items-center space-x-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </motion.button>

        {currentStep === totalSteps - 1 ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Find Matches</span>
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))}
            className="px-4 py-2 text-pink-600 flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 space-y-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Results ({results.length} matches found)
            </h2>
            <p className="text-gray-600">
              {favorites.size} profiles added to favorites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((profile) => (
              <MatchCard
                key={profile.id}
                profile={profile}
                onFavorite={handleFavoriteToggle}
                isFavorite={favorites.has(profile.id)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
}