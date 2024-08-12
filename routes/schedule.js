const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { doScheduling } = require("../utils/startInstance");
require("dotenv").config();

router.get("/", (req, res) => {
  res.send("Hello Scheduler");
});

router.post("/new", async (req, res) => {
  console.log(req.body);

  try {
    const state = await doScheduling(req.body);
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

module.exports = { router };
