import fse from 'fs-extra';
import path from 'path';
import sq3 from 'sqlite3';
import logger from './logger';
import { docDir } from './settings';

export const dbPath = path.join(docDir, 'data.db');
fse.ensureFileSync(dbPath);
const sqlite3 = sq3.verbose();
const db = new sqlite3.Database(dbPath);

db.serialize(() => {

  db.run(`CREATE TABLE "RECORD" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "person_id" INTEGER NOT NULL,
    "status" INTEGER(2) NOT NULL,
    "count" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "total" real,
    "pre" integer,
    "date" INTEGER NOT NULL,
    "remark" TEXT,
    "create_time" INTEGER NOT NULL
  )`, err => {
    logger(err);
  });

  db.run(`CREATE TABLE PERSON(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    house VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(255) NOT NULL,
    remark VARCHAR(255) NOT NULL,
    create_time INTEGER NOT NULL,
    update_time INTEGER NOT NULL
    )`, err => {
    logger(err);
  });

  db.run(`CREATE TABLE UNIT (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" REAL,
    "time" INTEGER
  )`, err => {
    logger(err);
  });
});

export default db;
