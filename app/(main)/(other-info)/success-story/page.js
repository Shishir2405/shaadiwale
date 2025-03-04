// app/success-stories/page.js
import StoryList from '@/components/SuccessStory/StoryList';

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12">Success Stories</h1>
        <StoryList />
      </div>
    </div>
  );
}