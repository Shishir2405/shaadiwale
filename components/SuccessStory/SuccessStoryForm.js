"use client"

import React, { useState } from 'react';
import { AlertCircle, Heart, Calendar, Image, FileText } from 'lucide-react';

const SuccessStoryForm = ({ user }) => {
  const [formData, setFormData] = useState({
    brideId: "",
    brideName: "",
    groomId: "",
    groomName: "",
    engagementDate: { day: "", month: "", year: "" },
    marriageDate: { day: "", month: "", year: "" },
    story: "",
    photoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('couple');
  const [submitted, setSubmitted] = useState(false);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const years = Array.from({ length: 91 }, (_, i) => 2050 - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Simulating submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
      setTimeout(() => {
        setFormData({
          brideId: "",
          brideName: "",
          groomId: "",
          groomName: "",
          engagementDate: { day: "", month: "", year: "" },
          marriageDate: { day: "", month: "", year: "" },
          story: "",
          photoUrl: "",
        });
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Error posting story:", error);
    }
    setLoading(false);
  };

  const formSections = {
    couple: (
      <div className={`transition-all duration-300 ${activeSection === 'couple' ? 'scale-100 opacity-100' : 'scale-95 opacity-0 hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 group">
            <label className="block text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
              Bride Details
            </label>
            <input
              type="text"
              name="brideId"
              value={formData.brideId}
              onChange={handleChange}
              placeholder="Bride ID *"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
            />
            <input
              type="text"
              name="brideName"
              value={formData.brideName}
              onChange={handleChange}
              placeholder="Bride Name *"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
            />
          </div>
          
          <div className="space-y-4 group">
            <label className="block text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
              Groom Details
            </label>
            <input
              type="text"
              name="groomId"
              value={formData.groomId}
              onChange={handleChange}
              placeholder="Groom ID *"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
            />
            <input
              type="text"
              name="groomName"
              value={formData.groomName}
              onChange={handleChange}
              placeholder="Groom Name *"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
            />
          </div>
        </div>
      </div>
    ),
    dates: (
      <div className={`transition-all duration-300 ${activeSection === 'dates' ? 'scale-100 opacity-100' : 'scale-95 opacity-0 hidden'}`}>
        <div className="space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors mb-2">
              Engagement Date *
            </label>
            <div className="grid grid-cols-3 gap-4">
              <select
                name="engagementDate.day"
                value={formData.engagementDate.day}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select
                name="engagementDate.month"
                value={formData.engagementDate.month}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                name="engagementDate.year"
                value={formData.engagementDate.year}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors mb-2">
              Marriage Date *
            </label>
            <div className="grid grid-cols-3 gap-4">
              <select
                name="marriageDate.day"
                value={formData.marriageDate.day}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              >
                <option value="">Day</option>
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select
                name="marriageDate.month"
                value={formData.marriageDate.month}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              >
                <option value="">Month</option>
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select
                name="marriageDate.year"
                value={formData.marriageDate.year}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    ),
    story: (
      <div className={`transition-all duration-300 ${activeSection === 'story' ? 'scale-100 opacity-100' : 'scale-95 opacity-0 hidden'}`}>
        <div className="space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
              Success Story *
            </label>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
              placeholder="Share your journey..."
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
              Photo URL *
            </label>
            <input
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="Enter image URL"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 transition-all hover:border-pink-400"
            />
            {formData.photoUrl && (
              <div className="mt-4 transform transition-all duration-300 hover:scale-105">
                <img
                  src={formData.photoUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
                  onError={(e) => e.target.style.display = "none"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  };

  const navigationButtons = [
    { id: 'couple', icon: Heart, label: 'Couple Details' },
    { id: 'dates', icon: Calendar, label: 'Important Dates' },
    { id: 'story', icon: FileText, label: 'Your Story' }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
        <div className="p-6">
          <div className="flex justify-center mb-8 space-x-4">
            {navigationButtons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
                  activeSection === id 
                    ? 'bg-pink-50 text-pink-600 scale-105' 
                    : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {formSections[activeSection]}

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = navigationButtons.findIndex(btn => btn.id === activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(navigationButtons[currentIndex - 1].id);
                  }
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 
                  ${activeSection === 'couple' 
                    ? 'opacity-0 cursor-default' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Previous
              </button>
              
              {activeSection === 'story' ? (
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded-md text-white font-medium transition-all duration-300 
                    ${loading 
                      ? 'bg-pink-400 cursor-wait' 
                      : 'bg-pink-600 hover:bg-pink-700 hover:shadow-lg transform hover:-translate-y-0.5'
                    } ${submitted ? 'bg-green-500' : ''}`}
                >
                  {loading ? 'Submitting...' : submitted ? 'Submitted!' : 'Share Your Story'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = navigationButtons.findIndex(btn => btn.id === activeSection);
                    if (currentIndex < navigationButtons.length - 1) {
                      setActiveSection(navigationButtons[currentIndex + 1].id);
                    }
                  }}
                  className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuccessStoryForm;