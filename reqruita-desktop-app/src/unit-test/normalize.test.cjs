const assert = require('assert');

// Simple color formatter
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;

console.log("\n=============================================");
console.log(" UNIT TEST SUITE: FRONTEND UTILITIES");
console.log("=============================================\n");

// The function we are testing (extracted from MeetingInterviewer.jsx)
const normalizeParticipants = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.participants)) return data.participants;
    return [];
};

function runNormalizeTests() {
    let passed = 0;

    // TEST 4.1: Handle direct array input
    try {
        const input = [{ id: 1, name: "Alice" }];
        const result = normalizeParticipants(input);
        assert.deepStrictEqual(result, input, "Should return the same array");
        console.log(`  ${green('✓')} Test 4.1: Direct array input handled correctly`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 4.1 Failed: ${e.message}`);
    }

    // TEST 4.2: Handle object with participants key
    try {
        const input = { participants: [{ id: 2, name: "Bob" }] };
        const result = normalizeParticipants(input);
        assert.deepStrictEqual(result, input.participants, "Should extract participants array");
        console.log(`  ${green('✓')} Test 4.2: Object wrapper { participants: [...] } handled correctly`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 4.2 Failed: ${e.message}`);
    }

    // TEST 4.3: Handle null/undefined/garbage
    try {
        assert.deepStrictEqual(normalizeParticipants(null), [], "Null should return empty array");
        assert.deepStrictEqual(normalizeParticipants(undefined), [], "Undefined should return empty array");
        assert.deepStrictEqual(normalizeParticipants({}), [], "Empty object should return empty array");
        console.log(`  ${green('✓')} Test 4.3: Malformed or null data gracefully returns an empty array`);
        passed++;
    } catch (e) {
        console.log(`  ${red('✗')} Test 4.3 Failed: ${e.message}`);
    }

    // Output final results
    console.log(`\n  Result: ${passed}/3 Frontend Utility Tests Passed`);

    if (passed === 3) {
        console.log(`  ${green('=============================================')}`);
        console.log(`  ${green(' ALL TESTS COMPLETED SUCCESSFULLY')} ✅`);
        console.log(`  ${green('=============================================')}\n`);
    } else {
        console.log(`  ${red('Some tests failed.')}\n`);
    }
}

runNormalizeTests();
