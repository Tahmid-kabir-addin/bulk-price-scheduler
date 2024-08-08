const express = require("express");
const router = express.Router();
const runPm2 = require("../utils/startInstance");

let schedule, title;

router.get("/", (req, res) => {
  res.send("Hello Scheduler");
});

router.post("/new", async (req, res) => {
  console.log(req.body);
  schedule = req.body.schedule;
  title = req.body.title;
  try {
    const state = await runPm2(title);
    console.log("🚀 ~ router.post ~ state:", state);
    res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", (req, res) => {
  res.send(`user id is ${req.params.id}`);
});

router.param("id", (req, res, next, id) => {
  console.log(id);
  next();
});

module.exports = { router, schedule, title };
