const db = require('../database/database');
module.exports = {
  create: (seasonId, memberId, title) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO tables (season_id, member_id, title) VALUES (?, ?, ?)`;
      db.run(sql, [seasonId, memberId, title], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, member_id: memberId, title });
      });
    });
  },
  list: (seasonId) => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT
              t.id AS table_id,
              t.title,
              t.created_at AS created_at,
              m.id AS member_id,
              m.name AS member_name,
              m.avatar,
              m.role,
              CASE
                  WHEN date(t.created_at) = date('now', 'localtime') THEN 1
              ELSE 0
          END AS is_today
          FROM tables t
                   JOIN members m ON t.member_id = m.id
              WHERE t.season_id = ?
          ORDER BY t.id DESC
      `;
      db.all(sql, [seasonId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT
              t.id AS table_id,
              t.title,
              t.season_id,
              t.created_at AS created_at,
              m.id AS member_id,
              m.name AS member_name,
              m.avatar,
              CASE
                  WHEN date(t.created_at) = date('now', 'localtime') THEN 1
              ELSE 0
          END AS is_today
          FROM tables t
                   JOIN members m ON t.member_id = m.id
          WHERE t.id = ?
              LIMIT 1
      `;
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row || null); // return null if not found
      });
    });
  },
};