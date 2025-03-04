"use client"

import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Quote, User, 
  MapPin, Clock, Gift, Camera,
  ChevronDown, ArrowRight, MessagesSquare,
  Share2, Eye, BookOpen
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStory, setExpandedStory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleStories, setVisibleStories] = useState(6);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(
          collection(db, 'success-stories'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const storiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          couple: `${doc.data().brideName || ''} & ${doc.data().groomName || ''}`.trim(),
          image: doc.data().photoUrl || '/api/placeholder/400/300',
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString(),
          category: ['Featured', 'Recent', 'Popular'][Math.floor(Math.random() * 3)],
          stats: {
            likes: Math.floor(Math.random() * 200) + 50,
            views: Math.floor(Math.random() * 1000) + 100,
            comments: Math.floor(Math.random() * 50) + 5
          }
        }));

        setStories(storiesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-16 h-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-pink-200 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-1 border-4 border-t-pink-500 border-transparent rounded-full"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  const filteredStories = stories.filter(story => 
    selectedCategory === 'all' || story.category === selectedCategory
  ).slice(0, visibleStories);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl mb-4">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          Success Stories
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Beautiful journeys of love and companionship that began here
        </p>
      </motion.div>

      {/* Category Filters */}
      <div className="flex justify-center gap-4 mb-12">
        {['all', 'Featured', 'Recent', 'Popular'].map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full transition-all duration-300 
              ${selectedCategory === category 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStories.map((story) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500"
          >
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={story.image}
                alt={story.couple}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center justify-between text-white mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{story.stats.likes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">{story.stats.views}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessagesSquare className="w-4 h-4" />
                      <span className="text-sm">{story.stats.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1 bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-600 rounded-full text-sm font-medium"
                >
                  {story.category}
                </motion.span>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{story.createdAt}</span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300">
                {story.couple}
              </h3>

              <AnimatePresence mode="wait">
                <motion.div
                  initial={false}
                  animate={{ height: expandedStory === story.id ? 'auto' : '6rem' }}
                  className="relative overflow-hidden"
                >
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {story.story}
                  </p>
                  {story.story?.length > 150 && (
                    <div className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent
                      ${expandedStory === story.id ? 'hidden' : 'block'}`}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {story.story?.length > 150 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExpandedStory(expandedStory === story.id ? null : story.id)}
                  className="text-pink-600 text-sm font-medium hover:text-pink-700 transition-colors duration-200"
                >
                  {expandedStory === story.id ? 'Read less' : 'Read more'}
                </motion.button>
              )}

              {/* Footer Section */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-pink-600 transition-colors duration-200"
                  >
                    <Heart className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-pink-600 transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors duration-200"
                >
                  <span className="text-sm font-medium">Read Full Story</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleStories < stories.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisibleStories(prev => prev + 6)}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <span>Load More Stories</span>
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Testimonials;