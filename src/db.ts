import sqlite3 from 'sqlite3';

export function openDb() {
  return new sqlite3.Database("data.db");
}

