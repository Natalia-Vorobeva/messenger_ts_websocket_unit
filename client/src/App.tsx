import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster, toast } from 'react-hot-toast';
import {
	onToggleReverse,
	setDataMessages,
	setNewMessages,
	setOldMessages,
	setStateBtnFilterFavourites,
	updateLike,
	moveMessageReducer,
	deleteMessageReducer
} from './store/api/apiSlice';
import { apiSelectors } from './store/api/apiSelectors';
import { socketService } from './services/socket';
import { MessagesData, ServerMessage, Message } from './types';
import Tutorial from './components/Tutorial/Tutorial';
import FormSearch from './components/FormSearch/FormSearch';
import Preloader from './components/Preloader/Preloader';
import RightColumn from './components/Columns/RigthColumn/RigthColumn';
import LeftColumn from './components/Columns/LeftColumn/LeftColumn';
import CentralColumn from './components/Columns/CentralColumn/CentralColumn';
import Popup from './components/Popup/Popup';
import MessageInput from './components/MessageInput/MessageInput';
import 'intro.js/introjs.css';
import './index.css';
import './App.scss';

function App() {
	const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

	const dispatch = useDispatch();
	const dataMessages = useSelector(apiSelectors.getDataMessages);
	const idLast = useSelector(apiSelectors.getIdLast);
	const isModal = useSelector(apiSelectors.getIsModal);
	const btnFilterFavourites = useSelector(apiSelectors.getBtnFilterFavourites);
	const isReverse = useSelector(apiSelectors.getIsReverse);
	const [isLoading, setIsLoading] = useState(true);
	const [width, setWidth] = useState(window.innerWidth);
	const [oldMessagesLoaded, setOldMessagesLoaded] = useState(false);
	const [searchValue, setSearchValue] = useState('');
	const [activeTab, setActiveTab] = useState('central');
	const ref = useRef<HTMLDivElement>(null);
	localStorage.removeItem('tutorialSeen')
	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		socketService.connect(WS_URL);
		socketService.on('initialMessages', (data: MessagesData) => {
			setIsLoading(false);
			dispatch(setDataMessages(data));
		});

		socketService.on('newMessage', (data: { column: string; message: ServerMessage }) => {
			toast.success(`Новое сообщение в колонке ${data.column}`);
			const msgWithDate: Message = { ...data.message, date: data.message.date.replace(' ', 'T') + 'Z' };
			// Пока добавляем в центральную колонку (позже доработаем под колонки)
			dispatch(setNewMessages({ centralCol: [msgWithDate] }));
		});

		socketService.on('oldMessages', (data: { column: string; messages: ServerMessage[] }) => {
			const oldWithDate: Message[] = data.messages.map(msg => ({
				...msg,
				date: msg.date.replace(/ /g, 'T') + 'Z'
			}));
			dispatch(setOldMessages(oldWithDate));
			setOldMessagesLoaded(true);
		});
		socketService.on('likeUpdated', (data: { id: number; column: string; liked: boolean }) => {
			toast.success('Лайк обновлён');
			dispatch(updateLike(data));
		});

		socketService.on('messageMoved', (data: { id: number; fromColumn: string; toColumn: string }) => {
			toast.success(`Сообщение перемещено из ${data.fromColumn} в ${data.toColumn}`);
			dispatch(moveMessageReducer(data));
		});

		socketService.on('messageDeleted', (data: { id: number; column: string }) => {
			toast.success('Сообщение удалено');
			dispatch(deleteMessageReducer(data));
		});

		socketService.on('error', (err) => {
			toast.error('Ошибка соединения');
			console.error(err);
		});

		// Отписка и отключение при размонтировании
		return () => {
			socketService.off('initialMessages');
			socketService.off('newMessage');
			socketService.off('oldMessages');
			socketService.off('likeUpdated');
			socketService.off('error');
			socketService.off('messageMoved');
			socketService.off('messageDeleted');
			socketService.disconnect();
		};
	}, [dispatch]);

	const handleLoadOldMessages = () => {
		if (idLast) {
			// Пока загружаем только для центральной колонки
			socketService.emit('loadOldMessages', { column: 'central', lastId: idLast });
		}
	};

	const searchData = useMemo(() => {
		if (!searchValue.trim()) {
			return { leftCol: [], centralCol: [], rightCol: [] };
		}
		const lowerSearch = searchValue.toLowerCase();
		return {
			leftCol: dataMessages.leftCol.filter(el => el.content.toLowerCase().includes(lowerSearch)),
			centralCol: dataMessages.centralCol.filter(el => el.content.toLowerCase().includes(lowerSearch)),
			rightCol: dataMessages.rightCol.filter(el => el.content.toLowerCase().includes(lowerSearch)),
		};
	}, [searchValue, dataMessages]);

	const searchLength = useMemo(() => {
		if (!searchValue.trim()) return null;
		return Object.values(searchData).reduce((sum, val) => sum + val.length, 0);
	}, [searchValue, searchData]);

	function handleSearch(value: string) {
		setSearchValue(value);
	}

	function handleClearSearch() {
		setSearchValue('');
	}
	console.log(isLoading)

	const getColumnCounts = (column: 'left' | 'central' | 'right'): { total: number; favorites: number } => {
		const columnKey = `${column}Col` as keyof MessagesData;
		const messages = dataMessages[columnKey] || [];

		if (searchValue) {
			const filtered = messages.filter(el =>
				el.content.toLowerCase().includes(searchValue.toLowerCase())
			);
			return {
				total: filtered.length,
				favorites: filtered.filter(el => el.liked).length,
			};
		}

		return {
			total: messages.length,
			favorites: messages.filter(el => el.liked).length,
		};
	};

	return (
		<div className="app">
			<Tutorial isDataLoaded={!isLoading} windowWidth={width} />
			<Toaster
				position="top-right"
				toastOptions={{
    duration: 3000,
    style: {
      background: '#363636',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
      animation: 'slideInToast 0.3s ease',
    },
    success: { style: { background: '#4caf50' } },
    error: { style: { background: '#f44336' } },
  }}

			/>
			{isModal && <Popup />}
			{
				isLoading ? (
					<Preloader />
				) : (
					<div ref={ref} className="app__content">
						<div className="app__control-header">
							<div className="app__header-top">
								<h1 className="app__title">My <span className="app__title-span">♡</span> messenger</h1>
								<div className="app__search-container">
									<div className="app__search">
										<FormSearch
											onSubmit={handleSearch}
											initialValue={searchValue}
											onClear={handleClearSearch}
										/>
									</div>
									{searchLength !== null && (
										<div className="app__search-info">• Найдено: {searchLength}</div>
									)}
								</div>
							</div>
							<div className="app__header-bottom">
								<div className="app__header-content">
									<button
										onClick={handleLoadOldMessages}
										disabled={oldMessagesLoaded}
										className={`app__button-load ${oldMessagesLoaded ? 'app__button-load_disabled' : ''}`}
									>
										<span className="app__button-load-icon">↻</span>
										<span className="app__button-load-text">
											{oldMessagesLoaded ? 'Загружено' : 'Загрузить предыдущие'}
										</span>
									</button>
									<div className="app__sort-buttons">
										<button
											onClick={() => dispatch(onToggleReverse(!isReverse))}
											className="app__button-sort-toggle"
											aria-label={isReverse ? "Показать новые сверху" : "Показать старые сверху"}
											title={isReverse ? "Показать новые сверху" : "Показать старые сверху"}
										>
											<span className={`app__button-sort-icon ${isReverse ? 'app__button-sort-icon_reverse' : ''}`}>↕</span>
											<span className="app__button-sort-text">
												{isReverse ? "Старые сверху" : "Новые сверху"}
											</span>
										</button>
										<button
											onClick={() => dispatch(setStateBtnFilterFavourites(!btnFilterFavourites))}
											className="app__button-filter-toggle"
											aria-label={btnFilterFavourites ? "Показать все сообщения" : "Показать избранное"}
											title={btnFilterFavourites ? "Показать все сообщения" : "Показать избранное"}
										>
											<span className={`app__button-filter-icon ${!btnFilterFavourites ? 'app__button-filter-icon_active' : ''}`}>
												{!btnFilterFavourites ? '★' : '☆'}
											</span>
											<span className="app__button-filter-text">
												{!btnFilterFavourites ? "Избранное" : "Все"}
											</span>
										</button>
									</div>
								</div>
							</div>
						</div>
						<MessageInput />

						{width <= 900 && (
							<div className="app__column-tabs">
								<button
									className={`app__column-tab ${activeTab === 'left' ? 'app__column-tab_active' : ''}`}
									onClick={() => setActiveTab('left')}
								>
									<span className="app__column-tab-name">Левая</span>
									<span className="app__column-tab-count">
										({getColumnCounts('left').favorites}/{getColumnCounts('left').total})
									</span>
								</button>
								<button
									className={`app__column-tab ${activeTab === 'central' ? 'app__column-tab_active' : ''}`}
									onClick={() => setActiveTab('central')}
								>
									<span className="app__column-tab-name">Центральная</span>
									<span className="app__column-tab-count">
										({getColumnCounts('central').favorites}/{getColumnCounts('central').total})
									</span>
								</button>
								<button
									className={`app__column-tab ${activeTab === 'right' ? 'app__column-tab_active' : ''}`}
									onClick={() => setActiveTab('right')}
								>
									<span className="app__column-tab-name">Правая</span>
									<span className="app__column-tab-count">
										({getColumnCounts('right').favorites}/{getColumnCounts('right').total})
									</span>
								</button>
							</div>
						)}

						<div className="app__columns">
							{width > 900 ? (
								<>
									<LeftColumn searchQuery={searchValue} searchResults={searchData.leftCol} />
									<CentralColumn searchQuery={searchValue} searchResults={searchData.centralCol} />
									<RightColumn searchQuery={searchValue} searchResults={searchData.rightCol} />
								</>
							) : (
								<>
									{activeTab === 'left' && (
										<LeftColumn searchQuery={searchValue} searchResults={searchData.leftCol} />
									)}
									{activeTab === 'central' && (
										<CentralColumn searchQuery={searchValue} searchResults={searchData.centralCol} />
									)}
									{activeTab === 'right' && (
										<RightColumn searchQuery={searchValue} searchResults={searchData.rightCol} />
									)}
								</>
							)}
						</div>
					</div>
				)
			}
		</div >
	);
}

export default App;