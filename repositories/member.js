const db = require('../database/database');
module.exports = {
  list: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM members', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM members WHERE username = ? AND password = ?', [username, password], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM members WHERE id = ? LIMIT 1`;
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null); // return null if not found
      });
    });
  },
};