const db = require('../database/database');
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  season: (seasonId = null) => {
    return new Promise((resolve, reject) => {
      let sql;
      let params = [];

      if (seasonId) {
        // ✅ Nếu có id
        sql = `SELECT * FROM seasons WHERE id = ? LIMIT 1`;
        params = [seasonId];
      } else {
        // ✅ Nếu không có id -> lấy season mới nhất
        sql = `SELECT * FROM seasons ORDER BY id DESC LIMIT 1`;
      }

      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  },
  list: () => {
    return new Promise((resolve, reject) => {
      const sql = `
          SELECT
              id,
              title,
              strftime('%Y-%m-%d', start_date) AS start_date,
              strftime('%Y-%m-%d', end_date) AS end_date,
              legacy_fund,
              status
          FROM seasons
          ORDER BY id DESC
      `;
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  create: ( title ) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get(`SELECT legacy_fund FROM seasons ORDER BY id DESC LIMIT 1`, (err, row) => {
          if (err) return reject(err);
          const legacyFund = row ? row.legacy_fund : 0;

          db.run(
            `UPDATE seasons
             SET status = 'done', end_date = CURRENT_TIMESTAMP
             WHERE status = 'progress'`,
            (err) => {
              if (err) return reject(err);

              const sql = `
                  INSERT INTO seasons (title, legacy_fund)
                  VALUES (?, ?)
              `;
              db.run(sql, [title, legacyFund], function (err) {
                if (err) return reject(err);
                const newSeasonId = this.lastID;

                db.all('SELECT id FROM members', (err, members) => {
                  if (err) return reject(err);

                  if (members.length === 0) {
                    return resolve(newSeasonId);
                  }
                  const shuffled = shuffleArray(members);
                  const stmt = db.prepare(`
                    INSERT OR IGNORE INTO season_members (season_id, member_id)
                    VALUES (?, ?)
                  `);

                  shuffled.forEach((m) => stmt.run(newSeasonId, m.id));

                  stmt.finalize((err) => {
                    if (err) return reject(err);
                    resolve(newSeasonId);
                  });
                });
              });
            }
          );
        });
      });
    });
  },
  seasonMembers: (seasonId = null) => {
    return new Promise((resolve, reject) => {
      let sql;
      let params = [];

      if (seasonId) {
        sql = `
          SELECT sm.*, m.name, m.username, m.avatar, m.role
          FROM season_members sm
          JOIN members m ON sm.member_id = m.id
          WHERE sm.season_id = ?
          ORDER BY sm.amount ASC, sm.id ASC
        `;
        params = [seasonId];
      } else {
        sql = `
          SELECT sm.*, m.name, m.username, m.avatar, m.role
          FROM season_members sm
          JOIN members m ON sm.member_id = m.id
          WHERE sm.season_id = (
            SELECT id FROM seasons ORDER BY id DESC LIMIT 1
          )
          ORDER BY sm.amount ASC, sm.id ASC
        `;
      }

      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
  close: (seasonId) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE seasons
        SET status = 'done',
            end_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(sql, [seasonId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  },
};