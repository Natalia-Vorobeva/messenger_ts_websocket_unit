import { useState } from 'react';
import './Preloader.scss';

const Preloader: React.FC = () => {
  const [text, setText] = useState<boolean>(false);

  setTimeout(() => {
    setText(true);
  }, 3000);

  return (
    <div className="preloader">
      <div className="preloser__container">
        <span className="preloader__span"></span>
        <span className="preloader__span"></span>
        <span className="preloader__span"></span>
        <span className="preloader__span"></span>
      </div>
      {text && (
        <>
          <div className={`preloader__wrapper preloader__wrapper_${text ? 'visible' : ''}`}></div>
          <p className="preloader__text">Кажется что-то пошло не так...!</p>
          <p className="preloader__text">Перезагрузите страницу</p>
         
        </>
      )}
    </div>
  );
};

export default Preloader;