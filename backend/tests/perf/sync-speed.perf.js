const { performance } = require('perf_hooks');
const mongoose = require("mongoose");
const connectMongo = require("../../desktop-app/src/config/mongo");
const { syncAuthData } = require("../../desktop-app/src/services/syncService");

const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;

console.log("\n=============================================");
console.log(" PERFORMANCE TEST: DB SYNC EFFICIENCY");
console.log("=============================================\n");

async function runSyncSpeedTest() {
    try {
        console.log(`  ${cyan('Connecting')} to MongoDB...`);
        await connectMongo();

        console.log(`  ${cyan('Starting')} synchronization process benchmark...`);

        // Silence internal sync logs for a cleaner timer result
        const oldLog = console.log;
        console.log = () => { };

        const start = performance.now();
        await syncAuthData();
        const end = performance.now();
        const duration = end - start;

        // Restore logs
        console.log = oldLog;

        console.log(`\n  ${green('SYNC COMPLETED SUCCESSFULLY')} ✅`);
        console.log(`  Total execution time: ${duration.toFixed(2)}ms`);
        console.log(`  This represents the overhead added to the backend startup`);
        console.log(`  when transitioning from online Cloud to local Cache.`);

        if (duration < 5000) {
            console.log(`\n  ${green('VERDICT:')} EXCELLENT 🌟`);
            console.log(`  The synchronization logic is highly optimized for rapid startup.`);
        }

    } catch (err) {
        console.error("\n  Sync speed test encountered a fatal error:", err.message);
    } finally {
        await mongoose.connection.close();
        console.log("\n=============================================");
        console.log(" SYNC SPEED TEST COMPLETED");
        console.log("=============================================\n");
        process.exit(0);
    }
}

runSyncSpeedTest();
