-- schema.sql

CREATE TABLE IF NOT EXISTS members (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       name TEXT NOT NULL,
                                       username TEXT UNIQUE,
                                       password TEXT,
                                       avatar TEXT,
                                       role TEXT DEFAULT 'user',
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      member_id INTEGER,
                                      title TEXT,
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      FOREIGN KEY(member_id) REFERENCES members(id)
    );

CREATE TABLE IF NOT EXISTS games (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     table_id INTEGER,
                                     member_id INTEGER,
                                     buyin_request INTEGER,
                                     buyin_approve INTEGER,
                                     total INTEGER,
                                     cashback INTEGER,
                                     fee INTEGER,
                                     amount INTEGER,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY(table_id) REFERENCES tables(id)
    FOREIGN KEY(member_id) REFERENCES members(id)
    );

CREATE TABLE IF NOT EXISTS buyin_requests (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             game_id INTEGER,
                                             member_id INTEGER,
                                             buyin INTEGER,
                                             status TEXT,
                                             approved_at TEXT,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY(member_id) REFERENCES members(id)
                                             FOREIGN KEY(game_id) REFERENCES games(id)
    );