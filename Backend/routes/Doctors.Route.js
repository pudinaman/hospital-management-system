const express = require("express");
const { DoctorModel } = require("../models/Doctor.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { slackLogger } = require("../middlewares/webhook"); // Adjust path as needed

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const doctors = await DoctorModel.find();
    res.status(200).send(doctors);
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Fetching Doctors",
      "Failed to fetch doctors",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const doctor = await DoctorModel.findOne({ email });
    if (doctor) {
      return res.send({
        message: "Doctor already exists",
      });
    }
    let value = new DoctorModel(req.body);
    await value.save();
    const data = await DoctorModel.findOne({ email });
    return res.send({ data, message: "Registered" });
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Registering Doctor",
      "Failed to register doctor",
      error,
      req
    );
    res.status(400).send({ message: "Error" });
  }
});

router.post("/login", async (req, res) => {
  const { docID, password } = req.body;
  try {
    const doctor = await DoctorModel.findOne({ docID, password });
    if (doctor) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({ message: "Successful", user: doctor, token: token });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Logging In Doctor",
      "Failed to login doctor",
      error,
      req
    );
    res.status(400).send({ message: "Error" });
  }
});

router.patch("/:doctorId", async (req, res) => {
  const id = req.params.doctorId;
  const payload = req.body;
  try {
    await DoctorModel.findByIdAndUpdate({ _id: id }, payload);
    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      return res.status(404).send({ message: `Doctor with id ${id} not found` });
    }
    res.status(200).send({ message: `Doctor Updated`, user: doctor });
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Updating Doctor",
      "Failed to update doctor",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:doctorId", async (req, res) => {
  const id = req.params.doctorId;
  try {
    const doctor = await DoctorModel.findByIdAndDelete({ _id: id });
    if (!doctor) {
      res.status(404).send({ msg: `Doctor with id ${id} not found` });
    } else {
      res.status(200).send(`Doctor with id ${id} deleted`);
    }
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Deleting Doctor",
      "Failed to delete doctor",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
