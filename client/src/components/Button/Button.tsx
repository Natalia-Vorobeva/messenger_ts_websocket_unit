import React from 'react';
import { useDispatch } from 'react-redux';
import { handleButton } from '../../store/api/apiSlice';
import { Message } from '../../types';
import './Button.scss';

interface ButtonProps {
  btnText: string;
  data: Message;
  column: 'left' | 'central' | 'right';
  className: string;
  hover?: boolean;
  buttonName: 'left' | 'central' | 'right';
  id: string;
  onMoveCard?: (buttonName: string, data: Message, column: string) => void;
}

const Button: React.FC<ButtonProps> = ({
  btnText,
  data,
  column,
  className,
  hover,
  buttonName,
  id,
  onMoveCard,
}) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    if (onMoveCard) {
      onMoveCard(buttonName, data, column);
    } else {
      dispatch(handleButton({
        object: data,
        column,
        buttonName,
      }));
    }
  };

  return (
    <div id={id} onClick={handleClick} data-hover={hover} className={`button ${className}`}>
      <div className={`button__${id}`}>{btnText}</div>
    </div>
  );
};

export default Button;