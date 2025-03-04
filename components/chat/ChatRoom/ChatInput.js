// src/components/ChatRoom/ChatInput.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Smile, Paperclip } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const emojiButtonRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        !emojiButtonRef.current?.contains(event.target) &&
        !event.target.closest('.emoji-mart')
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    const cursorPosition = input.selectionStart;
    
    const newMessage = 
      message.slice(0, cursorPosition) + 
      emoji.native + 
      message.slice(cursorPosition);
    
    setMessage(newMessage);
    
    // Set cursor position after emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(
        cursorPosition + emoji.native.length,
        cursorPosition + emoji.native.length
      );
    }, 0);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <button
          type="button"
          ref={emojiButtonRef}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <Smile className={`w-6 h-6 ${showEmojiPicker ? 'text-blue-500' : 'text-gray-500'}`} />
          {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} />}
        </button>

        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Paperclip className="w-6 h-6 text-gray-500" />
        </button>
        
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-2 pl-4 pr-12 border rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {message.trim() ? (
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors transform hover:scale-105"
          >
            <Send className="w-6 h-6" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 rounded-full transition-colors transform hover:scale-105 ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <Mic className="w-6 h-6" />
          </button>
        )}
      </form>
    </div>
  );
}