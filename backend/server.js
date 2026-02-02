const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'reqruita.db');

app.use(cors());
app.use(bodyParser.json());

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Open the SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database (reqruita.db).');
        // Initial check
        db.get("SELECT COUNT(*) as count FROM participants", (err, row) => {
            if (err) console.error("Error checking table:", err.message);
            else console.log(`Database has ${row.count} participants.`);
        });
    }
});

// GET /api/participants
app.get('/api/participants', (req, res) => {
    const sql = "SELECT * FROM participants";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /api/participants/allow
// Logic: Move current 'interviewing' to 'completed', and the selected 'waiting' to 'interviewing'
app.post('/api/participants/allow', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Participant ID is required' });

    // Use a transaction for safety
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Move all current 'interviewing' to 'completed'
        db.run("UPDATE participants SET status = 'completed' WHERE status = 'interviewing'", (err) => {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: "Failed to update current interviewing status" });
            }

            // 2. Move the selected participant from 'waiting' to 'interviewing'
            db.run("UPDATE participants SET status = 'interviewing' WHERE id = ?", [id], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: "Failed to update selected participant status" });
                }

                if (this.changes === 0) {
                    db.run("ROLLBACK");
                    return res.status(404).json({ error: "Participant not found" });
                }

                db.run("COMMIT", (err) => {
                    if (err) {
                        return res.status(500).json({ error: "Failed to commit transaction" });
                    }
                    // Fetch updated list to return
                    db.all("SELECT * FROM participants", [], (err, rows) => {
                        res.json({ message: 'Success', participants: rows });
                    });
                });
            });
        });
    });
});

// POST /api/participants/reject
app.post('/api/participants/reject', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Participant ID is required' });

    const sql = "DELETE FROM participants WHERE id = ?";
    db.run(sql, [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Participant not found" });
        }
        
        // Fetch updated list to return
        db.all("SELECT * FROM participants", [], (err, rows) => {
            res.json({ message: 'Participant removed', participants: rows });
        });
    });
});

app.listen(PORT, () => {
    console.log(`SQL Mock Backend running at http://localhost:${PORT}`);
});
