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
		setDataMessages: (state, action: PayloadAction<Message[]>) => {
			const arrModified = action.payload.map(object => ({
				...object,
				date: object.date.replace(/ /g, 'T') + 'Z'
			}));
			arrModified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
			const ids = arrModified.map(object => object.id);
			state.idLast = Math.max(...ids);
			state.dataMessages.centralCol = arrModified;
		},
		setNewMessages: (state, action: PayloadAction<{ centralCol: Message[] }>) => {
			const currentCentralCol = state.dataMessages.centralCol;
			const newCentralCol = action.payload.centralCol;
			if (JSON.stringify(currentCentralCol) !== JSON.stringify(newCentralCol)) {
				state.dataMessages.centralCol = newCentralCol;
				if (newCentralCol.length > 0) {
					const ids = newCentralCol.map(msg => msg.id);
					state.idLast = Math.max(...ids);
				}
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
		}
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
	onToggleReverse
} = apiSlice.actions;

export default apiSlice.reducer;