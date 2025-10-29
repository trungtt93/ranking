const db = require('../database/database');
module.exports = {
  find: (table_id, member_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT * FROM games WHERE table_id = ? AND member_id = ? LIMIT 1
      `;
      db.get(sql, [table_id, member_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  updateRequest: (table_id, member_id, action) => {
    return new Promise((resolve, reject) => {
      const updateRequestSql = `
          UPDATE buyin_requests
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE table_id = ? AND member_id = ? AND status = 'waiting'
      `;

      db.run(updateRequestSql, [action, table_id, member_id], function (err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          return resolve({ message: 'No pending request found', updated: 0 });
        }

        if (action == 'approved') {
          const updateGameSql = `
          UPDATE games
          SET buyin = buyin + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE table_id = ? AND member_id = ?
        `;
          db.run(updateGameSql, [table_id, member_id], function (err2) {
            if (err2) reject(err2);
            else resolve({ message: 'Buyin approved and game updated', updated: 1 });
          });
        } else {
          resolve({ message: `Buyin request ${action}`, updated: 1 });
        }
      });
    });
  },
  getMembersInGame: (tableId) => {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
        m.id AS member_id,
        m.name,
        m.username,
        m.avatar,
        m.role,
        g.id AS game_id,
        g.table_id,
        g.buyin,
        g.total,
        g.cashback,
        g.fee,
        g.fee_amount,
        g.prev_amount,
        g.amount,
        g.created_at AS game_created_at
      FROM games g
      JOIN members m ON g.member_id = m.id
      WHERE g.table_id = ?
    `;

      db.all(sql, [tableId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  updateCashback: (table_id, member_id, action) => {
    return new Promise((resolve, reject) => {
      const updateRequestSql = `
          UPDATE cashback_requests
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE table_id = ? AND member_id = ? AND status = 'waiting'
      `;

      db.run(updateRequestSql, [action, table_id, member_id], function (err) {
        if (err) return reject(err);

        if (this.changes === 0) {
          return resolve({ message: 'No pending request found', updated: 0 });
        }

        if (action === 'approved') {
          const getCashbackSql = `
              SELECT cashback
              FROM cashback_requests
              WHERE table_id = ? AND member_id = ?
              ORDER BY updated_at DESC
                  LIMIT 1
          `;

          db.get(getCashbackSql, [table_id, member_id], (err2, cashbackData) => {
            if (err2) return reject(err2);

            if (!cashbackData) {
              return resolve({ message: 'No cashback data found', updated: 0 });
            }

            const updateGameSql = `
            UPDATE games
            SET cashback = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE table_id = ? AND member_id = ?
          `;

            db.run(updateGameSql, [cashbackData.cashback, table_id, member_id], function (err3) {
              if (err3) return reject(err3);
              resolve({ message: 'Cashback approved and game updated', updated: 1 });
            });
          });
        } else {
          resolve({ message: `Cashback request ${action}`, updated: 1 });
        }
      });
    });
  },
  updateCashbackAndSeason: (tableId, memberId, seasonId, data) => {
    return new Promise((resolve, reject) => {
      const updateGameSql = `
      UPDATE games
      SET total = ?, fee_amount = ?, amount = ?, updated_at = CURRENT_TIMESTAMP
      WHERE table_id = ? AND member_id = ?
    `;

      db.run(updateGameSql, [data.total, data.feeValue, data.amount, tableId, memberId], function (err) {
        if (err) {
          console.error('err', err);
          return reject(err);
        }

        const updateSeasonSql = `
        UPDATE season_members
        SET amount = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE season_id = ? AND member_id = ?
      `;

        db.run(updateSeasonSql, [data.amount, seasonId, memberId], function (err2) {
          if (err2) {
            console.error('err', err2);
            return reject(err2);
          }

          resolve({ message: 'Success' });
        });
      });
    });
  },
  createFee: (data) => {
    return new Promise((resolve, reject) => {
      const sql = `
          INSERT INTO games (table_id, member_id, fee, prev_amount, created_at, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      db.run(sql, [data.table_id, data.member_id, data.fee, data.prev_amount], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  }

};