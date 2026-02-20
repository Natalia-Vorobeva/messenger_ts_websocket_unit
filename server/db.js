const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'messages.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
  } else {
    console.log('Подключено к SQLite базе данных.');
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        liked INTEGER DEFAULT 0,
        author TEXT NOT NULL,
        column TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        console.error('Ошибка создания таблицы:', err.message);
      } else {
        console.log('Таблица messages готова.');
        // Проверяем, есть ли данные, если нет – добавляем начальные
        db.get('SELECT COUNT(*) as count FROM messages', (err, row) => {
          if (err) {
            console.error(err);
          } else if (row.count === 0) {
            const initialMessages = [
              [1, 'Привет из левой колонки!', '2025-02-18 10:00:00', 0, 'Левый автор', 'leftCol'],
              [2, 'Ещё одно левое сообщение', '2025-02-18 10:05:00', 1, 'Автор 2', 'leftCol'],
              [3, 'Центральное сообщение 1', '2025-02-18 10:10:00', 0, 'Центр', 'centralCol'],
              [4, 'Центральное сообщение 2', '2025-02-18 10:15:00', 1, 'Пользователь', 'centralCol'],
              [5, 'Правое сообщение 1', '2025-02-18 10:20:00', 0, 'Правый', 'rightCol'],
              [6, 'Правое сообщение 2', '2025-02-18 10:25:00', 1, 'Ещё автор', 'rightCol']
            ];
            const stmt = db.prepare('INSERT INTO messages (id, content, date, liked, author, column) VALUES (?, ?, ?, ?, ?, ?)');
            initialMessages.forEach(msg => {
              stmt.run(msg, (err) => {
                if (err) console.error(err);
              });
            });
            stmt.finalize();
            console.log('Начальные данные добавлены.');
          }
        });
      }
    });
  }
});

function loadMessages(callback) {
  db.all('SELECT * FROM messages', (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      const messages = {
        leftCol: rows.filter(row => row.column === 'leftCol').map(removeColumnField),
        centralCol: rows.filter(row => row.column === 'centralCol').map(removeColumnField),
        rightCol: rows.filter(row => row.column === 'rightCol').map(removeColumnField)
      };
      callback(null, messages);
    }
  });
}

function removeColumnField(msg) {
  const { column, ...rest } = msg;
  return rest;
}

function saveMessage(message, column, callback) {
  const { id, content, date, liked, author } = message;
  db.run(
    'INSERT OR REPLACE INTO messages (id, content, date, liked, author, column) VALUES (?, ?, ?, ?, ?, ?)',
    [id, content, date, liked ? 1 : 0, author, column],
    callback
  );
}

function deleteMessage(id, column, callback) {
  db.run('DELETE FROM messages WHERE id = ? AND column = ?', [id, column], callback);
}

function updateMessageLike(id, column, liked, callback) {
  db.run('UPDATE messages SET liked = ? WHERE id = ? AND column = ?', [liked ? 1 : 0, id, column], callback);
}

function moveMessage(id, fromColumn, toColumn, callback) {
  db.run('UPDATE messages SET column = ? WHERE id = ? AND column = ?', [toColumn, id, fromColumn], callback);
}

module.exports = { loadMessages, saveMessage, deleteMessage, updateMessageLike, moveMessage };