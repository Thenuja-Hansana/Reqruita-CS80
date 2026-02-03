const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'reqruita.db');

const db = new sqlite3.Database(DB_PATH);

db.all("SELECT * FROM participants", [], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log("Current Database State:");
    rows.forEach(row => {
        console.log(`- ${row.name} (${row.id}): ${row.status}`);
    });
    db.close();
});
