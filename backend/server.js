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
        
        // Ensure table exists and has seed data
        db.serialize(() => {
            // 1. Create table
            db.run(`CREATE TABLE IF NOT EXISTS participants (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL
            )`);

            // 2. Check if empty and seed
            db.get("SELECT COUNT(*) as count FROM participants", (err, row) => {
                if (err) {
                    console.error("Error checking table:", err.message);
                    return;
                }

                if (row.count === 0) {
                    console.log("Database is empty. Seeding with mock data...");
                    const seedData = [
                        { id: "p1", name: "Mas Rover", status: "interviewing" },
                        { id: "p2", name: "Robert Nachino", status: "interviewing" },
                        { id: "w1", name: "Elaina Kurama", status: "waiting" },
                        { id: "w2", name: "Navia Fon", status: "waiting" },
                        { id: "w3", name: "Jack Bron", status: "waiting" },
                        { id: "w4", name: "Raiden", status: "waiting" },
                        { id: "c1", name: "Aether", status: "completed" },
                        { id: "c2", name: "Ananta", status: "completed" },
                        { id: "c3", name: "Brian Sumo", status: "completed" },
                        { id: "c4", name: "Mavuika", status: "completed" }
                    ];

                    const stmt = db.prepare("INSERT INTO participants (id, name, status) VALUES (?, ?, ?)");
                    seedData.forEach(p => stmt.run(p.id, p.name, p.status));
                    stmt.finalize();
                    console.log(`Successfully seeded ${seedData.length} participants.`);
                } else {
                    console.log(`Database already has ${row.count} participants.`);
                }
            });
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

// POST /api/participants/complete
app.post('/api/participants/complete', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Participant ID is required' });

    const sql = "UPDATE participants SET status = 'completed' WHERE id = ?";
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
            res.json({ message: 'Participant moved to completed', participants: rows });
        });
    });
});

app.listen(PORT, () => {
    console.log(`SQL Mock Backend running at http://localhost:${PORT}`);
});
