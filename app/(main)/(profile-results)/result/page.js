'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, MapPin, GraduationCap, Briefcase, Search, Filter, ArrowLeft } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('grid');

  useEffect(() => {
    try {
      const results = JSON.parse(sessionStorage.getItem('searchResults') || '[]');
      const criteria = JSON.parse(sessionStorage.getItem('searchCriteria') || '{}');
      
      if (!results.length && !Object.keys(criteria).length) {
        router.push('/');
        return;
      }

      setMatches(results);
      setSearchCriteria(criteria);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleNewSearch = () => {
    router.push('/');
  };

  const handleViewProfile = (userId) => {
    router.push(`/profile/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="p-8 rounded-lg bg-white shadow-lg">
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 text-center">Finding your perfect match...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-orange-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">No Matches Found</h1>
          <p className="text-gray-600">
            We couldn't find any profiles matching your search criteria. Try adjusting your filters
            for more results.
          </p>
          <button
            onClick={handleNewSearch}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-md"
          >
            Try New Search
          </button>
        </div>
      </div>
    );
  }

  const ProfileCard = ({ profile }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        {/* Profile Image */}
        <div className="relative h-64 bg-gradient-to-br from-orange-100 to-pink-100">
          {profile.photos?.profile?.url ? (
            <Image
              src={profile.photos.profile.url}
              alt={profile.firstName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">{profile.firstName?.[0]}</span>
                </div>
                <span>No Photo Available</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-4 right-4 space-x-2">
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md group">
            <Heart className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1">
            {profile.firstName} {profile.lastName}
          </h3>
          <div className="flex items-center text-gray-600 text-sm space-x-2">
            <span>{profile.age} years</span>
            <span>•</span>
            <span>{profile.height || 'Height not specified'}</span>
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {profile.religion} {profile.caste ? `• ${profile.caste}` : ''}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span className="text-sm">{profile.highestEducation || 'Education not specified'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="text-sm">{profile.occupation || 'Occupation not specified'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{profile.residingCity}, {profile.residingState}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleViewProfile(profile.id)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-md"
          >
            View Profile
          </button>
          <button className="flex-1 px-4 py-2.5 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-transparent bg-clip-text">
                  {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                </h1>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {searchCriteria?.lookingFor} • {searchCriteria?.ageFrom}-{searchCriteria?.ageTo} years
                {searchCriteria?.religion && ` • ${searchCriteria.religion}`}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleNewSearch}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Search
              </button>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => setViewType('grid')}
                  className={`px-4 py-2 ${viewType === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`px-4 py-2 ${viewType === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className={`grid gap-6 ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {matches.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      </div>
    </div>
  );
}