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
                                     buyin_request INTEGER DEFAULT 0,
                                     buyin_approve INTEGER DEFAULT 0,
                                     total INTEGER DEFAULT 0,
                                     cashback INTEGER DEFAULT 0,
                                     cashback_list TEXT,
                                     fee INTEGER DEFAULT 0,
                                     amount INTEGER DEFAULT 0,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY(table_id) REFERENCES tables(id)
    FOREIGN KEY(member_id) REFERENCES members(id)
    );

CREATE TABLE IF NOT EXISTS buyin_requests (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             table_id INTEGER,
                                             member_id INTEGER,
                                             buyin INTEGER,
                                             status TEXT,
                                             updated_at DATETIME,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY(member_id) REFERENCES members(id)
                                             FOREIGN KEY(table_id) REFERENCES tables(id)
    );