export interface Message {
	id: number;
  content: string;
  date: string; 
  liked: boolean;
  author: string;
  attachments?: Array<{ url: string }>;
}

export interface MessagesData {
	leftCol: Message[];
	centralCol: Message[];
	rightCol: Message[];
}

export interface SelectedCard {
	object: Message;
	column: string;
	time: string;
}

export interface AppState {
	idLast: number | null;
	isModal: boolean;
	dataMessages: MessagesData;
	btnFilterFavourites: boolean;
	isReverse: boolean;
	isSearched: boolean;
	choice: SelectedCard | null; 
}

export interface ColumnProps {
	searchQuery?: string;
	searchResults?: Message[];
}

export interface ServerMessage {
	id: number;
  content: string;
  date: string;
  liked: boolean;
  author: string;
}

export interface InitialMessagesEvent {
	messages: ServerMessage[];
}

export interface NewMessageEvent {
	message: ServerMessage;
}

export interface OldMessagesEvent {
	messages: ServerMessage[];
}

export interface CardProps {
	data: Message;
  time: string;
  column: 'left' | 'central' | 'right'; 
  className: string;
  handleDelCard: (data: Message) => void;
  handleFavourites: (data: Message) => void;
  onMoveCard: (buttonName: string, data: Message, column: string) => void;
}