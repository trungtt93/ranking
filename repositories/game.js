const db = require('../database/database');
module.exports = {
  findOrCreate: (table_id, member_id) => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT * FROM games WHERE table_id = ? AND member_id = ? LIMIT 1
      `;
      db.get(sql, [table_id, member_id], (err, row) => {
        if (row) {
          resolve(row);
        } else {
          const insertSql = `
            INSERT INTO games (table_id, member_id)
            VALUES (?, ?)
          `;
          db.run(insertSql, [table_id, member_id], function (err2) {
            if (err2) return reject(err2);
            db.get(`SELECT * FROM games WHERE id = ?`, [this.lastID], (err3, newRow) => {
              if (err3) reject(err3);
              else resolve(newRow);
            });
          });
        }
      });
    });
  },
  updateRequest: (id, request) => {
    return new Promise((resolve, reject) => {
      const sql = `
          UPDATE games
          SET buyin_request = ?
          WHERE id = ?
      `;
      db.run(sql, [request, id], function (err) {
        if (err) reject(err);
        else resolve({changes: this.changes}); // number of rows updated
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
  }

};