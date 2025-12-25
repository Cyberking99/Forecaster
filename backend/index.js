require('dotenv').config();
const { ethers } = require('ethers');
const OpenAI = require('openai');
const predictionMarketAbi = require('./abis/PredictionMarket.json').abi;
const marketFactoryAbi = require('./abis/MarketFactory.json').abi;

// Configuration
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Initialize
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const factoryContract = new ethers.Contract(FACTORY_ADDRESS, marketFactoryAbi, wallet);

console.log(`Agent starting... Wallet: ${wallet.address}`);

async function main() {
    console.log("Listening for new markets...");

    // Poll for existing markets or listen to events
    // For MVP, let's just loop through all markets
    setInterval(checkMarkets, 60000); // Check every minute
    checkMarkets();
}

async function checkMarkets() {
    try {
        const markets = await factoryContract.getMarkets();
        console.log(`Found ${markets.length} markets.`);

        for (const marketAddress of markets) {
            await checkAndResolve(marketAddress);
        }
    } catch (error) {
        console.error("Error fetching markets:", error);
    }
}

async function checkAndResolve(marketAddress) {
    const marketContract = new ethers.Contract(marketAddress, predictionMarketAbi, wallet);

    try {
        const state = await marketContract.state();
        // 0 = OPEN, 1 = RESOLVED, 2 = CANCELLED
        if (state !== 0n) return;

        const details = await marketContract.details();
        const endTime = details.endTime;
        const question = details.question;

        // Check if ready to resolve
        /* 
           NOTE: For MVP testing, we might want to resolve EARLY if the answer is definitive,
           but strictly speaking we should wait for endTime.
           Let's wait for endTime for safety unless override is enabled.
        */
        // Uncomment to enforce time check
        // if (Date.now() / 1000 < Number(endTime)) return;

        console.log(`Analyzing market: ${question} (${marketAddress})`);
        const outcome = await getAIResolution(question);

        if (outcome !== null) {
            console.log(`Resolving market ${marketAddress} with outcome: ${outcome ? "YES" : "NO"}`);
            const tx = await marketContract.resolve(outcome);
            await tx.wait();
            console.log(`Market resolved! Tx: ${tx.hash}`);
        } else {
            console.log("AI could not determine outcome yet.");
        }

    } catch (error) {
        console.error(`Error processing market ${marketAddress}:`, error);
    }
}

async function getAIResolution(question) {
    // 1. Search the web (Mocked for now as we don't have a search API key in this env)
    // Real implementation would use Google Search API / Tavily
    console.log("Querying AI for:", question);

    /* 
       Prompt Engineering:
       You are an oracle. Given a question, determine if the outcome is YES or NO.
       If ambiguous or unknown, return NULL.
    */

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "You are a prediction market oracle. You must resolve questions to TRUE (Yes) or FALSE (No). If the event has not happened or is unclear, return NULL. Reply ONLY with 'TRUE', 'FALSE', or 'NULL'." },
                { role: "user", content: `Question: ${question}. Has this happened?` }
            ],
            model: "gpt-4",
        });

        const answer = completion.choices[0].message.content.trim().toUpperCase();
        console.log("AI Answer:", answer);

        if (answer === 'TRUE') return true;
        if (answer === 'FALSE') return false;
        return null;

    } catch (e) {
        console.error("OpenAI Error:", e.message);

        // Fallback for demo without API Key:
        // If question contains "Yes", return true.
        if (question.includes("always yes")) return true;
        return null;
    }
}

main();
