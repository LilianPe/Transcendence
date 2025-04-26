import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import path from 'path';

const db = new Database(path.join('db.sqlite'), (err) => {
	if (err) {
		console.error('Could not connect to SQLite database:', err.message);
	} else {
		console.log('Connected to SQLite database.');
	}
});

db.run(`CREATE TABLE IF NOT EXISTS user (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
    mail TEXT NOT NULL,
    pseudo TEXT,
    avatar TEXT,
    victories INTEGER DEFAULT 0,
    defeats INTEGER DEFAULT 0
)`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table created or already exists.');
    }
});

db.run(`CREATE TABLE IF NOT EXISTS blocked_relations (
	user_id INTEGER NOT NULL,
	blocked_id INTEGER NOT NULL,
	FOREIGN KEY(user_id) REFERENCES user(id),
	FOREIGN KEY(blocked_id) REFERENCES user(id)
)`, (err) => {
	if (err) {
		console.error("Error creating blocked_relations table:", err.message);
	} else {
		console.log("blocked_relations table created or already exists.");
	}
});


