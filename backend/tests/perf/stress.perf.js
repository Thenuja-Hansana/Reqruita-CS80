const { performance } = require('perf_hooks');

const API_URL = "http://localhost:3001/api/auth/login";

const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

async function runStressTest(concurrentUsers = 20) {
    console.log("=============================================");
    console.log(" PERFORMANCE STRESS TEST: CONCURRENCY");
    console.log(` Simulating ${concurrentUsers} simultaneous candidate logins...`);
    console.log("=============================================");

    const start = performance.now();

    // Create an array of Promises representing concurrent login requests
    const requests = Array.from({ length: concurrentUsers }).map(async (_, i) => {
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: `stress_test_${i}@test.com`,
                    password: "password",
                    meetingId: "M123",
                    role: "join"
                })
            });
            await res.json();
            return { status: res.status, ok: res.ok };
        } catch (err) {
            return { error: err.message };
        }
    });

    const results = await Promise.all(requests);
    const end = performance.now();

    const totalTime = end - start;
    const successCount = results.filter(r => r.status === 401 || r.status === 200).length;
    const errorCount = results.filter(r => r.error).length;

    console.log(`\n  ${cyan('TEST RESULTS:')}`);
    console.log(`  Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`  Successful Responses: ${successCount}/${concurrentUsers}`);
    console.log(`  Throughput: ${(concurrentUsers / (totalTime / 1000)).toFixed(2)} requests/sec`);

    if (successCount === concurrentUsers) {
        console.log(`\n  ${green('PROFESSIONAL STABILITY VERDICT:')} ✅`);
        console.log(`  The Node.js backend successfully handled a burst of ${concurrentUsers} parallel connections`);
        console.log(`  without a single dropped packet or timeout.`);
    } else {
        console.log(`\n  ${yellow('STABILITY VERDICT:')} ⚠️`);
        console.log(`  Some requests failed or timed out. Handled ${successCount}/${concurrentUsers} successfully.`);
    }

    console.log("\n=============================================");
    console.log(" STRESS TEST COMPLETED");
    console.log("=============================================\n");
}

runStressTest(25); // Test with 25 simultaneous users
