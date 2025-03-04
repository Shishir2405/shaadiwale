"use client"

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  where,
  limit,
  startAfter,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { Heart, Calendar, MessageCircle, Share2, Search, ArrowUp } from 'lucide-react';

const STORIES_PER_PAGE = 6;

const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStories, setExpandedStories] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [likedStories, setLikedStories] = useState(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchStories = async (isInitial = true) => {
    try {
      setError(null);
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      let storyQuery = query(
        collection(db, 'success-stories'),
        orderBy('createdAt', 'desc'),
        limit(STORIES_PER_PAGE)
      );

      if (!isInitial && lastVisible) {
        storyQuery = query(
          collection(db, 'success-stories'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(STORIES_PER_PAGE)
        );
      }

      const snapshot = await getDocs(storyQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const newStories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString(),
        engagementDate: doc.data().engagementDate,
        marriageDate: doc.data().marriageDate,
        likes: doc.data().likes || 0,
        comments: doc.data().comments || 0
      }));

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      if (isInitial) {
        setStories(newStories);
      } else {
        setStories(prev => [...prev, ...newStories]);
      }
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleLike = async (storyId) => {
    try {
      const storyRef = doc(db, 'success-stories', storyId);
      
      setLikedStories(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storyId)) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });

      await updateDoc(storyRef, {
        likes: increment(likedStories.has(storyId) ? -1 : 1)
      });

      setStories(prev =>
        prev.map(story =>
          story.id === storyId
            ? { ...story, likes: likedStories.has(storyId) ? story.likes - 1 : story.likes + 1 }
            : story
        )
      );
    } catch (err) {
      console.error('Error updating likes:', err);
    }
  };

  const toggleExpand = (storyId) => {
    setExpandedStories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredStories = stories.filter(story => {
    if (!searchTerm) return true;
    
    const searchFields = [
      story.brideName,
      story.groomName,
      story.story,
    ].map(field => field?.toLowerCase() || '');

    return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(n => (
          <div key={n} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="h-48 bg-pink-50"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-pink-50 rounded w-3/4"></div>
              <div className="h-4 bg-pink-50 rounded w-1/2"></div>
              <div className="h-4 bg-pink-50 rounded w-full"></div>
              <div className="h-4 bg-pink-50 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-pink-50 rounded-xl">
        <div className="text-pink-600">{error}</div>
        <button 
          onClick={() => fetchStories()}
          className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-pink-500 transition-colors duration-200 w-5 h-5" />
          <input
            type="text"
            placeholder="Search success stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative">
              {story.photoUrl && (
                <img
                  src={story.photoUrl}
                  alt={`${story.brideName} & ${story.groomName}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">
                {story.brideName} & {story.groomName}
              </h2>

              <div className="flex gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Wedding: {story.marriageDate}</span>
                </div>
              </div>

              <p className={`text-gray-600 transition-all duration-300 ${
                expandedStories.has(story.id) ? '' : 'line-clamp-3'
              }`}>
                {story.story}
              </p>

              <button
                onClick={() => toggleExpand(story.id)}
                className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors duration-200"
              >
                {expandedStories.has(story.id) ? 'Read less' : 'Read more'}
              </button>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLike(story.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors duration-200 group"
                >
                  <Heart
                    className={`w-5 h-5 transform group-hover:scale-110 transition-all duration-200 ${
                      likedStories.has(story.id) ? 'fill-current text-pink-600' : ''
                    }`}
                  />
                  <span>{story.likes}</span>
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageCircle className="w-5 h-5" />
                    <span>{story.comments}</span>
                  </div>
                  
                  <button className="text-gray-500 hover:text-pink-600 transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Posted on {story.createdAt}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-8">
          <button
            onClick={() => fetchStories(false)}
            disabled={loadingMore}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200 disabled:bg-pink-400"
          >
            {loadingMore ? 'Loading...' : 'Load More Stories'}
          </button>
        </div>
      )}

      {filteredStories.length === 0 && (
        <div className="text-center py-12 bg-pink-50 rounded-xl">
          <div className="text-pink-600">No stories found matching your search</div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-3 bg-pink-600 text-white rounded-full shadow-lg transform transition-all duration-300 hover:bg-pink-700 hover:scale-110 ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default StoryList;