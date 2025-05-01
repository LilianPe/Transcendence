import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import { Player } from '../Pong/Player.js';

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

export function getUserFromDB(pseudo: string, callback: (player: Player | null) => void)
{
    const db = openDatabase();

    db.get(
        `SELECT id, pseudo, victories, defeats FROM user WHERE pseudo = ?`,
        [pseudo],
        (err, row: { id: number; pseudo: string; victories: number; defeats: number } | undefined) => {
            if (err) {
                console.error('Error retrieving user:', err.message);
                callback(null);
            } else if (!row) {
                console.log('User not found.');
                callback(null);
            } else {
                const player = new Player("");
                player['name'] = row.pseudo;
                player['DB_ID'] = row.id;
                player['score'] = row.victories - row.defeats;
                player['registered'] = true;
                callback(player);
            }

            db.close();
        }
    );
}

export function getMailFromId(id: number, callback: (mail: string | null) => void) {
    const db = openDatabase();

    db.get(
        `SELECT mail FROM user WHERE id = ?`,
        [id],
        (err, row: { mail: string } | undefined) => {
            if (err) {
                console.error('Error retrieving mail:', err.message);
                callback(null);
            } else if (!row) {
                console.log('User not found.');
                callback(null);
            } else {
                callback(row.mail);
            }

            db.close();
        }
    );
}

export async function createUser(mail: string, password: string, pseudo: string) {
	const db = openDatabase();
    
	db.serialize(() => {
	  db.run(`CREATE TABLE IF NOT EXISTS user (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  mail TEXT NOT NULL UNIQUE,
		  password TEXT NOT NULL,
		  pseudo TEXT,
		  avatar TEXT,
		  victories INTEGER DEFAULT 0,
		  defeats INTEGER DEFAULT 0
	  )`, (err) => {
		  if (err) {
			  console.error('Erreur création table:', err.message);
		  } else {
			  console.log('Table créée ou existante.');
		  }
	  });
  
	  db.run(`INSERT INTO user (mail, password, pseudo) VALUES (?, ?, ?)`, [mail, password, pseudo], async function(err) {
		  if (err) {
			  console.error('Erreur insertion user:', err.message);
		  } else {
			  console.log(`User ${pseudo} inséré avec ID ${this.lastID}`);
		  }
		  db.close();
	  });
	});
  }

interface UserRow {
	id: number;
	password: string;
    avatar: string;
    pseudo: string;
    defeats: number;
    victories: number;
}
  
export function checkUserID(mail: string, password: string, callback: (isValid: boolean) => void) {
	const db = openDatabase();
  
	db.serialize(() => {
	  db.run(
		`CREATE TABLE IF NOT EXISTS user (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  mail TEXT NOT NULL UNIQUE,
		  password TEXT NOT NULL,
		  pseudo TEXT,
		  avatar TEXT,
		  victories INTEGER DEFAULT 0,
		  defeats INTEGER DEFAULT 0
		)`,
		(err) => {
		  if (err) {
			console.error('Erreur création table:', err.message);
			callback(false);
			db.close();
			return;
		  }
		  db.get(`SELECT password FROM user WHERE mail = ?`, [mail], (err, row: { password: string } | undefined) => {
			if (err) {
			  console.error('Erreur recherche utilisateur:', err.message);
			  callback(false);
			} else if (!row) {
			  console.log('Utilisateur non trouvé.');
			  callback(false);
			} else {
			  if (row.password === password) {
				callback(true);
			  } else {
				callback(false);
			  }
			}
			db.close();
		  });
		}
	  );
	});
  }
  

export function checkUserMAIL(mail: string, callback: (isValid: boolean) => void) {
	
    const db = openDatabase();
    db.serialize(() => {
        db.run(
          `CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mail TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
            pseudo TEXT,
            avatar TEXT,
            victories INTEGER DEFAULT 0,
            defeats INTEGER DEFAULT 0
          )`,
          (err) => {
            if (err) {
              console.error('Erreur création table:', err.message);
              callback(false);
              db.close();
              return;
            }
    
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
          });
        }
      );
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

async function convertFileToBase64(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    const base64Data = fileBuffer.toString('base64');
    const mimeType = 'image/png';
    return `data:${mimeType};base64,${base64Data}`;
}

export function getAvatar(mail: string): Promise<string | null> {
    const db = openDatabase();

    return new Promise((resolve, reject) => {
        db.get(
            `SELECT avatar FROM user WHERE mail = ?`,
            [mail],
            async (err: Error | null, row: UserRow | undefined) => {
                db.close();

                if (err) {
                    console.error('Erreur lors de la requête avatar :', err.message);
                    reject(new Error(err.message));
                    return;
                }

                try {
                    let filePath: string;
                    if (row?.avatar) {
                        filePath = path.join('src/Database/Avatars', row.avatar);
                    } else {
                        console.log(`Aucun avatar trouvé pour l'email : ${mail}, envoi de l'avatar par défaut`);
                        filePath = path.join('src/Database/Avatars', 'defaultAvatar.png');
                    }
                    const base64Image = await convertFileToBase64(filePath);
                    resolve(base64Image);
                } catch (error) {
                    console.error('Erreur lors de la lecture du fichier avatar :', error);
                    reject(error);
                }
            }
        );
    });
}

export function setAvatar(mail: string, newAvatar: string): Promise<boolean> {
    const db = openDatabase();
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT avatar FROM user WHERE mail = ?`,
            [mail],
            (err: Error | null, row: UserRow | undefined) => {
                if (err) {
                    db.close();
                    console.error('Erreur lors de la requête avatar :', err.message);
                    reject(new Error(err.message));
                    return;
                }

                if (row && row.avatar) {
                    try {
                        const oldAvatarPath = path.join('src/Database/Avatars', row.avatar);
                        fs.unlink(oldAvatarPath).catch((error) =>
                            console.warn('Erreur lors de la suppression de l’ancien avatar :', error)
                        );
                    } catch (error) {
                        console.warn('Erreur lors de la suppression de l’ancien avatar :', error);
                    }

                    db.run(
                        `UPDATE user SET avatar = NULL WHERE mail = ?`,
                        [mail],
                        (err: Error | null) => {
                            if (err) {
                                db.close();
                                console.error('Erreur lors de la suppression de l’avatar en base :', err.message);
                                reject(new Error(err.message));
                                return;
                            }
                            console.log(`Avatar supprimé pour l'email : ${mail}`);
                        }
                    );
                }

                let extension: string;
                if (newAvatar.startsWith('data:image/png;base64,')) {
                    extension = '.png';
                } else if (newAvatar.startsWith('data:image/jpeg;base64,')) {
                    extension = '.jpg';
                } else {
                    db.close();
                    reject(new Error('Invalid image format. Only PNG and JPEG are allowed.'));
                    return;
                }

                const base64Data = newAvatar.replace(/^data:image\/(png|jpeg);base64,/, '');
                let buffer: Buffer;
                try {
                    buffer = Buffer.from(base64Data, 'base64');
                } catch {
                    db.close();
                    reject(new Error('Invalid base64 data'));
                    return;
                }

                const newAvatarName = `avatar-${Date.now()}${extension}`;
                const newAvatarPath = path.join('src/Database/Avatars', newAvatarName);

                fs.writeFile(newAvatarPath, buffer)
                    .then(() => {
                        db.run(
                            `UPDATE user SET avatar = ? WHERE mail = ?`,
                            [newAvatarName, mail],
                            (err: Error | null) => {
                                db.close();
                                if (err) {
                                    console.error('Erreur lors de la mise à jour de l’avatar :', err.message);
                                    reject(err.message);
                                    return;
                                }
                                console.log(`Nouvel avatar enregistré pour l'email : ${mail}`);
                                resolve(true);
                            }
                        );
                    })
                    .catch((error) => {
                        db.close();
                        console.error('Erreur lors de l’enregistrement du fichier :', error.message);
                        reject(new Error(error.message));
                    });
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

function create_blocked_relations_if_not_here(): Promise<void> {
	const db = openDatabase();
	return new Promise((resolve, reject) => {
		db.run(
			`CREATE TABLE IF NOT EXISTS blocked_relations (
				user_id INTEGER NOT NULL,
				blocked_id INTEGER NOT NULL,
				FOREIGN KEY(user_id) REFERENCES user(id),
				FOREIGN KEY(blocked_id) REFERENCES user(id)
			)`,
			(err) => {
				db.close();
				if (err) {
					console.error("Error creating blocked_relations table:", err.message);
					reject(err);
				} else {
					console.log("blocked_relations table created or already exists.");
					resolve();
				}
			}
		);
	});
}

export async function XhasBlockedY(id_X: number, id_Y: number): Promise<boolean> {
	await create_blocked_relations_if_not_here();
	const db = openDatabase();
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT 1 FROM blocked_relations WHERE user_id = ? AND blocked_id = ?`,
			[id_X, id_Y],
			(err, row) => {
				db.close();
				if (err) {
					console.error("Error checking block relation:", err.message);
					reject(err);
				} else {
					resolve(!!row); // true if row exists
				}
			}
		);
	});
}

export async function BlockPlayer(blocker: number, blocked: number): Promise<void> {
	await create_blocked_relations_if_not_here();
	const db = openDatabase();
	db.run(
		`INSERT INTO blocked_relations (user_id, blocked_id) VALUES (?, ?)`,
		[blocker, blocked],
		(err) => {
			db.close();
			if (err) {
				if (err.message.includes("UNIQUE constraint")) {
					console.warn("Block relation already exists.");
				} else {
					console.error("Error blocking player:", err.message);
				}
			} else {
				console.log(`Player ${blocker} has blocked ${blocked}`);
			}
		}
	);
}

export async function UnblockPlayer(blocker: number, blocked: number): Promise<void> {
	await create_blocked_relations_if_not_here();
	const db = openDatabase();
	db.run(
		`DELETE FROM blocked_relations WHERE user_id = ? AND blocked_id = ?`,
		[blocker, blocked],
		(err) => {
			db.close();
			if (err) {
				console.error("Error unblocking player:", err.message);
			} else {
				console.log(`Player ${blocker} has unblocked ${blocked}`);
			}
		}
	);
}
