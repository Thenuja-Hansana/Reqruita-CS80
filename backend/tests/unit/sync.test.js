const assert = require('assert');
const Module = require('module');

// Simple color formatter
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

console.log("\n=============================================");
console.log(" UNIT TEST SUITE: OFFLINE SYNC ENGINE");
console.log("=============================================\n");

// --- MOCKING ENVIRONMENT ---
let mockSqliteInserted = [];
let mockNetworkFail = false;

const mockDb = {
    run: (sql, cb) => {
        if (sql.includes("DELETE FROM")) cb(null);
    },
    prepare: (sql) => ({
        run: (args, cb) => {
            mockSqliteInserted.push(args);
            cb(null);
        },
        finalize: (cb) => cb()
    })
};

// Intercept require() to inject our mocks
const originalRequire = Module.prototype.require;
Module.prototype.require = function (pathStr) {
    if (pathStr.includes('models/InterviewSession')) {
        return {
            find: async () => {
                if (mockNetworkFail) throw new Error("MongoNetworkError: connection timed out");
                return [{
                    _id: "sess_1",
                    meetingId: "M123",
                    meetingPassword: "PASS",
                    interviewerId: "valid_mongo_id_u1",
                    candidates: [{ candidateId: "valid_mongo_id_c1" }]
                }];
            }
        };
    }
    if (pathStr.includes('models/User')) {
        const fakeUser = { _id: "valid_mongo_id_u1", email: "int@mail.com", fullName: "Interviewer Bob" };
        return { findById: async () => fakeUser, findOne: async () => fakeUser };
    }
    if (pathStr.includes('models/FormSubmission')) {
        const fakeCand = { _id: "valid_mongo_id_c1", submitterEmail: "cand@mail.com" };
        return { findById: async () => fakeCand, findOne: async () => fakeCand };
    }
    if (pathStr.includes('../config/sqlite')) {
        return () => mockDb;
    }
    return originalRequire.apply(this, arguments);
};

// Now actually require the service so it gets the mocked versions!
const { syncAuthData } = require('../../desktop-app/src/services/syncService');

async function runSyncTests() {
    let passed = 0;

    // TEST 2.1: Data Mapping Accuracy
    try {
        await syncAuthData();

        // Ensure 2 records were inserted (1 Interviewer, 1 Candidate)
        if (mockSqliteInserted.length !== 2) {
            console.log("    [DEBUG] mockSqliteInserted count:", mockSqliteInserted.length);
        }
        assert.strictEqual(mockSqliteInserted.length, 2, "Should insert exactly 2 credentials into SQLite");

        // Verify Interviewer Mapping
        const intEntry = mockSqliteInserted.find(args => args[4] === "conduct");
        assert.ok(intEntry, "Interviewer credential not mapped");
        assert.strictEqual(intEntry[1], "int@mail.com", "Email mapping failed");
        assert.strictEqual(intEntry[6], "Interviewer Bob", "Name mapping failed");

        // Verify Candidate Mapping
        const candEntry = mockSqliteInserted.find(args => args[4] === "join");
        assert.ok(candEntry, "Candidate credential not mapped");
        assert.strictEqual(candEntry[1], "cand@mail.com", "Candidate email mapping failed");

        console.log(`  ${green('✓')} Test 2.1: MongoDB arrays correctly destructured and mapped to SQLite schemas`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 2.1 Failed: ${e.message}`);
    }

    // TEST 2.2: Network Failure Handling
    try {
        mockNetworkFail = true;
        mockSqliteInserted = []; // reset

        // This should run without crashing the whole process!
        await syncAuthData();

        assert.strictEqual(mockSqliteInserted.length, 0, "No data should be saved if Mongo fails");
        console.log(`  ${green('✓')} Test 2.2: MongoNetworkErrors cleanly caught by Service layer without crashing backend`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 2.2 Failed: ${e.message}`);
    }

    // Output final results
    console.log(`\n  Result: ${passed}/2 Sync Engine Tests Passed`);

    if (passed === 2) {
        console.log(`  ${green('=============================================')}`);
        console.log(`  ${green(' ALL TESTS COMPLETED SUCCESSFULLY')} ✅`);
        console.log(`  ${green('=============================================')}\n`);
    } else {
        console.log(`  ${red('Some tests failed.')}\n`);
    }
}

// Ignore console.log spam from the actual service for clean test output
console.log = function (msg) {
    if (typeof msg === 'string' && (msg.includes('Test') || msg.includes('Result') || msg.includes('===') || msg.includes('SUCC') || msg.includes('[DEBUG]'))) {
        process.stdout.write(msg + '\n');
    }
};

runSyncTests();
