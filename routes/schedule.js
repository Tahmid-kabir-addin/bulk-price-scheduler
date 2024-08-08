const express = require("express");
const { parse } = require("flatted");
const router = express.Router();
const runPm2 = require("../utils/startInstance");

router.get("/", (req, res) => {
  res.send("Hello Scheduler");
});

router.post("/new", async (req, res) => {
  console.log(req.body);
  // runPm2();
});

router.get("/:id", (req, res) => {
  res.send(`user id is ${req.params.id}`);
});

router.param("id", (req, res, next, id) => {
  console.log(id);
  next();
});

module.exports = router;
