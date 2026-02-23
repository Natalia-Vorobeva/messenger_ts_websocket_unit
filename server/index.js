const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL || 'http://localhost:5173',
		methods: ['GET', 'POST']
	}
});

// Подключение к PostgreSQL
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false } // обязательно для Render
});

let messages = { leftCol: [], centralCol: [], rightCol: [] };

// Инициализация таблицы и загрузка данных
async function initDB() {
	await pool.query(`
  CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  liked BOOLEAN DEFAULT false,
  author TEXT NOT NULL,
  col_name TEXT NOT NULL
)
`);
	console.log('Table "messages" is ready');

	const countRes = await pool.query('SELECT COUNT(*) FROM messages');
	if (parseInt(countRes.rows[0].count) === 0) {
		// вставляем несколько тестовых сообщений
		const testMessages = [
			[1, 'Привет из левой колонки!', '2025-02-18 10:00:00', false, 'Левый автор', 'leftCol'],
			[2, 'Ещё одно левое сообщение', '2025-02-18 10:05:00', true, 'Автор 2', 'leftCol'],
			[3, 'Центральное сообщение 1', '2025-02-18 10:10:00', false, 'Центр', 'centralCol'],
			[4, 'Центральное сообщение 2', '2025-02-18 10:15:00', true, 'Пользователь', 'centralCol'],
			[5, 'Правое сообщение 1', '2025-02-18 10:20:00', false, 'Правый', 'rightCol'],
			[6, 'Правое сообщение 2', '2025-02-18 10:25:00', true, 'Ещё автор', 'rightCol']
		];
		for (const msg of testMessages) {
			await pool.query(
				'INSERT INTO messages (id, content, date, liked, author, col_name) VALUES ($1, $2, $3, $4, $5, $6)',
				msg
			);
		}
		console.log('Test messages inserted');
	}

	// Загружаем все сообщения
	const res = await pool.query('SELECT * FROM messages');
	const rows = res.rows;
	messages = {
		leftCol: rows.filter(r => r.col_name === 'leftCol').map(removeColumnField),
		centralCol: rows.filter(r => r.col_name === 'centralCol').map(removeColumnField),
		rightCol: rows.filter(r => r.col_name === 'rightCol').map(removeColumnField)
	};
	console.log('Messages loaded from DB');
}

function removeColumnField(msg) {
	const { col_name, ...rest } = msg;
	return rest;
}

app.get('/health', (req, res) => res.send('OK'));

io.on('connection', (socket) => {
	socket.emit('initialMessages', messages);

	socket.on('loadOldMessages', async ({ column, lastId }) => {
		console.log(`loadOldMessages: column=${column}, lastId=${lastId}`);
		const colKey = column + 'Col';
		const colMessages = messages[colKey] || [];
		const older = colMessages.filter(msg => msg.id < lastId);
		socket.emit('oldMessages', { column, messages: older });
	});

	socket.on('sendMessage', async ({ column, text, author }) => {
		try {
			const result = await pool.query(
				'INSERT INTO messages (content, date, liked, author, col_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
				[text, new Date().toISOString().replace('T', ' ').substring(0, 19), false, author || 'Аноним', column + 'Col']
			);
			const newId = result.rows[0].id;
			const newMessage = {
				id: newId,
				content: text,
				date: new Date().toISOString().replace('T', ' ').substring(0, 19),
				liked: false,
				author: author || 'Аноним'
			};
			messages[column + 'Col'].push(newMessage);
			io.emit('newMessage', { column, message: newMessage });
		} catch (err) {
			console.error('Error saving message:', err);
		}
	});

	socket.on('toggleLike', async ({ id, column }) => {
		const colKey = column + 'Col';
		const message = messages[colKey].find(msg => msg.id === id);
		if (!message) return;

		message.liked = !message.liked;
		try {
			await pool.query('UPDATE messages SET liked = $1 WHERE id = $2 AND col_name = $3', [message.liked, id, colKey]);
			io.emit('likeUpdated', { id, column, liked: message.liked });
		} catch (err) {
			console.error('Error updating like:', err);
		}
	});

	socket.on('moveMessage', async ({ id, fromColumn, toColumn }) => {
  const fromKey = fromColumn + 'Col';
  const toKey = toColumn + 'Col';

  const fromMessages = messages[fromKey];
  const index = fromMessages.findIndex(msg => msg.id === id);
  if (index === -1) return;

  const [movedMessage] = fromMessages.splice(index, 1);
  messages[toKey].push(movedMessage);

  try {
    await pool.query('UPDATE messages SET col_name = $1 WHERE id = $2 AND col_name = $3', [toKey, id, fromKey]);
    io.emit('messageMoved', { id, fromColumn, toColumn });
  } catch (err) {
    console.error('Error moving message:', err);
  }
});

	socket.on('deleteMessage', async ({ id, column }) => {
  const colKey = column + 'Col';
  const colMessages = messages[colKey];
  const index = colMessages.findIndex(msg => msg.id === id);
  if (index === -1) return;

  colMessages.splice(index, 1);

  try {
    await pool.query('DELETE FROM messages WHERE id = $1 AND col_name = $2', [id, colKey]);
    io.emit('messageDeleted', { id, column });
  } catch (err) {
    console.error('Error deleting message:', err);
  }
});

	socket.on('disconnect', () => {
		console.log('Client disconnected');
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
	try {
		await initDB();
		console.log(`Server running on port ${PORT}`);
	} catch (err) {
		console.error('Failed to initialize database:', err);
		process.exit(1);
	}
});


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const db = require('./db');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// let messages = { leftCol: [], centralCol: [], rightCol: [] };

// // Инициализация БД и загрузка данных перед запуском сервера
// async function startServer() {
//   try {
//     await db.initializeDatabase();
//     messages = await db.loadMessages();
//     console.log('Сообщения загружены из БД');

//     server.listen(PORT, () => {
//       console.log(`Сервер запущен на http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     console.error('Ошибка инициализации:', err);
//     process.exit(1);
//   }
// }

// io.on('connection', (socket) => {
//   // Отправляем текущие сообщения новому клиенту
//   socket.emit('initialMessages', messages);

//   socket.on('loadOldMessages', ({ column, lastId }) => {
//     console.log(`Запрос старых сообщений для колонки ${column} с lastId=${lastId}`);
//     const colMessages = messages[column + 'Col'] || [];
//     const older = colMessages.filter(msg => msg.id < lastId);
//     socket.emit('oldMessages', { column, messages: older });
//   });

//   socket.on('sendMessage', async ({ column, text, author }) => {
//     try {
//       const newId = Date.now(); // временный ID, можно заменить на автоинкремент БД
//       const newMessage = {
//         id: newId,
//         content: text,
//         date: new Date().toISOString().replace('T', ' ').substring(0, 19),
//         liked: false,
//         author: author || 'Аноним'
//       };
//       await db.saveMessage(newMessage, column + 'Col');
//       messages[column + 'Col'].push(newMessage);
//       io.emit('newMessage', { column, message: newMessage });
//     } catch (err) {
//       console.error('Ошибка сохранения сообщения в БД:', err);
//     }
//   });

//   socket.on('toggleLike', async ({ id, column }) => {
//     try {
//       const colKey = column + 'Col';
//       const message = messages[colKey].find(msg => msg.id === id);
//       if (!message) return;

//       message.liked = !message.liked;
//       await db.updateMessageLike(id, colKey, message.liked);
//       io.emit('likeUpdated', { id, column, liked: message.liked });
//     } catch (err) {
//       console.error('Ошибка обновления лайка в БД:', err);
//     }
//   });

//   socket.on('moveMessage', async ({ id, fromColumn, toColumn }) => {
//     try {
//       const fromKey = fromColumn + 'Col';
//       const toKey = toColumn + 'Col';

//       const fromMessages = messages[fromKey];
//       const index = fromMessages.findIndex(msg => msg.id === id);
//       if (index === -1) return;

//       const [movedMessage] = fromMessages.splice(index, 1);
//       messages[toKey].push(movedMessage);

//       await db.moveMessage(id, fromKey, toKey);
//       io.emit('messageMoved', { id, fromColumn, toColumn });
//     } catch (err) {
//       console.error('Ошибка перемещения сообщения в БД:', err);
//     }
//   });

//   socket.on('deleteMessage', async ({ id, column }) => {
//     try {
//       const colKey = column + 'Col';
//       const colMessages = messages[colKey];
//       const index = colMessages.findIndex(msg => msg.id === id);
//       if (index === -1) return;

//       colMessages.splice(index, 1);

//       await db.deleteMessage(id, colKey);
//       io.emit('messageDeleted', { id, column });
//     } catch (err) {
//       console.error('Ошибка удаления сообщения из БД:', err);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('Клиент отключился');
//   });
// });

// const PORT = 3000;

// // Запускаем сервер только после инициализации БД
// startServer();