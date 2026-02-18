import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Message, MessagesData } from '../../types';
import Card from '../Card/Card';
import Comment from '../Comment/Comment';
import { handleAddingFavourires, handleDeleteCard, setIsModal } from '../../store/api/apiSlice';
import { apiSelectors } from '../../store/api/apiSelectors';
import Comments from '../Comments/Comments';
import './Popup.scss';

const Popup: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	const isModal = useSelector(apiSelectors.getIsModal);
	const choice = useSelector(apiSelectors.getChoice);
	const [comments, setComments] = useState<string[]>([]);
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const messages = useSelector(apiSelectors.getDataMessages);

	const handleFilterComments = useCallback((currIndex: number) => {
		setComments(prevState => {
			const newArray = [...prevState];
			newArray.splice(currIndex, 1);
			return newArray;
		});
	}, []);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				dispatch(setIsModal(false));
			}
		};

		if (isModal) {
			const timer = setTimeout(() => {
				document.addEventListener('click', handleClickOutside);
			}, 0);

			return () => {
				clearTimeout(timer);
				document.removeEventListener('click', handleClickOutside);
			};
		}
	}, [isModal, dispatch]);

	useEffect(() => {
		setIsMounted(isModal);
	}, [isModal]);

	useEffect(() => {
		const handleEscClose = (evt: KeyboardEvent) => {
			if (evt.key === 'Escape') {
				dispatch(setIsModal(false));
			}
		};

		if (isModal) {
			document.addEventListener('keydown', handleEscClose);
		}

		return () => {
			document.removeEventListener('keydown', handleEscClose);
		};
	}, [isModal, dispatch]);

	const handleDelCard = () => {
		if (choice) {
			dispatch(handleDeleteCard({ column: choice.column, object: choice.object }));
			dispatch(setIsModal(false));
		}
	};

	const handleFavourites = (data: Message) => {
		if (!choice) return;
		const column = choice.column as keyof MessagesData;
		const updatedMessage = { ...data, liked: !data.liked };
		const updatedColumn = messages[column].map(msg =>
			msg.id === data.id ? updatedMessage : msg
		);
		const newMessages = { ...messages, [column]: updatedColumn };
		dispatch(handleAddingFavourires(newMessages));
	};

	const onSubmit = (e: React.FormEvent<HTMLFormElement>, value: string) => {
		e.preventDefault();
		if (value.trim()) {
			setComments((prevState) => [...prevState, value]);
		}
	};

	if (!isMounted || !choice?.object) return null;

	return (
		<section className={`popup ${isModal ? 'popup_showed' : ''}`}>
			<div className="popup__overlay"></div>
			<div ref={containerRef} className="popup__container">
				<div className="popup__inner">
					<button
						onClick={() => dispatch(setIsModal(false))}
						className="popup__close"
						aria-label="Закрыть попап"
					>
						×
					</button>

					<div ref={wrapperRef} className="popup__wrapper">
						<Card
							time={choice.time}
							handleFavourites={handleFavourites}
							handleDelCard={handleDelCard}
							column={choice.column}
							data={choice.object}
							className="" // обязательный пропс
							onMoveCard={() => { }} // обязательный пропс
						/>
					</div>

					<div className="popup__list">
						<Comments comments={comments} handleFilterComments={handleFilterComments} />
					</div>

					<div className="popup__input">
						<Comment onSubmit={onSubmit} />
					</div>
				</div>
			</div>
		</section>
	);
};

export default Popup;