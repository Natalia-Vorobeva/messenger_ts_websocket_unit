import React, { useState, useEffect, useCallback } from 'react';
import './Tutorial.scss';

interface TutorialProps {
	isDataLoaded: boolean;
	windowWidth: number;
}

const Tutorial: React.FC<TutorialProps> = ({ isDataLoaded, windowWidth }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [dontShowAgain, setDontShowAgain] = useState(false);

	// Условие открытия: данные загружены, ширина >900 и ещё не сохраняли флаг "больше не показывать"
	useEffect(() => {
		if (isDataLoaded && !localStorage.getItem('tutorialSeen')) {
			setIsOpen(true);
		}
	}, [isDataLoaded, windowWidth]);

	const handleClose = (shouldSave: boolean) => {
		if (shouldSave) {
			localStorage.setItem('tutorialSeen', 'true');
		}
		setIsOpen(false);
	};

	// Обработчик нажатия Enter
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Enter' && isOpen) {
				e.preventDefault();
				handleClose(dontShowAgain);
			}
		},
		[isOpen, dontShowAgain]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	if (!isOpen) return null;

	return (
		<div className="tutorial-overlay" onClick={() => setIsOpen(false)}>
			<div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
				<button className="tutorial-close" onClick={() => setIsOpen(false)}>
					✕
				</button>

				<h2>Добро пожаловать<br />в My ♡ Messenger</h2>

				<p>Приложение использует три колонки для организации сообщений:</p>

				<ul>
					<li><strong>Левая колонка</strong> – сюда можно перемещать важные сообщения.</li>
					<li><strong>Центральная колонка</strong> – основной поток сообщений.</li>
					<li><strong>Правая колонка</strong> – для отложенных сообщений.</li>
					<li>Нажмите на сердечко в карточке, чтобы добавить сообщение в избранное.</li>
				</ul>

				<p>Сообщения можно перемещать между колонками с помощью кнопок под карточкой.</p>

				<label className="tutorial-checkbox">
					<input
						type="checkbox"
						checked={dontShowAgain}
						onChange={(e) => setDontShowAgain(e.target.checked)}
					/>
					<span>Больше не показывать</span>
				</label>

				<button
					className="tutorial-gotit"
					onClick={() => handleClose(dontShowAgain)}
				>
					Понятно
				</button>
			</div>
		</div>
	);
};

export default Tutorial;