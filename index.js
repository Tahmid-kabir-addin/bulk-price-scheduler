const express = require("express");
const app = express();

const scheduler = require("./routes/schedule");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use("/schedule", scheduler);
function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.listen(5000);
