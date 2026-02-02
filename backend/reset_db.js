const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'reqruita.db');

/**
 * RESET SCRIPT: 
 * This script resets all participants to the 'waiting' status 
 * except for one who stays 'interviewing'.
 */

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log("Starting database reset...");

    // 1. Set everyone to waiting
    db.run("UPDATE participants SET status = 'waiting'", (err) => {
        if (err) {
            console.error("Error resetting participants:", err.message);
            return;
        }
        console.log("- All participants set to 'waiting'.");

        // 2. Set one specific person to 'interviewing' (using p1 as default)
        db.run("UPDATE participants SET status = 'interviewing' WHERE id = 'p1'", (err) => {
            if (err) {
                console.error("Error setting active interviewer:", err.message);
                return;
            }
            console.log("- 'Mas Rover' (p1) set to 'interviewing'.");
            console.log("\nDatabase reset successfully! Refresh your app to see the changes.");
            db.close();
        });
    });
});
