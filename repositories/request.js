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
              br.buyin AS amount,
              br.status,
              'buyin' AS type,
              NULL AS cashback_list,
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

          UNION ALL

          SELECT
              cr.id AS request_id,
              m.name AS member_name,
              m.id AS member_id,
              m.avatar,
              cr.table_id,
              cr.cashback AS amount,
              cr.status,
              'cashback' AS type,
              cr.cashback_list AS cashback_list,
              strftime('%H:%M', cr.updated_at) AS updated_at,
              strftime('%H:%M', cr.created_at) AS created_at,
              CASE
                  WHEN cr.status = 'waiting' THEN cr.created_at
                  ELSE cr.updated_at
                  END AS timeline_time
          FROM cashback_requests cr
                   JOIN members m ON m.id = cr.member_id
          WHERE cr.table_id = ?
            AND cr.status IN ('waiting', 'approved', 'rejected')

          ORDER BY timeline_time DESC
      `;

      db.all(sql, [tableId, tableId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  cashback: (list, total, member_id, table_id) => {
    return new Promise((resolve, reject) => {
      const cashback = total;
      const cashback_list = JSON.stringify(list);

      db.serialize(() => {
        const checkSql = `
        SELECT id FROM cashback_requests
        WHERE member_id = ? AND table_id = ? AND status = 'waiting'
      `;

        db.get(checkSql, [member_id, table_id], (err, row) => {
          if (err) return reject(err);

          if (row) {
            const updateSql = `
            UPDATE cashback_requests
            SET cashback = ?, cashback_list = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `;
            db.run(updateSql, [cashback, cashback_list, row.id], function (err2) {
              if (err2) reject(err2);
              else resolve({ id: row.id, action: 'updated' });
            });
          } else {

            const insertSql = `
            INSERT INTO cashback_requests (table_id, member_id, cashback, cashback_list, status)
            VALUES (?, ?, ?, ?, 'waiting')
          `;
            db.run(insertSql, [table_id, member_id, cashback, cashback_list], function (err3) {
              if (err3) reject(err3);
              else resolve({ id: this.lastID, action: 'inserted' });
            });
          }
        });
      });
    });
  }
};