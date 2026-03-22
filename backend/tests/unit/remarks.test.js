const assert = require('assert');
const Module = require('module');

// Simple color formatter
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

console.log("\n=============================================");
console.log(" UNIT TEST SUITE: REMARKS CONTROLLER");
console.log("=============================================\n");

// Intercept Mongoose Model to prevent actual DB queries
const originalRequire = Module.prototype.require;
Module.prototype.require = function (pathStr) {
    if (pathStr.includes('models/InterviewRemark')) {
        return {
            findOne: async () => null,
            create: async (data) => data
        };
    }
    return originalRequire.apply(this, arguments);
};

const remarkController = require('../../desktop-app/src/controllers/remarkController');

// Mock Express req/res objects
const mockResponse = () => {
    const res = {};
    res.statusCode = 200;
    res.jsonData = null;
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

async function runRemarkTests() {
    let passed = 0;

    // TEST 3.1: Rejecting missing fields
    try {
        const req = { body: { remark: "Nice interview!" } }; // Exposing missing IDs
        const res = mockResponse();

        await remarkController.postRemark(req, res);

        assert.strictEqual(res.statusCode, 400, "Should return HTTP 400");
        assert.ok(res.jsonData.error.includes("Missing required fields"), "Should explicitly warn about missing fields");

        console.log(`  ${green('✓')} Test 3.1: Strict input validation correctly blocks incomplete payloads (HTTP 400)`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 3.1 Failed: ${e.message}`);
    }

    // TEST 3.2: Allowing 'empty text' string if explicit
    try {
        const req = { body: { interviewId: "i123", participantId: "p123", remark: "" } }; // Empty remark text is valid for clearing notes
        const res = mockResponse();

        await remarkController.postRemark(req, res);

        assert.strictEqual(res.statusCode, 200, "Should successfully handle intentionally cleared text");
        assert.strictEqual(res.jsonData.message, "Remark saved successfully", "Should return success format");

        console.log(`  ${green('✓')} Test 3.2: Purposefully cleared text strings correctly bypass validation and save (HTTP 200)`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 3.2 Failed: ${e.message}`);
    }

    // Output final results
    console.log(`\n  Result: ${passed}/2 Remarks Controller Tests Passed`);

    if (passed === 2) {
        console.log(`  ${green('=============================================')}`);
        console.log(`  ${green(' ALL TESTS COMPLETED SUCCESSFULLY')} ✅`);
        console.log(`  ${green('=============================================')}\n`);
    } else {
        console.log(`  ${red('Some tests failed.')}\n`);
    }
}

runRemarkTests();
