
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	}
});

let messages = { leftCol: [], centralCol: [], rightCol: [] };

async function startServer() {
	try {
		await db.initializeDatabase();
		messages = await db.loadMessages();
		console.log('Сообщения загружены из БД');

		server.listen(PORT, () => {
			console.log(`Сервер запущен на http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error('Ошибка инициализации:', err);
		process.exit(1);
	}
}

io.on('connection', (socket) => {
	socket.emit('initialMessages', messages);

	socket.on('loadOldMessages', ({ column, lastId }) => {
		console.log(`Запрос старых сообщений для колонки ${column} с lastId=${lastId}`);
		const colMessages = messages[column + 'Col'] || [];
		const older = colMessages.filter(msg => msg.id < lastId);
		socket.emit('oldMessages', { column, messages: older });
	});

	socket.on('sendMessage', async ({ column, text, author }) => {
		try {
			const newId = Date.now(); // временный ID, можно заменить на автоинкремент БД
			const newMessage = {
				id: newId,
				content: text,
				date: new Date().toISOString().replace('T', ' ').substring(0, 19),
				liked: false,
				author: author || 'Аноним'
			};
			await db.saveMessage(newMessage, column + 'Col');
			messages[column + 'Col'].push(newMessage);
			io.emit('newMessage', { column, message: newMessage });
		} catch (err) {
			console.error('Ошибка сохранения сообщения в БД:', err);
		}
	});

	socket.on('toggleLike', async ({ id, column }) => {
		try {
			const colKey = column + 'Col';
			const message = messages[colKey].find(msg => msg.id === id);
			if (!message) return;

			message.liked = !message.liked;
			await db.updateMessageLike(id, colKey, message.liked);
			io.emit('likeUpdated', { id, column, liked: message.liked });
		} catch (err) {
			console.error('Ошибка обновления лайка в БД:', err);
		}
	});

	socket.on('moveMessage', async ({ id, fromColumn, toColumn }) => {
		try {
			const fromKey = fromColumn + 'Col';
			const toKey = toColumn + 'Col';

			const fromMessages = messages[fromKey];
			const index = fromMessages.findIndex(msg => msg.id === id);
			if (index === -1) return;

			const [movedMessage] = fromMessages.splice(index, 1);
			messages[toKey].push(movedMessage);

			await db.moveMessage(id, fromKey, toKey);
			io.emit('messageMoved', { id, fromColumn, toColumn });
		} catch (err) {
			console.error('Ошибка перемещения сообщения в БД:', err);
		}
	});

	socket.on('deleteMessage', async ({ id, column }) => {
		try {
			const colKey = column + 'Col';
			const colMessages = messages[colKey];
			const index = colMessages.findIndex(msg => msg.id === id);
			if (index === -1) return;

			colMessages.splice(index, 1);

			await db.deleteMessage(id, colKey);
			io.emit('messageDeleted', { id, column });
		} catch (err) {
			console.error('Ошибка удаления сообщения из БД:', err);
		}
	});

	socket.on('disconnect', () => {
		console.log('Клиент отключился');
	});
});

const PORT = 3000;

startServer();