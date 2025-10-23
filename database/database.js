const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const db = new sqlite.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) return console.error(err.message);
  console.log("Connected to SQLite database.");
});
const schema = fs.readFileSync(path.join(__dirname, 'tables.sql'), 'utf8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Error running SQL schema:', err.message);
  } else {
    console.log('Database schema loaded successfully.');
  }
});

module.exports = db;