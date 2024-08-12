

const express = require("express");
const app = express();

function getSessionTokenHeader(request) {
  // Get session token from header `authorization`
  // Header Format is: "{"Authorization", "Bearer this-is-the-session-token"}
  // Return "this-is-the-session-token" from request header
}

function getSessionTokenFromUrlParam(request) {
  // Get session token from the request URL param
  // The param is "id_token"
  // Example: "${app_url}/?shop=${shop}&id_token=this-is-the-session-token"
  // Return "this-is-the-session-token" from URL param
}

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
