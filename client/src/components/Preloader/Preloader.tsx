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
          <p className="preloader__text">Внимание!</p>
          <div className="preloader__info">
            Если проблема в CORS – решается через расширение для браузера или запуск хрома из консоли:
            open -na Google\ Chrome --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
            Или поищите в интернет, например для MAC OS команда несколько другая
            ЛУЧШИЙ вариант - поставить расширение для хрома
          </div>
        </>
      )}
    </div>
  );
};

export default Preloader;