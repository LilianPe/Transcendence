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

export function createUser(mail: string, password: string, pseudo: string) {

	const db = openDatabase();
    db.run(`INSERT INTO user (mail, password, pseudo) VALUES (?, ?, ?)`, [mail, password, pseudo], function(err) {
        if (err) {
            console.error('Error inserting user:', err.message);
        } else {
            console.log(`User ${pseudo} inserted with ID ${this.lastID}`);
        }
		db.close();
    });
}

interface UserRow {
	password: string;
    avatar: string;
    pseudo: string;
    defeats: number;
    victories: number;
}

export function checkUserID(mail: string, password: string, callback: (isValid: boolean) => void) {
	
    const db = openDatabase();
    db.run(
        `CREATE TABLE IF NOT EXISTS user (
            mail TEXT NOT NULL,
            password TEXT NOT NULL,
            pseudo TEXT,
            avatar TEXT,
            victories INTEGER DEFAULT 0,
            defeats INTEGER DEFAULT 0
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

export function getPseudo(mail: string): Promise<string | null> {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT pseudo FROM user WHERE mail = ?`,
            [mail],
            (err: Error | null, row: UserRow | undefined) => {
            db.close();
            if (err) {
                console.error('Erreur lors de la requête pseudo :', err.message);
                reject(new Error(err.message));
                return;
            }
      
            if (!row || row.pseudo === undefined) {
                console.log(`Aucun pseudo trouvée pour l'email : ${mail}`);
                resolve(null);
                return;
            }
            resolve(row.pseudo);
            }
        );
    });
}

export function getAvatar(mail: string): Promise<string | null> {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT avatar FROM user WHERE mail = ?`,
            [mail],
            (err: Error | null, row: UserRow | undefined) => {
            db.close();
            if (err) {
                console.error('Erreur lors de la requête avatar :', err.message);
                reject(new Error(err.message));
                return;
            }
      
            if (!row || row.avatar === undefined) {
                console.log(`Aucun avatar trouvée pour l'email : ${mail}`);
                resolve(null);
                return;
            }
            resolve(row.avatar);
            }
        );
    });
}

export function getVictories(mail: string): Promise<number | null> {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT victories FROM user WHERE mail = ?`,
            [mail],
            (err: Error | null, row: UserRow | undefined) => {
            db.close();
            if (err) {
                console.error('Erreur lors de la requête victories :', err.message);
                reject(new Error(err.message));
                return;
            }
      
            if (!row || row.victories === undefined) {
                console.log(`Aucune victoire trouvée pour l'email : ${mail}`);
                resolve(null);
                return;
            }
            resolve(row.victories);
            }
        );
    });
}

export function getDefeats(mail: string): Promise<number | null> {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT defeats FROM user WHERE mail = ?`,
            [mail],
            (err: Error | null, row: UserRow | undefined) => {
            db.close();
            if (err) {
                console.error('Erreur lors de la requête defeats :', err.message);
                reject(new Error(err.message));
                return;
            }
      
            if (!row || row.defeats === undefined) {
                console.log(`Aucune defaite trouvée pour l'email : ${mail}`);
                resolve(null);
                return;
            }
            resolve(row.defeats);
            }
        );
    });
}