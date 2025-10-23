const db = require('../database/database');
module.exports = {
  getAllMembers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM members', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};