const { performance } = require('perf_hooks');

const API_URL = "http://localhost:3001/api";

const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

async function benchmarkEndpoint(name, url, method, body, iterations = 20) {
    let totalTime = 0;
    let minTime = Infinity;
    let maxTime = 0;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined
            });
            await res.json();
            const end = performance.now();
            const duration = end - start;

            if (res.ok || res.status === 401) {
                successCount++;
                totalTime += duration;
                if (duration < minTime) minTime = duration;
                if (duration > maxTime) maxTime = duration;
            }
        } catch (err) { }
    }

    return {
        name,
        avgTime: totalTime / successCount,
        minTime,
        maxTime,
        successRate: (successCount / iterations) * 100
    };
}

async function runPerformanceSuite() {
    console.log("=============================================");
    console.log(" PERFORMANCE BENCHMARK: API LATENCY");
    console.log("=============================================");

    const results = [];

    const auth = await benchmarkEndpoint(
        "Auth Login (Mocked Fail)",
        `${API_URL}/auth/login`,
        "POST",
        { email: "perf@test.com", password: "wrong", meetingId: "test", role: "conduct" },
        20
    );
    if (auth) results.push(auth);

    const remarks = await benchmarkEndpoint(
        "Fetch Remarks",
        `${API_URL}/remarks/nonexistent_id`,
        "GET",
        null,
        20
    );
    if (remarks) results.push(remarks);

    console.log("\n" + cyan("FINAL SUMMARY TABLE:"));
    console.table(results.map(r => ({
        "Endpoint": r.name,
        "Avg (ms)": r.avgTime.toFixed(2),
        "Min (ms)": r.minTime.toFixed(2),
        "Max (ms)": r.maxTime.toFixed(2),
        "Success %": r.successRate.toFixed(0)
    })));

    console.log("\n=============================================");
    console.log(" BENCHMARK COMPLETED");
    console.log("=============================================\n");
}

runPerformanceSuite();
