const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'messages.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      liked INTEGER DEFAULT 0,
      author TEXT NOT NULL,
      column TEXT NOT NULL
    )
  `);

  const row = await get('SELECT COUNT(*) as count FROM messages');
  if (row.count === 0) {
    const initialMessages = [
      [1, 'Привет из левой колонки!', '2025-02-18 10:00:00', 0, 'Левый автор', 'leftCol'],
      [2, 'Ещё одно левое сообщение', '2025-02-18 10:05:00', 1, 'Автор 2', 'leftCol'],
      [3, 'Центральное сообщение 1', '2025-02-18 10:10:00', 0, 'Центр', 'centralCol'],
      [4, 'Центральное сообщение 2', '2025-02-18 10:15:00', 1, 'Пользователь', 'centralCol'],
      [5, 'Правое сообщение 1', '2025-02-18 10:20:00', 0, 'Правый', 'rightCol'],
      [6, 'Правое сообщение 2', '2025-02-18 10:25:00', 1, 'Ещё автор', 'rightCol']
    ];
    const stmt = db.prepare('INSERT INTO messages (id, content, date, liked, author, column) VALUES (?, ?, ?, ?, ?, ?)');
    for (const msg of initialMessages) {
      await new Promise((resolve, reject) => {
        stmt.run(msg, function(err) {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    stmt.finalize();    
  }
}

async function loadMessages() {
  const rows = await all('SELECT * FROM messages');
  const messages = {
    leftCol: rows.filter(row => row.column === 'leftCol').map(removeColumnField),
    centralCol: rows.filter(row => row.column === 'centralCol').map(removeColumnField),
    rightCol: rows.filter(row => row.column === 'rightCol').map(removeColumnField)
  };
  return messages;
}

function removeColumnField(msg) {
  const { column, ...rest } = msg;
  return rest;
}

async function saveMessage(message, column) {
  const { id, content, date, liked, author } = message;
  await run(
    'INSERT OR REPLACE INTO messages (id, content, date, liked, author, column) VALUES (?, ?, ?, ?, ?, ?)',
    [id, content, date, liked ? 1 : 0, author, column]
  );
}

async function deleteMessage(id, column) {
  await run('DELETE FROM messages WHERE id = ? AND column = ?', [id, column]);
}

async function updateMessageLike(id, column, liked) {
  await run('UPDATE messages SET liked = ? WHERE id = ? AND column = ?', [liked ? 1 : 0, id, column]);
}

async function moveMessage(id, fromColumn, toColumn) {
  await run('UPDATE messages SET column = ? WHERE id = ? AND column = ?', [toColumn, id, fromColumn]);
}

module.exports = {
  initializeDatabase,
  loadMessages,
  saveMessage,
  deleteMessage,
  updateMessageLike,
  moveMessage
};