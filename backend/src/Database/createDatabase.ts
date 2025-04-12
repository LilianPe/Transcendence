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
    mail TEXT NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table created or already exists.');
    }
});
