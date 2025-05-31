import express from 'express';
import { openDb } from './db';
import routes from './routes';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(routes);

app.listen(PORT, async () => {
  const db = await openDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS Contact (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phoneNumber TEXT,
      email TEXT,
      linkedId INTEGER,
      linkPrecedence TEXT DEFAULT 'primary' CHECK (linkPrecedence IN ('primary', 'secondary')) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deletedAt TIMESTAMP DEFAULT NULL
    )
  `);
  db.close();

  console.log(`Server is running on http://localhost:${PORT}`);
});

