// app/success-stories/new/page.js
'use client';
import { useAuth } from '@/hooks/useAuth';
import StoryForm from '@/components/SuccessStory/SuccessStoryForm';

export default function NewStoryPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to share your story.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Share Your Success Story</h1>
          <p className="mt-2 text-gray-600">
            Inspire others by sharing your journey to finding love
          </p>
        </div>
        <div className="mt-12">
          <StoryForm user={user} />
        </div>
      </div>
    </div>
  );
}