const pm2 = require("pm2");

const scriptPath = "./scheduler.js"; // Adjust the path to your script

const runPm2 = () => {
  console.log("Starting PM2 instance...");
  pm2.connect((err) => {
    if (err) {
      console.error(err);
      process.exit(2);
    }

    pm2.start(
      {
        script: scriptPath, // Script to be run
        name: "scheduler-instance", // Name of the process
        instances: 1, // Number of instances
      },
      (err, apps) => {
        pm2.disconnect(); // Disconnects from PM2
        if (err) throw err;
        console.log("PM2 instance started:", apps);
      }
    );
  });
};

module.exports = runPm2;

// export default runPm2;
