// const pm2 = require("pm2");

// const path = require("path");
// const fs = require("fs");
// const { exec } = require("child_process");

// const runPm2 = () => {
//   const schedule = global.schedule;
//   console.log("🚀 ~ runPm2 ~ schedule:", schedule)
//   const title = global.title;
//   console.log("🚀 ~ runPm2 ~ title:", title)
//   return new Promise((resolve, reject) => {
//     try {
//       const scriptPath = path.join(__dirname, "scheduler.js"); // Adjust the path  to your script

//       // Define the log file path
//       const logFilePath = path.join(
//         __dirname,
//         "../instanceLogs",
//         `${title}-instance.txt`
//       );
//       const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

//       logStream.write("Starting the instance....\n");

//       pm2.connect((err) => {
//         if (err) {
//           logStream.write(`Error connecting to pm2:\n ${err.message}`);
//           console.log(`Error connecting to pm2:\n ${err.message}`);
//           // todo: send an email to the user if any error occurred
//           reject({ status: "error", message: err.message });
//           return;
//         }
//         pm2.start(
//           {
//             script: scriptPath, // Script to be run
//             name: `${title}-sale instance`, // Name of the process
//             instances: 1, // Number of instances
//             args: JSON.stringify({ schedule, title }),
//             exec_mode: 'fork',
//           },
//           (err, apps) => {
//             if (err) {
//               logStream.write(
//                 `Error starting the pm2 instance:\n ${err.message}`
//               );
//               console.log(`Error starting the pm2 instance:\n ${err.message}`);
//               // todo: send an email to the user if any error occurred
//               reject({ status: "error", message: err.message });
//               return;
//             }
//             pm2.disconnect(); // Disconnects from PM2
//             logStream.write("Pm2 instance started...\n");
//             resolve({ status: "success", message: "Pm2 instance started" });
//           }
//         );
//       });
//     } catch (error) {
//       console.log(`Exception in runPm2:\n ${error.message}`);
//       logStream.write(`Exception in runPm2:\n ${error.message}`);
//       // todo: send an email to the user if any error occurred
//       reject({ status: "error", message: error.message });
//     }
//   });
// };
// // (async () => {
// //   try {
// //     const state = await runPm2("test2");
// //     console.log(state);
// //   } catch (error) {
// //     console.error(error);
// //   }
// // })();
// module.exports = runPm2;

// const { spawn } = require("child_process");
// const path = require("path");
// const fs = require("fs");

// const runSpawn = () => {
//   const schedule = global.schedule;
//   const title = global.title;

//   return new Promise((resolve, reject) => {
//     try {
//       const scriptPath = path.join(__dirname, "scheduler.js"); // Adjust the path to your script

//       // Define the log file path
//       const logFilePath = path.join(
//         __dirname,
//         "../instanceLogs",
//         `${title}-instance.txt`
//       );
//       const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

//       logStream.write("Starting the instance....\n");

//       // Spawn the child process
//       const instance = spawn(
//         "node",
//         [scriptPath, JSON.stringify({ schedule, title })],
//         {
//           detached: true,
//           stdio: ["ignore", "ignore", "ignore"],
//         }
//       );

//       // Set the PID to a global variable
//       global.processPid = instance.pid;
//       logStream.write(`Process started with PID: ${instance.pid}\n`);
//       console.log(`Process started with PID: ${instance.pid}`);

//       instance.unref(); // This allows the parent to exit independently of the child

//       resolve({
//         status: "success",
//         message: `Process started with PID: ${instance.pid}`,
//       });
//     } catch (error) {
//       console.log(`Exception in runSpawn:\n ${error.message}`);
//       logStream.write(`Exception in runSpawn:\n ${error.message}`);
//       reject({ status: "error", message: error.message });
//     }
//   });
// };

// Example usage
// (async () => {
//   try {
//     const state = await runSpawn();
//     console.log(state);
//   } catch (error) {
//     console.error(error);
//   }
// })();

// module.exports = { runSpawn };

const { updateProductsPrice, updateStatus, rollbackSale } = require("../data/sales");

const doScheduling = async ({
  saleId,
  schedule,
  productsWithPrice,
  priceFields,
  compareAtPriceFields,
  tags,
  timeUntilTask,
  timeUntilFinish,
  session,
  status
}) => {
  console.log("setting timeout");
  // Set a timeout to execute the task at the specified date and time
  try {
    setTimeout(async () => {
      await Promise.all([
        updateProductsPrice(productsWithPrice, priceFields, session),
        updateProductsPrice(productsWithPrice, compareAtPriceFields, session, tags),
      ]);
      if (status === "Scheduled") {
        await updateStatus(saleId, "Active");
      }
    }, timeUntilTask);
  } catch (error) {
    console.log("🚀 ~ doScheduling ~ error:", error);
  }
  // Set a timeout to rollback the task at the specified date and time
  if (schedule.set_end_date) {
    setTimeout(async () => {
      try {
        await rollbackSale(saleId, session);
      } catch (error) {
        throw new Error(error);
      }
    }, timeUntilFinish);
  }
};

module.exports = { doScheduling };
