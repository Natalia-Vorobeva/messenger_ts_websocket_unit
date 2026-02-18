import React from 'react';
import avatar from '../../assets/images/avatar.png';
import './Comments.scss';

interface CommentsProps {
  comments: string[];
  handleFilterComments: (index: number) => void;
  name?: string;
}

const Comments: React.FC<CommentsProps> = ({
  comments,
  handleFilterComments,
  name = 'Воробьева Наталья',
}) => {
  return (
    <div className="comments">
      {comments.length === 0 ? (
        <div className="comments__empty">
          <p className="comments__empty-text">Пока нет комментариев</p>
          <p className="comments__empty-subtext">Будьте первым, кто оставит комментарий!</p>
        </div>
      ) : (
        comments.map((item, index) => (
          <div key={`${item}${index}/comment-content`} className="comments__element">
            <p className="comments__user">{name}</p>
            <div className="comments__wrapper">
              <img src={avatar} alt="аватар" className="comments__avatar" />
              <p className="comments__item">{item}</p>
              <button
                onClick={() => handleFilterComments(index)}
                className="comments__delete"
              >
                Удалить
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Comments;