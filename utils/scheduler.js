const fs = require("fs");
const path = require("path");
const pm2 = require("pm2");
const { fileURLToPath } = require("url");
// Emulate __dirname

// Define the log file path
const logFilePath = path.join(
  path.dirname(__filename),
  "scheduleLog.txt"
);
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

logStream.write(`Scheduler started at ${new Date().toISOString()}\n`);
