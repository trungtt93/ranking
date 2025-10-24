const db = require('../database/database');
module.exports = {
  getAllMembers: () => {
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
  }
};