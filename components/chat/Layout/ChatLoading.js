// src/components/Layout/ChatLoading.js
export default function ChatLoading() {
    return (
      <div className="h-screen flex">
        {/* Sidebar Loading */}
        <div className="w-1/4 min-w-[300px] bg-white p-4 space-y-4">
          {/* Search Bar Loading */}
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          
          {/* Contact List Loading */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
  
        {/* Chat Area Loading */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Chat Header Loading */}
          <div className="p-4 border-b flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
          </div>
  
          {/* Messages Loading */}
          <div className="flex-1 p-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] h-16 rounded-lg animate-pulse
                    ${i % 2 === 0 ? 'bg-blue-200' : 'bg-gray-200'}`}
                  style={{ width: `${Math.random() * 30 + 40}%` }}
                />
              </div>
            ))}
          </div>
  
          {/* Input Area Loading */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }