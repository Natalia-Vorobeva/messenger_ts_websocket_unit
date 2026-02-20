import { useRef, useState, useEffect, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { apiSelectors } from '../../store/api/apiSelectors';
import { socketService } from '../../services/socket';
import { setChoice, setIsModal } from '../../store/api/apiSlice';
import Button from '../Button/Button';
import avatar from '../../assets/images/avatar.png';
import hide from '../../assets/images/hide.png';
import settings from '../../assets/images/settings.png';
import comment from '../../assets/images/comment.png';
import like from '../../assets/images/favourites.png';
import './Card.scss';
import { Message } from '../../types';

interface CardProps {
	data: Message;
	time: string;
	column: string;
	className: string;
	handleDelCard: (data: Message) => void;
	// handleFavourites: (data: Message) => void;
	onMoveCard: (buttonName: string, data: Message, column: string) => void; // предположительно
}

const Card: React.FC<CardProps> = ({
	data,
	time,
	column,
	className,
}) => {
	const dispatch = useDispatch();
	const isModal = useSelector(apiSelectors.getIsModal);
	const choice = useSelector(apiSelectors.getChoice); // тип any
	const [isPending, startTransition] = useTransition();
	const outsideClickRef = useRef<HTMLDivElement>(null);
	const [dimensions, setDimensions] = useState<boolean>(true);
	const [menu, setMenu] = useState<boolean>(false);
	const [outsideMenu, setOutsideMenu] = useState<boolean>(false);
	const [visibleContent, setVisibleContent] = useState<boolean>(true);
	const [confirmation, setConfirmation] = useState<boolean>(true);
	const [symbolCopy, setSymbolCopy] = useState<string>('⧉');

	const isCardSelected = choice?.object?.id === data.id && isModal;

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (outsideMenu) {
				if (outsideClickRef.current && !outsideClickRef.current.contains(e.target as Node)) {
					setMenu(false);
					setOutsideMenu(false);
				}
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [outsideMenu]);

	const toggleMenu = () => {
		setMenu(!menu);
	};

	useEffect(() => {
		setOutsideMenu(menu);
	}, [menu]);

	const handleFavourites = () => {
		console.log('📤 [КЛИЕНТ] Отправка toggleLike', { id: data.id, column });
		socketService.emit('toggleLike', { id: data.id, column });
	};

	const handleMove = (buttonName: string) => {
  // buttonName – это целевая колонка (left, central, right)
  if (buttonName === column) return; // не перемещаем ту же колонку
  socketService.emit('moveMessage', {
    id: data.id,
    fromColumn: column,
    toColumn: buttonName
  });
};

	const handleClipboard = (text: string) => {
		setSymbolCopy('✔');
		startTransition(async () => {
			await navigator.clipboard.writeText(text);
		});
		setTimeout(() => {
			setSymbolCopy('⧉');
		}, 2000);
	};

	const handleDelete = () => {
  socketService.emit('deleteMessage', { id: data.id, column });
};

	const handleDimensionsIcon = () => {
		setDimensions(!dimensions);
		setVisibleContent(!visibleContent);
	};

	const copyTextToClipboard = (text: string) => {
		startTransition(async () => {
			await navigator.clipboard.writeText(text);
		});
		setMenu(false);
	};

	const handleCommentOn = (data: Message) => {
		dispatch(setIsModal(true));
		dispatch(setChoice({
			object: data,
			column,
			time
		}));
		setVisibleContent(false);
		setDimensions(false);
	};

	const handleVisibleContent = () => {
		setVisibleContent(false);
		setDimensions(false);
	};

	useEffect(() => {
		if (!isModal && isCardSelected) {
			// можно добавить логику при закрытии модалки
		}
	}, [isModal, isCardSelected]);

	return (
		<section className={`card ${dimensions ? 'card_mini' : ''}`}>
			<div className="card__columns">
				<div className="card__column-avatar">
					<img src={avatar} alt="аватар" className="card__avatar" />
					{!dimensions && <p className="card__date">{time}</p>}
				</div>
				<div className="card__column-content">
					<div className="card__column-content-header">
						<div className="card__column-content-author">
							<h2 className="card__title">{data.author}</h2>
							{visibleContent && (
								<h2 className="card__subtitle card__subtitle_mini">{data.content}</h2>
							)}
						</div>
						<div className="card__column-content-buttons">
							{isCardSelected ? (
								<div onClick={() => handleClipboard(data.content)} className="card__copy">
									{symbolCopy}
								</div>
							) : (
								<div className="card__icons">
									<img
										onClick={() => handleCommentOn(data)}
										src={comment}
										alt="Комментировать"
										className={`card__icon card__icon_type_comment${isCardSelected ? '_active' : ''}`}
									/>
									<img
										onClick={handleDimensionsIcon}
										src={hide}
										alt="Изменить размеры"
										className={`card__icon card__icon_type_dimensions${!dimensions ? '_active' : ''} ${isCardSelected ? 'opacity' : ''}`}
									/>
									<div className="card__wrapper-button-settings" ref={outsideClickRef}>
										<img
											onClick={toggleMenu}
											src={settings}
											alt="Скопировать текст или удалить пост"
											className={`card__icon card__icon_type_settings${menu ? '_active' : ''}`}
										/>
										{menu && (
											<div className="card__wrapper-button-settings_overlay card__wrapper-button-settings_overlay_visible" />
										)}
										<div className={`card__menu-wrapper ${menu ? 'card__menu-wrapper_visible' : ''}`}>
											<div className="card__menu">
												<p onClick={() => copyTextToClipboard(data.content)} className="card__menu-copy">
													Скопировать текст
												</p>
												{confirmation ? (
													<p onClick={() => setConfirmation(false)} className="card__menu-delete">
														Удалить
													</p>
												) : (
													<p
														onClick={handleDelete}
														className="card__menu-delete card__menu-delete_confirmation"
													>
														Удалить навсегда?
													</p>
												)}
											</div>
										</div>
									</div>
									<img
										src={like}
										alt="В избранное"
										onClick={() => handleFavourites()}
										className={`card__icon card__icon_type_favourites${data.liked ? '_active' : '_no-active'} ${isCardSelected ? 'opacity' : ''}`}
									/>
								</div>
							)}
							<div className={`card__control-card card__control-card${className}`}>
								{!isCardSelected && (
									<div className="card__buttons">
										<Button
											id="left"
											buttonName="left"
											data={data}
											column={column as 'left' | 'central' | 'right'}
											onMoveCard={() => handleMove('left')}
											className={`${column === 'left' ? 'button_inactive ' : ''} ${isCardSelected ? '' : 'button_mini'}`}
											btnText="Левый"
											hover={false}
										/>
										<Button
											id="central"
											buttonName="central"
											data={data}
											column={column as 'left' | 'central' | 'right'}
											onMoveCard={() => handleMove('central')}
											className={`${column === 'central' ? 'button_inactive' : ''} ${isCardSelected ? '' : 'button_mini'}`}
											btnText="Центр"
											hover={false}
										/>
										<Button
											id="right"
											buttonName="right"
											data={data}
											column={column as 'left' | 'central' | 'right'}
											onMoveCard={() => handleMove('right')}
											className={`${column === 'right' ? 'button_inactive' : ''} ${isCardSelected ? '' : 'button_mini'}`}
											btnText="Правый"
											hover={false}
										/>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="card__column-content-data">
						{visibleContent && !isCardSelected ? (
							<div onClick={handleVisibleContent} className="card__more">
								Далее
							</div>
						) : (
							<p className="card__subtitle card__subtitle_full">{data.content}</p>
						)}
					</div>
				</div>
			</div>
			{!dimensions &&
				data.attachments?.map((item, index) => (
					<video
						key={item.url + index}
						src={item.url}
						muted
						loop
						autoPlay
						className="card__video"
					>
						<source src={item.url} type="video/mp4" />
						Ваш браузер не поддерживает встроенные видео
					</video>
				))}
		</section>
	);
};

export default Card;