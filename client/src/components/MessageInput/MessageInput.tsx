import React, { useState } from 'react';
import { socketService } from '../../services/socket';
import './MessageInput.scss';

const MessageInput: React.FC = () => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    socketService.emit('sendMessage', {
      column: 'central',
      text,
      author: 'Пользователь'
    });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Напишите сообщение..."
        className="message-input__field"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="message-input__button"
        aria-label="Отправить"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;