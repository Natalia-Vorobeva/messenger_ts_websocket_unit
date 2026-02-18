const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // адрес клиента (Vite)
    methods: ["GET", "POST"]
  }
});

// Тестовые данные (в реальном проекте можно хранить в БД)
let messages = [
  {
    id: 1,
    content: "Привет! Это первое сообщение.",
    date: "2025-02-18 12:00:00",
    liked: false,
    author: "Система"
  },
  {
    id: 2,
    content: "Добро пожаловать в чат!",
    date: "2025-02-18 12:05:00",
    liked: true,
    author: "Пользователь"
  }
];

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  // Отправляем начальные сообщения (только центральная колонка для простоты)
  socket.emit('initialMessages', { messages });

  // Обработка запроса старых сообщений
  socket.on('loadOldMessages', ({ lastId }) => {
    const olderMessages = messages.filter(msg => msg.id < lastId);
    socket.emit('oldMessages', { messages: olderMessages });
  });

  // Обработка нового сообщения (если клиент может отправлять)
  socket.on('sendMessage', ({ text, author }) => {
    const newMessage = {
      id: messages.length + 1,
      content: text,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      liked: false,
      author: author || 'Аноним'
    };
    messages.push(newMessage);
    // Рассылаем всем клиентам
    io.emit('newMessage', { message: newMessage });
  });

  socket.on('disconnect', () => {
    console.log('Клиент отключился');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});