const express = require("express");
const { NurseModel } = require("../models/Nurse.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { slackLogger } = require("../middlewares/webhook"); // Adjust path as needed

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const nurses = await NurseModel.find();
    res.status(200).send(nurses);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Fetching Nurses", "Failed to fetch nurses data", error, req);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const nurse = await NurseModel.findOne({ email });
    if (nurse) {
      return res.send({
        message: "Nurse already exists",
      });
    }
    let value = new NurseModel(req.body);
    await value.save();
    const data = await NurseModel.findOne({ email });
    return res.send({ data, message: "Registered" });
  } catch (error) {
    console.error(error);
    await slackLogger("Error Registering Nurse", "Failed to register nurse", error, req);
    res.send({ message: "error" });
  }
});

router.post("/login", async (req, res) => {
  const { nurseID, password } = req.body;
  try {
    const nurse = await NurseModel.findOne({ nurseID, password });

    if (nurse) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({ message: "Successful", user: nurse, token: token });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.error(error);
    await slackLogger("Error Logging in Nurse", "Failed to login nurse", error, req);
    res.send({ message: "Error" });
  }
});

router.patch("/:nurseId", async (req, res) => {
  const id = req.params.nurseId;
  const payload = req.body;
  try {
    await NurseModel.findByIdAndUpdate({ _id: id }, payload);
    const nurse = await NurseModel.findById(id);
    if (!nurse) {
      return res.status(404).send({ message: `Nurse with id ${id} not found` });
    }
    res.status(200).send({ message: `Nurse Updated`, user: nurse });
  } catch (error) {
    console.error(error);
    await slackLogger("Error Updating Nurse", "Failed to update nurse", error, req);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:nurseId", async (req, res) => {
  const id = req.params.nurseId;
  try {
    const nurse = await NurseModel.findByIdAndDelete({ _id: id });
    if (!nurse) {
      res.status(404).send({ msg: `Nurse with id ${id} not found` });
    }
    res.status(200).send(`Nurse with id ${id} deleted`);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Deleting Nurse", "Failed to delete nurse", error, req);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
