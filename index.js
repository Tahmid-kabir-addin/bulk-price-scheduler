const express = require("express");
const app = express();

const { router } = require("./routes/schedule");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger);
app.use("/schedule", router);
function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.listen(5000);
