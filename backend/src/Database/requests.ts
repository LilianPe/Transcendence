import sqlite3 from 'sqlite3';
import path from 'path';

const { Database } = sqlite3;

function openDatabase() {
	const db = new Database(path.join('db.sqlite'), (err) => {
		if (err) {
			console.error('Could not connect to SQLite database:', err.message);
		} else {
			console.log('Connected to SQLite database.');
		}
	});
	return db;
}

export function createUser(mail: string, password: string, nickname: string) {

	const db = openDatabase();
    db.run(`INSERT INTO user (mail, password, nickname) VALUES (?, ?, ?)`, [mail, password, nickname], function(err) {
        if (err) {
            console.error('Error inserting user:', err.message);
        } else {
            console.log(`User ${nickname} inserted with ID ${this.lastID}`);
        }
		db.close();
    });
}

interface UserRow {
	password: string;
}

export function checkUserID(mail: string, password: string, callback: (isValid: boolean) => void) {
	
    const db = openDatabase();
    db.run(
        `CREATE TABLE IF NOT EXISTS user (
            mail TEXT NOT NULL,
            password TEXT NOT NULL,
            nickname TEXT NOT NULL
        )`,
        (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
                callback(false);
                db.close();
                return;
            }
            db.get(
                `SELECT password FROM user WHERE mail = ?`,
                [mail],
                (err, row: UserRow) => {
                    if (err) {
                        console.error('Error querying user:', err.message);
                        callback(false);
                        db.close();
                        return;
                    }

                    if (!row) {
                        console.log('User not found.');
                        callback(false);
                    } else if (row.password === password) {
                        console.log('Login successful.');
                        callback(true);
                    } else {
                        console.log('Invalid password.');
                        callback(false);
                    }

                    db.close();
                }
            );
        }
    );
}

export function checkUserMAIL(mail: string, callback: (isValid: boolean) => void) {
	
    const db = openDatabase();
    db.get('SELECT COUNT(*) AS count FROM user WHERE mail = ?', [mail], (err, row: UserRow) => {
        if (err) {
            console.error('Error querying user:', err.message);
            callback(false);
            db.close();
            return;
        }
        if (!row) {
            callback(false);
            db.close();
            return;
        }
        else {
            callback(true);
            db.close();
            return
        }
        db.close();
    });
}