const CronJob = require("cron").CronJob;
// Fire At 14:20 on day-of-month 8 in August.
const cronExpression = "* * * * *";
const fs = require("fs");
const path = require("path");
const pm2 = require("pm2");
const { fileURLToPath } = require("url");
// Emulate __dirname

// Define the log file path
const logFilePath = path.join(path.dirname(__filename), "cronLog.txt");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

const cronJob = new CronJob(cronExpression, cronFunction);

// Return true if the proc. should fire on the year in question.
// In the example below it will fire on even years.
function yearFilter(minutes) {
  console.log("🚀 ~ yearFilter ~ minutes:", minutes);
  return minutes % 55 === 0;
}

function cronFunction() {
  if (!yearFilter(new Date().getMinutes())) {
    return;
  }
  // Do whatever below...
  logStream.write("cronFunction: Running....");
}
cronJob.start();
