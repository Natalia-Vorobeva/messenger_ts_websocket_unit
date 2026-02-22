import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message, MessagesData, AppState, SelectedCard } from '../../types'; // путь подкорректируй

const initialState: AppState = {
	idLast: null,
	isModal: false,
	dataMessages: {
		leftCol: [],
		centralCol: [],
		rightCol: [],
	},
	btnFilterFavourites: true,
	isReverse: false,
	isSearched: false,
	choice: null,
};

const apiSlice = createSlice({
	name: 'api',
	initialState,
	reducers: {
		setLastId: (state, action: PayloadAction<number>) => {
			state.idLast = action.payload;
		},
		setChoice: (state, action: PayloadAction<SelectedCard | null>) => {
			state.choice = action.payload;
		},
		setStateBtnFilterFavourites: (state, action: PayloadAction<boolean>) => {
			state.btnFilterFavourites = action.payload;
		},
		setIsModal: (state, action: PayloadAction<boolean>) => {
			state.isModal = action.payload;
		},
		setDataMessages: (state, action: PayloadAction<MessagesData>) => {
			state.dataMessages = action.payload;
			// Вычисляем idLast из всех сообщений (опционально)
			const allMessages = [
				...action.payload.leftCol,
				...action.payload.centralCol,
				...action.payload.rightCol
			];
			if (allMessages.length > 0) {
				const ids = allMessages.map(msg => msg.id);
				state.idLast = Math.max(...ids);
			}
		},
		setNewMessages: (state, action: PayloadAction<{ centralCol: Message[] }>) => {
			const newMessages = action.payload.centralCol;
			if (newMessages.length > 0) {
				// Добавляем новые сообщения к существующим
				state.dataMessages.centralCol = [...state.dataMessages.centralCol, ...newMessages];
				// Обновляем idLast (берём максимальный id из всех сообщений центральной колонки)
				const allIds = state.dataMessages.centralCol.map(msg => msg.id);
				state.idLast = Math.max(...allIds);
			}
		},
		setOldMessages: (state, action: PayloadAction<Message[]>) => {
			const initialArr = state.dataMessages.centralCol;
			const arr = initialArr.concat(action.payload);
			const arrModified = arr.map(object => ({
				...object,
				date: object.date.replace(/ /g, 'T') + 'Z'
			}));
			arrModified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			state.dataMessages.centralCol = arrModified;
		},
		handleButton: (state, action: PayloadAction<{ column: string; buttonName: string; object: Message }>) => {
			const payload = action.payload;
			const filterData = (data: Message[]) => data.filter(
				(element) => JSON.stringify(element) !== JSON.stringify(payload.object)
			);

			if (payload.column === 'central') {
				if (payload.buttonName === 'left') {
					const newArr = [payload.object, ...state.dataMessages.leftCol].sort(
						(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
					);
					state.dataMessages.leftCol = newArr;
				}
				if (payload.buttonName === 'right') {
					const newArr = [payload.object, ...state.dataMessages.rightCol].sort(
						(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
					);
					state.dataMessages.rightCol = newArr;
				}
				state.dataMessages.centralCol = filterData(state.dataMessages.centralCol);
			}
			// аналогично для 'right' и 'left' (продолжи по образцу)
		},
		handleDeleteCard: (state, action: PayloadAction<{ column: string; object: Message }>) => {
			const payload = action.payload;
			const filterData = (data: Message[]) => data.filter(
				(element) => JSON.stringify(element) !== JSON.stringify(payload.object)
			);
			if (payload.column === 'central') {
				state.dataMessages.centralCol = filterData(state.dataMessages.centralCol);
			} else if (payload.column === 'right') {
				state.dataMessages.rightCol = filterData(state.dataMessages.rightCol);
			} else if (payload.column === 'left') {
				state.dataMessages.leftCol = filterData(state.dataMessages.leftCol);
			}
		},
		handleAddingFavourires: (state, action: PayloadAction<MessagesData>) => {
			state.dataMessages = action.payload;
		},
		onToggleReverse: (state, action: PayloadAction<boolean>) => {
			state.isReverse = action.payload;
		},
		updateLike: (state, action: PayloadAction<{ id: number; column: string; liked: boolean }>) => {
			const { id, column, liked } = action.payload;
			console.log(id, column, liked, 'id, column, liked')
			const colKey = `${column}Col` as keyof MessagesData;
			const messages = state.dataMessages[colKey];
			const index = messages.findIndex(msg => msg.id === id);
			if (index !== -1) {
				// Создаём новый массив с обновлённым сообщением
				const updatedMessage = { ...messages[index], liked };
				state.dataMessages[colKey] = [
					...messages.slice(0, index),
					updatedMessage,
					...messages.slice(index + 1)
				];
				console.log(updatedMessage, 'updatedMessage')
			}
		},
		moveMessageReducer: (state, action: PayloadAction<{ id: number; fromColumn: string; toColumn: string }>) => {
			const { id, fromColumn, toColumn } = action.payload;
			const fromKey = `${fromColumn}Col` as keyof MessagesData;
			const toKey = `${toColumn}Col` as keyof MessagesData;

			const fromMessages = state.dataMessages[fromKey];
			const index = fromMessages.findIndex(msg => msg.id === id);
			if (index === -1) return;

			const [movedMessage] = fromMessages.splice(index, 1);
			const toMessages = state.dataMessages[toKey];
			state.dataMessages[toKey] = [...toMessages, movedMessage].sort(
				(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
			);
		},
		deleteMessageReducer: (state, action: PayloadAction<{ id: number; column: string }>) => {
			const { id, column } = action.payload;
			console.log(id, column)
			const colKey = `${column}Col` as keyof MessagesData;
			const messages = state.dataMessages[colKey];
			state.dataMessages[colKey] = messages.filter(msg => msg.id !== id);
		},
	}
});

export const {
	setLastId,
	setIsModal,
	setDataMessages,
	setNewMessages,
	setOldMessages,
	handleButton,
	handleDeleteCard,
	handleAddingFavourires,
	setStateBtnFilterFavourites,
	setChoice,
	onToggleReverse,
	updateLike,
	moveMessageReducer,
	deleteMessageReducer
} = apiSlice.actions;

export default apiSlice.reducer;