const pm2 = require("pm2");
const path = require("path");
const fs = require("fs");

const runPm2 = (title) => {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = path.join(__dirname, "scheduler.js"); // Adjust the path to your script

      // Define the log file path
      const logFilePath = path.join(
        __dirname,
        "../instanceLogs",
        `${title}-instance.txt`
      );
      const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

      logStream.write("Starting the instance....\n");

      pm2.connect((err) => {
        if (err) {
          logStream.write(`Error connecting to pm2:\n ${err.message}`);
          console.log(`Error connecting to pm2:\n ${err.message}`);
          // todo: send an email to the user if any error occurred
          reject({ status: "error", message: err.message });
          return;
        }
        pm2.start(
          {
            script: scriptPath, // Script to be run
            name: `${title}-sale instance`, // Name of the process
            instances: 1, // Number of instances
          },
          (err, apps) => {
            if (err) {
              logStream.write(
                `Error starting the pm2 instance:\n ${err.message}`
              );
              console.log(`Error starting the pm2 instance:\n ${err.message}`);
              // todo: send an email to the user if any error occurred
              reject({ status: "error", message: err.message });
              return;
            }
            pm2.disconnect(); // Disconnects from PM2
            logStream.write("Pm2 instance started...\n");
            resolve({ status: "success", message: "Pm2 instance started" });
          }
        );
      });
    } catch (error) {
      console.log(`Exception in runPm2:\n ${error.message}`);
      logStream.write(`Exception in runPm2:\n ${error.message}`);
      // todo: send an email to the user if any error occurred
      reject({ status: "error", message: error.message });
    }
  });
};
(async () => {
  try {
    const state = await runPm2("test2");
    console.log(state);
  } catch (error) {
    console.error(error);
  }
})();
// module.exports = runPm2;
