import { createClient } from "redis";  
import envt_imports from './envt_imports/envt_imports.js';  

const redisClient = createClient({
    socket: {
        host: envt_imports.redisHost, 
        port: envt_imports.redisPort, 
    },
   
});

// Handling the "connect" event
redisClient.on("connect", () => {
    console.log("Connected to Redis successfully!");
});

// Handling the "error" event
redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);  // Logging any errors from the Redis client
});

// Asynchronous function to connect to Redis
await redisClient.connect().catch(e => {
    console.error("Failed to connect to Redis:", e);
    process.exit(1);
})

// Export the Redis client for use in other files
export default redisClient;
