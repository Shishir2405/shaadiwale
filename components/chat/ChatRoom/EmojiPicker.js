// src/components/ChatRoom/EmojiPicker.js
'use client';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="absolute bottom-full mb-2 z-50">
      <div className="shadow-lg rounded-lg">
        <Picker
          data={data}
          onEmojiSelect={onSelect}
          theme="light"
          set="native"
          previewPosition="none"
          skinTonePosition="none"
          maxFrequentRows={2}
          navPosition="bottom"
          perLine={8}
        />
      </div>
    </div>
  );
}