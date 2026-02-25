import { useState, useEffect } from 'react';
import './Preloader.scss';

interface PreloaderProps {
  message?: string;     
  showAfter?: number;    
}

const Preloader: React.FC<PreloaderProps> = ({ 
  message = 'Нужно немного времени, чтобы сервер проснулся...', 
  showAfter = 3000 
}) => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), showAfter);
    return () => clearTimeout(timer);
  }, [showAfter]);

  return (
    <div className="preloader">
      <div className="preloser__container">
        <span className="preloader__span"></span>
        <span className="preloader__span"></span>
        <span className="preloader__span"></span>
        <span className="preloader__span"></span>
      </div>
      {showMessage && (
        <>
          <div className="preloader__wrapper preloader__wrapper_visible"></div>
          <p className="preloader__text">{message}</p>
        </>
      )}
    </div>
  );
};

export default Preloader;