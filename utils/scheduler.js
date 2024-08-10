const CronJob = require("cron").CronJob;
const fs = require("fs");
const path = require("path");
const pm2 = require("pm2");
const { v4: uuidv4 } = require("uuid");
// --------------------------------------- pre-processing ----------------------------------------------------
const args = process.argv;
console.log("🚀 ~ args:", args);
// args from index 2 to the end
let argString = args.slice(2).join("");
// Add double quotes around keys
argString = argString.replace(/(\w+)(?=\s*:)/g, '"$1"');

// Add double quotes around string values (dates, times, and words)
argString = argString.replace(/:\s*([^\s,{}[\]]+)/g, (match, p1) => {
  // Check if the value is already wrapped in quotes
  if (/^".*"$/.test(p1)) return match;

  // Return the value with quotes, handling time, date, and word values correctly
  return `:"${p1}"`;
});

// Remove double quotes around boolean values (true/false)
argString = argString.replace(/:"(true|false)"/g, ":$1");

// Fix any remaining issues with the string
argString = argString.replace(/:\s*"(true|false)"/g, ":$1"); // Ensure booleans are not quoted

// find "" in the string and remove one "
argString = argString.replace(/""/g, '"');

// Fix the improperly formatted JSON string
argString = argString.replace(/"(\d+)"\:(\d+)/g, '"$1:$2"'); // Correct the time formatting
argString = argString.replace(/""/g, '"');
// Now parse the JSON string
console.log("🚀 ~ argString:", argString);

// Now parse the JSON string
const result = JSON.parse(argString);

console.log(result);

const { schedule, title } = result;
console.log("🚀 ~ title:", title);
console.log("🚀 ~ schedule:", schedule);

// ------------------------------------------- pre-processing ------------------------------------------------

// --------------------------------------------------------- Test case -------------------------------------------------

// let schedule = {};

// // set schedule.startDate to current date and format like "dd/mm/yyyy"
// schedule.startDate = new Date().toLocaleDateString("en-GB");
// schedule.set_end_date = true;
// schedule.endDate = schedule.startDate;
// let currentTime = new Date();
// // Add 2 minutes to the current time
// currentTime.setMinutes(currentTime.getMinutes() + 2);
// // Format the time as "hh:mm"
// schedule.startTime = currentTime.toLocaleTimeString("en-GB", {
//   hour: "2-digit",
//   minute: "2-digit",
// });

// currentTime.setMinutes(currentTime.getMinutes() + 5);
// schedule.endTime = currentTime.toLocaleTimeString("en-GB", {
//   hour: "2-digit",
//   minute: "2-digit",
// });
// console.log(schedule);
// const title = uuidv4();

// ---------------------------------------------- Test case -------------------------------------------------

const runstartCronJob = () => {
  let startCronJob = null,
    endCronJob = null;

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
  let endDay, endMonth, endYear;
  let endHour, endMinute;
  if (set_end_date) {
    [endDay, endMonth, endYear] = endDate.split("/").map(Number);
    [endHour, endMinute] = endTime.split(":").map(Number);
  }

  const startCronExpression = `${startMinute} ${startHour} ${startDay} ${startMonth} *`;
  let endCronExpression;
  if (set_end_date) {
    endCronExpression = `${endMinute} ${endHour} ${endDay} ${endMonth} *`;
  }
  logStream.write(
    `Cron expression: ${startCronExpression} ${endCronExpression}\n`
  );
  startCronJob = new CronJob(startCronExpression, startCronFunction);
  if (set_end_date) {
    endCronJob = new CronJob(endCronExpression, stopCronFunction);
  }

  // Todo: check if the start and end date already passed in the frontend

  function StartYearFilter(year) {
    console.log("🚀 ~ StartYearFilter ~ year:", year)
    console.log("🚀 ~ StartYearFilter ~ new Date().getFullYear():", startYear === year)
    return parseInt(startYear) === year;
  }

  function startCronFunction() {
    if (!StartYearFilter(new Date().getFullYear())) {
      logStream.write("year didn't match");
      return;
    }
    try {
      
      startCronJob.stop();
      if (!set_end_date) stopAndDeletePm2Instance();
    } catch (error) {
      stopAndDeletePm2Instance();
      if (startCronJob) startCronJob.stop();
      if (set_end_date) endCronJob.stop();
      logStream.write(`startCronFunction: Error: ${error.message}\n`);
      return {
        status: "error",
        message: error.message,
      };
    }
  }

  function endYearFilter(year) {
    return parseInt(endYear) === year;
  }

  function stopCronFunction() {
    if (!endYearFilter(new Date().getFullYear())) {
      return;
    }
    try {
      logStream.write("EndCronFunction: Running....\n");
      // throw new Error("Something went wrong in the cron job");
      stopAndDeletePm2Instance();
      endCronJob.stop();
    } catch (error) {
      stopAndDeletePm2Instance();
      endCronJob.stop();
      logStream.write(`startCronFunction: Error: ${error.message}\n`);
      return {
        status: "error",
        message: error.message,
      };
    }
  }
  startCronJob.start();
  if (set_end_date) endCronJob.start();
  return {
    status: "success",
    message: "Cron job started",
  };
};

const stopAndDeletePm2Instance = () => {
  pm2.connect((err) => {
    if (err) {
      console.log(`Error connecting to pm2: ${err.message}`);
      return;
    }
    pm2.stop(`${title}-sale instance`, (err) => {
      if (err) {
        console.log(`Error stopping pm2 instance: ${err.message}`);
      } else {
        console.log(`Pm2 instance stopped successfully.`);
      }
    });
    pm2.delete(`${title}-sale instance`, (err) => {
      if (err) {
        console.log(`Error deleting pm2 instance: ${err.message}`);
      } else {
        console.log(`Pm2 instance deleted successfully.`);
      }
      pm2.disconnect();
    });
  });
};

runstartCronJob();
// module.exports = runstartCronJob;
