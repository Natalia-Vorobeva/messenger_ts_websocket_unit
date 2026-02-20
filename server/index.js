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

// Загружаем данные из БД при старте
db.loadMessages((err, data) => {
  if (err) {
    console.error('Ошибка загрузки сообщений из БД:', err);
  } else {
    messages = data;
    console.log('Сообщения загружены из БД');
  }
});

io.on('connection', (socket) => {
  socket.emit('initialMessages', messages);

  socket.on('loadOldMessages', ({ column, lastId }) => {
    console.log(`Запрос старых сообщений для колонки ${column} с lastId=${lastId}`);
    const colMessages = messages[column + 'Col'] || [];
    const older = colMessages.filter(msg => msg.id < lastId);
    socket.emit('oldMessages', { column, messages: older });
  });

  socket.on('sendMessage', ({ column, text, author }) => {
    const newId = Date.now(); // временный ID, в реальности лучше использовать автоинкремент
    const newMessage = {
      id: newId,
      content: text,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      liked: false,
      author: author || 'Аноним'
    };
    db.saveMessage(newMessage, column + 'Col', (err) => {
      if (err) {
        console.error('Ошибка сохранения сообщения в БД:', err);
        return;
      }
      messages[column + 'Col'].push(newMessage);
      io.emit('newMessage', { column, message: newMessage });
    });
  });

  socket.on('toggleLike', ({ id, column }) => {
    const colKey = column + 'Col';
    const message = messages[colKey].find(msg => msg.id === id);
    if (!message) return;

    message.liked = !message.liked;
    db.updateMessageLike(id, colKey, message.liked, (err) => {
      if (err) console.error('Ошибка обновления лайка в БД:', err);
      io.emit('likeUpdated', { id, column, liked: message.liked });
    });
  });

  socket.on('moveMessage', ({ id, fromColumn, toColumn }) => {
    const fromKey = fromColumn + 'Col';
    const toKey = toColumn + 'Col';

    const fromMessages = messages[fromKey];
    const index = fromMessages.findIndex(msg => msg.id === id);
    if (index === -1) return;

    const [movedMessage] = fromMessages.splice(index, 1);
    messages[toKey].push(movedMessage);

    db.moveMessage(id, fromKey, toKey, (err) => {
      if (err) console.error('Ошибка перемещения сообщения в БД:', err);
      io.emit('messageMoved', { id, fromColumn, toColumn });
    });
  });

  socket.on('deleteMessage', ({ id, column }) => {
    const colKey = column + 'Col';
    const colMessages = messages[colKey];
    const index = colMessages.findIndex(msg => msg.id === id);
    if (index === -1) return;

    colMessages.splice(index, 1);

    db.deleteMessage(id, colKey, (err) => {
      if (err) console.error('Ошибка удаления сообщения из БД:', err);
      io.emit('messageDeleted', { id, column });
    });
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключился');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});