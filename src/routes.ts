import { Router } from 'express';
import { openDb } from './db';
import { Contact, PostResponse } from './models';
import { Statement } from 'sqlite3';
import { formatResponse } from './helper';

const router = Router();

router.post('/identify', async (req, res) => {
  const { email, phoneNumber } = req.body;
  const db = openDb();

  let final : Statement = db.prepare("SELECT * FROM Contact WHERE id = ? OR linkedId = ?");

  try {
    db.all(
      'SELECT * FROM Contact WHERE email = ? OR phoneNumber = ?', email, phoneNumber,
      (err: any, rows: Contact[]) => {
        if (err) {
          console.error("Error querying database:", err);
          res.status(500).json({ error: 'Database error' });
        }
        else if (rows.length > 0) {
          let p1 = -1, p2 = -1;
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].email === email && rows[i].phoneNumber === phoneNumber) 
              p1 = p2 = rows[i].linkedId ?? rows[i].id;
            else if (rows[i].email === email)
              p1 = rows[i].linkedId ?? rows[i].id;
            else
              p2 = rows[i].linkedId ?? rows[i].id;

            if (p1 > -1 && p2 > -1)
              break;
          }

          if (p1 === p2) {
            console.log('Case with no new information');
            final.bind(p1, p1);
            final.all((err: any, rows: Contact[]) => {
              if (err) {
                console.error("Error querying database:", err);
                res.status(500).json({ error: 'Database error' });
              } else {
                res.status(200).json(formatResponse(p1, rows));
              }
            });
          } else if (p1 === -1) {
            console.log('Case where email is new information')
            db.run("INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence) VALUES (?, ?, ?, 'secondary')", phoneNumber, email, p2, () => {
              final.bind(p2, p2);
              final.all((err: any, rows: Contact[]) => {
                if (err) {
                  console.error("Error querying database:", err);
                  res.status(500).json({ error: 'Database error' });
                } else {
                  res.status(200).json(formatResponse(p2, rows));
                }
              });
            });
          } else if (p2 === -1) {
            console.log('Case where phone number is new information')
            db.run("INSERT INTO Contact (phoneNumber, email, linkedId, linkPrecedence) VALUES (?, ?, ?, 'secondary')", phoneNumber, email, p1, () => {
              final.bind(p1, p1);
              final.all((err: any, rows: Contact[]) => {
                if (err) {
                  console.error("Error querying database:", err);
                  res.status(500).json({ error: 'Database error' });
                } else {
                  res.status(200).json(formatResponse(p1, rows));
                }
              });
            });
          } else {
            console.log("Case where both belong to different primary contacts");
            db.run("UPDATE Contact SET linkedId = ?, linkPrecedence = 'secondary', updatedAt = CURRENT_TIMESTAMP WHERE id = ? OR linkedId = ?", p1, p2, p2, () => {
              final.bind(p1, p1);
              final.all((err: any, rows: Contact[]) => {
                if (err) {
                  console.error("Error querying database:", err);
                  res.status(500).json({ error: 'Database error' });
                } else {
                  res.status(200).json(formatResponse(p1, rows));
                }
              });
            });
          }
        } else {
          console.log("User does not exist, creating new user")
          db.run("INSERT INTO Contact (phoneNumber, email) VALUES (?, ?)", phoneNumber, email, function (this: any, err: any) {
            let ret: PostResponse = {
              "contact": {
                "primaryContactId": this.lastID,
                "emails": [email],
                "phoneNumbers": [phoneNumber],
                "secondaryContactIds": []
              }
            };
            res.status(200).json(ret);
          });
        }
      }
    );

  } catch (e) {
    res.status(500).json({ error: 'Internal Server Error: ' + e});
  }
});

export default router;

