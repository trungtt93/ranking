const db = require('../database/database');
const common = require('../constants/common');
module.exports = {
  hasRequest: (game_id, member_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT * FROM buyin_requests
          WHERE table_id = ? AND member_id = ? AND status = ?
          LIMIT 1
      `;
      db.get(sql, [game_id, member_id, common.STATUS.WAITING], (err, row) => {
        if (err) reject(err);
        else resolve(!!row); // return true if found, false otherwise
      });
    });
  },
  request: (game_id, member_id) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO buyin_requests (table_id, member_id, buyin, status) VALUES (?, ?, ?, ?)`;
      db.run(sql, [game_id, member_id, 1, common.STATUS.WAITING], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  },
  update: (request_id, status) => {
    const sql = `
        UPDATE buyin_requests
        SET status = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
    db.run(sql, [status, request_id], function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes }); // how many rows updated
    });
  }
};