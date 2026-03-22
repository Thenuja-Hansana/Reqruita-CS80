const assert = require('assert');

// Simple color formatter for report screenshots
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

console.log("\n=============================================");
console.log(" UNIT TEST SUITE: AUTHENTICATION API LOGIC");
console.log("=============================================\n");

async function runAuthTests() {
    let passed = 0;

    // TEST 1.1: Missing payload fields
    try {
        const res = await fetch("http://localhost:3001/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}) // Missing everything
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400, "Expected HTTP 400 Bad Request");
        assert.ok(data.message && data.message.includes("Missing required fields"), "Expected missing field error message");

        console.log(`  ${green('✓')} Test 1.1: Missing payload correctly triggers HTTP 400 Bad Request`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 1.1 Failed: ${e.message}`);
    }

    // TEST 1.2: Completely Invalid Credentials
    try {
        const res = await fetch("http://localhost:3001/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "fake@email.com",
                meetingId: "invalid",
                password: "wrong",
                role: "conduct"
            })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 401, "Expected HTTP 401 Unauthorized");
        assert.strictEqual(data.message, "Invalid credentials. Please check Email, Meeting ID, and Password.", "Expected specific invalid message");

        console.log(`  ${green('✓')} Test 1.2: Invalid credentials strictly throw 401 Unauthorized Error`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 1.2 Failed: ${e.message}`);
    }

    // Output final results
    console.log(`\n  Result: ${passed}/2 Authentication Tests Passed`);

    if (passed === 2) {
        console.log(`  ${green('=============================================')}`);
        console.log(`  ${green(' ALL TESTS COMPLETED SUCCESSFULLY')} ✅`);
        console.log(`  ${green('=============================================')}\n`);
    } else {
        console.log(`  ${red('Some tests failed. Ensure the Desktop Backend (localhost:3001) is currently running.')}\n`);
    }
}

runAuthTests();
