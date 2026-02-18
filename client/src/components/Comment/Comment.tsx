import React from 'react';
import FormPopup from '../FormPopup/FormPopup';
import './Comment.scss';

interface CommentProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>, comment: string) => void;
}

const Comment: React.FC<CommentProps> = ({ onSubmit }) => {
  return (
    <div className="comment">
      <FormPopup onSubmit={onSubmit} />
    </div>
  );
};

export default Comment;