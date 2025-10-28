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
  request: (table_id, member_id) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const insertGameSql = `
        INSERT INTO games (table_id, member_id, buyin, total, cashback, fee, amount)
        SELECT ?, ?, 0, 0, 0, 0, 0
        WHERE NOT EXISTS (
          SELECT 1 FROM games WHERE table_id = ? AND member_id = ?
        )
      `;

        db.run(insertGameSql, [table_id, member_id, table_id, member_id], function (err) {
          if (err) return reject(err);

          const insertRequestSql = `
          INSERT INTO buyin_requests (table_id, member_id, buyin, status)
          VALUES (?, ?, ?, ?)
        `;

          db.run(insertRequestSql, [table_id, member_id, 1, 'waiting'], function (err2) {
            if (err2) reject(err2);
            else resolve({ id: this.lastID });
          });
        });
      });
    });
  },
  getTimelineByTable: (tableId) => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT
              br.id AS request_id,
              m.name AS member_name,
              m.id AS member_id,
              m.avatar,
              br.table_id,
              br.buyin,
              br.status,
              strftime('%H:%M', br.updated_at) AS updated_at,
              strftime('%H:%M', br.created_at) AS created_at,
              CASE
                  WHEN br.status = 'waiting' THEN br.created_at
                  ELSE br.updated_at
                  END AS timeline_time
          FROM buyin_requests br
                   JOIN members m ON m.id = br.member_id
          WHERE br.table_id = ?
            AND br.status IN ('waiting', 'approved', 'rejected')
          ORDER BY timeline_time DESC
      `;

      db.all(sql, [tableId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
};