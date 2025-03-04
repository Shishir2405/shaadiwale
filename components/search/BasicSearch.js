"use client";

import { useState, useCallback } from "react";
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
  Image,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Star,
} from "lucide-react";
import {
  HEIGHT_OPTIONS,
  MARITAL_STATUS,
  RELIGIONS,
  EDUCATION,
  CASTES,
} from "@/lib/constant/serach";
// ... keep existing imports and constants ...

const selectClassName =
  "h-9 block w-full rounded-lg border-gray-200 text-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors";

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

const SearchStep = ({
  title,
  description,
  icon: Icon,
  children,
  animate = true,
}) => (
  <motion.div
    initial={animate ? { opacity: 0, y: 20 } : false}
    animate={animate ? { opacity: 1, y: 0 } : false}
    exit={animate ? { opacity: 0, y: -20 } : false}
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

const MatchIndicator = ({ value, label }) => (
  <div className="text-center">
    <div className="inline-block p-2 rounded-full bg-pink-50">
      <Star className="w-5 h-5 text-pink-500" />
    </div>
    <div className="mt-2">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  </div>
);

const ProfileCard = ({ profile, index, onFavorite, isFavorite }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
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
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onFavorite(profile.id)}
        className={`absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center transition-colors ${
          isFavorite ? "text-pink-500" : "text-gray-400 hover:text-pink-500"
        }`}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </motion.button>

      {profile.matchPercentage && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded-full text-xs font-medium text-pink-600">
          {profile.matchPercentage}% Match
        </div>
      )}
    </div>

    <div className="p-4 space-y-3">
      <div>
        <h3 className="font-medium text-gray-900">
          {profile.name || "Profile " + profile.id.slice(0, 4)}
        </h3>
        <p className="text-sm text-gray-600">
          {profile.age} years • {profile.religion}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        {profile.education && (
          <div className="flex items-center text-gray-600">
            <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{profile.education}</span>
          </div>
        )}

        {profile.caste && (
          <div className="flex items-center text-gray-600">
            <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{profile.caste}</span>
          </div>
        )}

        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {profile.location?.city}, {profile.location?.state}
          </span>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm px-4 py-1 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
        >
          View Profile
        </motion.button>
      </div>
    </div>
  </motion.div>
);

export default function BasicSearch() {
  // Step management for the multi-step search process
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 3;

  // Core search parameters with comprehensive initial values
  const [searchParams, setSearchParams] = useState({
    gender: "Bride",
    ageFrom: 18,
    ageTo: 30,
    heightFrom: "",
    heightTo: "",
    maritalStatus: "",
    religion: "",
    caste: "",
    education: "",
    withPhoto: false,
    countryLiving: "India",
    stateLiving: "",
    cityLiving: "",
  });

  // UI state management for loading, results, and error handling
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  // Favorites management using Set for efficient lookups
  const [favorites, setFavorites] = useState(new Set());

  // Track search history to enable undo/redo functionality
  const [searchHistory, setSearchHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Handler for all form field changes with special case handling
  const handleInputChange = useCallback((field, value) => {
    setSearchParams((prev) => {
      const newParams = { ...prev, [field]: value };

      // Handle interdependent fields
      if (field === "religion") {
        // Reset caste when religion changes to maintain data consistency
        newParams.caste = "";
      }

      if (field === "ageFrom" && parseInt(value) > prev.ageTo) {
        // Adjust ageTo if ageFrom becomes larger
        newParams.ageTo = parseInt(value);
      }

      if (
        field === "heightFrom" &&
        value &&
        prev.heightTo &&
        parseInt(value) > parseInt(prev.heightTo)
      ) {
        // Adjust heightTo if heightFrom becomes larger
        newParams.heightTo = value;
      }

      return newParams;
    });

    // Clear any previous error messages when user makes changes
    setError("");
  }, []);

  // Handler for adding/removing profiles from favorites
  const handleFavoriteToggle = useCallback((profileId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(profileId)) {
        newFavorites.delete(profileId);
      } else {
        newFavorites.add(profileId);
      }
      return newFavorites;
    });
  }, []);

  // Calculate match percentage between a profile and search criteria
  const calculateMatchPercentage = useCallback(
    (profile) => {
      let matchPoints = 0;
      let totalPoints = 0;

      // Basic criteria matches (2 points each)
      if (
        profile.age >= searchParams.ageFrom &&
        profile.age <= searchParams.ageTo
      ) {
        matchPoints += 2;
      }
      totalPoints += 2;

      if (searchParams.heightFrom && searchParams.heightTo) {
        if (
          profile.height >= parseInt(searchParams.heightFrom) &&
          profile.height <= parseInt(searchParams.heightTo)
        ) {
          matchPoints += 2;
        }
        totalPoints += 2;
      }

      // Important criteria matches (3 points each)
      if (
        searchParams.religion &&
        profile.religion.toLowerCase() === searchParams.religion.toLowerCase()
      ) {
        matchPoints += 3;
      }
      if (searchParams.religion) totalPoints += 3;

      if (searchParams.caste && profile.caste === searchParams.caste) {
        matchPoints += 3;
      }
      if (searchParams.caste) totalPoints += 3;

      // Educational criteria matches (2 points)
      if (
        searchParams.education &&
        profile.education === searchParams.education
      ) {
        matchPoints += 2;
      }
      if (searchParams.education) totalPoints += 2;

      // Location criteria matches (1 point each)
      if (
        searchParams.stateLiving &&
        profile.location?.state === searchParams.stateLiving
      ) {
        matchPoints += 1;
      }
      if (searchParams.stateLiving) totalPoints += 1;

      if (
        searchParams.cityLiving &&
        profile.location?.city === searchParams.cityLiving
      ) {
        matchPoints += 1;
      }
      if (searchParams.cityLiving) totalPoints += 1;

      // Calculate percentage based on available criteria
      return totalPoints > 0
        ? Math.round((matchPoints / totalPoints) * 100)
        : 100;
    },
    [searchParams]
  );

  // Function to check if a profile matches all required search criteria
  const meetsSearchCriteria = useCallback(
    (profile) => {
      // Required criteria that must match
      if (
        profile.age < searchParams.ageFrom ||
        profile.age > searchParams.ageTo
      ) {
        return false;
      }

      // Height criteria (if specified)
      if (searchParams.heightFrom && searchParams.heightTo) {
        const height = parseInt(profile.height);
        if (
          height < parseInt(searchParams.heightFrom) ||
          height > parseInt(searchParams.heightTo)
        ) {
          return false;
        }
      }

      // Religion and caste criteria
      if (
        searchParams.religion &&
        profile.religion.toLowerCase() !== searchParams.religion.toLowerCase()
      ) {
        return false;
      }

      if (searchParams.caste && profile.caste !== searchParams.caste) {
        return false;
      }

      // Education criteria
      if (
        searchParams.education &&
        profile.education !== searchParams.education
      ) {
        return false;
      }

      // Photo criteria
      if (searchParams.withPhoto && !profile.photoUrl) {
        return false;
      }

      // Location criteria
      if (
        searchParams.countryLiving &&
        profile.location?.country !== searchParams.countryLiving
      ) {
        return false;
      }

      if (
        searchParams.stateLiving &&
        profile.location?.state !== searchParams.stateLiving
      ) {
        return false;
      }

      if (
        searchParams.cityLiving &&
        profile.location?.city !== searchParams.cityLiving
      ) {
        return false;
      }

      return true;
    },
    [searchParams]
  );

  // Search execution with comprehensive error handling
  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Build the base query
      const usersRef = collection(db, "users");
      const searchGender = searchParams.gender === "Bride" ? "female" : "male";

      // Create array of query constraints
      const queryConstraints = [where("gender", "==", searchGender)];

      // Add filters for indexed fields
      if (searchParams.religion) {
        queryConstraints.push(
          where("religion", "==", searchParams.religion.toLowerCase())
        );
      }

      if (searchParams.education) {
        queryConstraints.push(where("education", "==", searchParams.education));
      }

      // Execute search query
      const queryRef = query(usersRef, ...queryConstraints);
      const querySnapshot = await getDocs(queryRef);

      // Process results and apply additional filters
      let profiles = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (meetsSearchCriteria(data)) {
          const profile = {
            id: doc.id,
            ...data,
          };
          // Calculate and add match percentage
          profile.matchPercentage = calculateMatchPercentage(profile);
          profiles.push(profile);
        }
      });

      // Sort profiles by match percentage
      profiles.sort((a, b) => b.matchPercentage - a.matchPercentage);

      setResults(profiles);

      // Add search to history
      setSearchHistory((prev) => [
        ...prev.slice(0, historyIndex + 1),
        searchParams,
      ]);
      setHistoryIndex((prev) => prev + 1);

      // Show error if no results found
      if (profiles.length === 0) {
        setError(
          "No matching profiles found. Try adjusting your search criteria."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("An error occurred while searching. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers for multi-step search
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Form reset handler
  const handleReset = useCallback(() => {
    setSearchParams({
      gender: "Bride",
      ageFrom: 18,
      ageTo: 30,
      heightFrom: "",
      heightTo: "",
      maritalStatus: "",
      religion: "",
      caste: "",
      education: "",
      withPhoto: false,
      countryLiving: "India",
      stateLiving: "",
      cityLiving: "",
    });
    setResults([]);
    setError("");
    setCurrentStep(0);
  }, []);

  // Compute derived states for UI rendering
  const hasActiveFilters = useCallback(() => {
    return (
      searchParams.religion ||
      searchParams.caste ||
      searchParams.education ||
      searchParams.heightFrom ||
      searchParams.withPhoto
    );
  }, [searchParams]);

  const getHighCompatibilityCount = useCallback(() => {
    return results.filter((profile) => profile.matchPercentage >= 80).length;
  }, [results]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Find Your Perfect Match
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Let us help you discover compatible partners through our comprehensive
          search
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
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">From</label>
                    <select
                      value={searchParams.ageFrom}
                      onChange={(e) =>
                        handleInputChange("ageFrom", parseInt(e.target.value))
                      }
                      className={selectClassName}
                    >
                      {[...Array(43)].map((_, i) => (
                        <option key={i + 18} value={i + 18}>
                          {i + 18} years
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">To</label>
                    <select
                      value={searchParams.ageTo}
                      onChange={(e) =>
                        handleInputChange("ageTo", parseInt(e.target.value))
                      }
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

              {/* Height Range Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Height Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">From</label>
                    <select
                      value={searchParams.heightFrom}
                      onChange={(e) =>
                        handleInputChange("heightFrom", e.target.value)
                      }
                      className={selectClassName}
                    >
                      <option value="">Any Height</option>
                      {HEIGHT_OPTIONS.map((height) => (
                        <option key={height.value} value={height.value}>
                          {height.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">To</label>
                    <select
                      value={searchParams.heightTo}
                      onChange={(e) =>
                        handleInputChange("heightTo", e.target.value)
                      }
                      className={selectClassName}
                      disabled={!searchParams.heightFrom}
                    >
                      <option value="">Any Height</option>
                      {HEIGHT_OPTIONS.map((height) => (
                        <option
                          key={height.value}
                          value={height.value}
                          disabled={
                            parseInt(height.value) <
                            parseInt(searchParams.heightFrom || "0")
                          }
                        >
                          {height.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </SearchStep>
        )}

        {currentStep === 1 && (
          <SearchStep
            key="step2"
            title="Religious & Cultural Background"
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
                  onChange={(e) =>
                    handleInputChange("religion", e.target.value)
                  }
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
                    CASTES[searchParams.religion.toLowerCase()]?.map(
                      (caste) => (
                        <option key={caste} value={caste}>
                          {caste}
                        </option>
                      )
                    )}
                </select>
              </div>

              {/* Marital Status */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Marital Status
                </label>
                <select
                  value={searchParams.maritalStatus}
                  onChange={(e) =>
                    handleInputChange("maritalStatus", e.target.value)
                  }
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

        {currentStep === 2 && (
          <SearchStep
            key="step3"
            title="Education & Photo Preferences"
            description="Set your educational criteria and photo requirements"
            icon={GraduationCap}
          >
            <div className="space-y-6">
              {/* Education Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Educational Qualification
                </label>
                <select
                  value={searchParams.education}
                  onChange={(e) =>
                    handleInputChange("education", e.target.value)
                  }
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

              {/* Photo Settings */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchParams.withPhoto}
                      onChange={(e) =>
                        handleInputChange("withPhoto", e.target.checked)
                      }
                      className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">
                      Show profiles with photo only
                    </span>
                  </label>
                  <Image className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Selecting this option will filter out profiles without photos
                </p>
              </div>
            </div>
          </SearchStep>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={prevStep}
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
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? "Searching..." : "Find Matches"}</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextStep}
            className="px-4 py-2 text-pink-600 flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-12 space-y-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                We found some great matches for you!
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
              <MatchIndicator value={results.length} label="Total Matches" />
              <MatchIndicator
                value={`${Math.round(
                  (results.filter((p) => p.matchPercentage >= 80).length /
                    results.length) *
                    100
                )}%`}
                label="High Compatibility"
              />
              <MatchIndicator value={favorites.size} label="Favorites" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={{
                    ...profile,
                    matchPercentage: calculateMatchPercentage(profile),
                  }}
                  index={index}
                  onFavorite={handleFavoriteToggle}
                  isFavorite={favorites.has(profile.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
