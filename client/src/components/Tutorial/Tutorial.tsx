import React, { useState, useEffect } from 'react';
import './Tutorial.scss';

interface TutorialProps {
	isDataLoaded: boolean;
	windowWidth: number;
}

const Tutorial: React.FC<TutorialProps> = ({ isDataLoaded, windowWidth }) => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (isDataLoaded && windowWidth > 900 && !localStorage.getItem('tutorialSeen')) {
			setIsOpen(true);
			localStorage.setItem('tutorialSeen', 'true');
		}
	}, [isDataLoaded, windowWidth]);

	if (!isOpen) return null;

	return (
		<div className="tutorial-overlay" onClick={() => setIsOpen(false)}>
			<div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
				<button className="tutorial-close" onClick={() => setIsOpen(false)}>✕</button>
				<h2>Добро пожаловать<br/>в My ♡ Messenger</h2>
				<p>Приложение использует три колонки для организации сообщений:</p>
				<ul>
					<li><strong>Левая колонка</strong> – сюда можно перемещать важные сообщения.</li>
					<li><strong>Центральная колонка</strong> – основной поток сообщений.</li>
					<li><strong>Правая колонка</strong> – для отложенных сообщений.</li>
					<li>Нажмите на сердечко в карточке, чтобы добавить сообщение в избранное.</li>
				</ul>
				<p>Сообщения можно перемещать между колонками с помощью кнопок под карточкой.</p>
				<button className="tutorial-gotit" onClick={() => setIsOpen(false)}>Понятно</button>
			</div>
		</div>
	);
};

export default Tutorial;