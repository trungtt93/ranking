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

CREATE TABLE IF NOT EXISTS seasons (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       end_date DATETIME,
                                       legacy_fund INTEGER,
                                       title TEXT,
                                       status TEXT DEFAULT 'progress' -- progress | done
    );

CREATE TABLE IF NOT EXISTS payments (
                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                       member_id INTEGER,
                                       type TEXT,
                                       amount INTEGER,
                                       note TEXT,
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       FOREIGN KEY(member_id) REFERENCES members(id)
    );

CREATE TABLE IF NOT EXISTS season_members (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              season_id INTEGER NOT NULL,
                                              member_id INTEGER NOT NULL,
                                              buyin INTEGER DEFAULT 0,
                                              total INTEGER DEFAULT 0,
                                              fee INTEGER DEFAULT 0,
                                              amount INTEGER DEFAULT 0,
                                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                              FOREIGN KEY (season_id) REFERENCES seasons(id),
    FOREIGN KEY (member_id) REFERENCES members(id),
    UNIQUE (season_id, member_id)
    );

CREATE TABLE IF NOT EXISTS tables (
                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                      season_id INTEGER,
                                      member_id INTEGER,
                                      title TEXT,
                                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      FOREIGN KEY(member_id) REFERENCES members(id)
    );

CREATE TABLE IF NOT EXISTS games (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     table_id INTEGER,
                                     member_id INTEGER,
                                     buyin INTEGER DEFAULT 0,
                                     total INTEGER DEFAULT 0,
                                     cashback INTEGER DEFAULT 0,
                                     fee INTEGER DEFAULT 0,
                                     amount INTEGER DEFAULT 0,
                                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY(table_id) REFERENCES tables(id)
    FOREIGN KEY(member_id) REFERENCES members(id)
    );

CREATE TABLE IF NOT EXISTS buyin_requests (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              table_id INTEGER,
                                              member_id INTEGER,
                                              buyin INTEGER,
                                              status TEXT DEFAULT 'waiting', -- waiting | approved | rejected
                                              updated_at DATETIME,
                                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                              FOREIGN KEY(member_id) REFERENCES members(id)
    FOREIGN KEY(table_id) REFERENCES tables(id)
    );
CREATE TABLE IF NOT EXISTS cashback_requests (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 table_id INTEGER,
                                                 member_id INTEGER,
                                                 cashback INTEGER,
                                                 cashback_list TEXT,
                                                 status TEXT DEFAULT 'waiting', -- waiting | approved | rejected
                                                 updated_at DATETIME,
                                                 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 FOREIGN KEY(member_id) REFERENCES members(id)
    FOREIGN KEY(table_id) REFERENCES tables(id)
    );