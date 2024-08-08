const CronJob = require("cron").CronJob;
const fs = require("fs");
const path = require("path");
const pm2 = require("pm2");

const schedule = {
  startDate: "08/08/2024",
  startTime: "16:40",
  set_end_date: false,
  endDate: null,
  endTime: null,
};
const title = "test3";

// Define the log file path
const logFilePath = path.join(
  __dirname,
  "../cronLogs",
  `${title}-SaleCronLog.txt`
);
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

logStream.write(`Starting the cron job....${title}\n`);

const { startDate, startTime, set_end_date, endDate, endTime } = schedule;
const [startDay, startMonth, startYear] = startDate.split("/").map(Number);
const [startHour, startMinute] = startTime.split(":").map(Number);

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Months are zero based
const currentDay = currentDate.getDate();
const currentHours = currentDate.getHours();
const currentMinutes = currentDate.getMinutes();

if (
  currentYear >= parseInt(startYear) &&
  currentMonth >= parseInt(startMonth) &&
  currentDay >= parseInt(startDay) &&
  currentHours >= parseInt(startHour) &&
  currentMinutes >= parseInt(startMinute)
) {
  cronFunction();
}

const cronExpression = `${startMinute} ${startHour} ${startDay} ${startMonth} *`;
// const cronExpression = "* * * * *";
logStream.write(`Cron expression: ${cronExpression}\n`);
const cronJob = new CronJob(cronExpression, cronFunction);

function yearFilter(year) {
  return parseInt(startYear) === year;
}

function cronFunction() {
  if (!yearFilter(new Date().getFullYear())) {
    return;
  }
  try {
    logStream.write("cronFunction: Running....\n");
    // throw new Error("Something went wrong in the cron job");
  } catch (error) {
    logStream.write(`cronFunction: Error: ${error.message}\n`);
    stopPm2Instance();
  }
}

function stopPm2Instance() {
  pm2.connect((err) => {
    if (err) {
      logStream.write(
        `Error connecting to pm2 to stop instance: ${err.message}\n`
      );
      return;
    }
    pm2.stop(`scheduler`, (err) => {
      if (err) {
        logStream.write(`Error stopping pm2 instance: ${err.message}\n`);
      } else {
        logStream.write(`Pm2 instance stopped successfully.\n`);
      }
      pm2.disconnect();
    });
  });
}

cronJob.start();
