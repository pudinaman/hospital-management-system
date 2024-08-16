const express = require("express");
const { PatientModel } = require("../models/Patient.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { ReportModel } = require("../models/Report.model");
const { slackLogger } = require("../middlewares/webhook"); // Adjust path as needed

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const patients = await PatientModel.find();
    res.status(200).send({ patients });
  } catch (error) {
    console.error(error);
    await slackLogger("Error Fetching Patients", "Failed to fetch patients data", error, req);
    res.status(400).send({ error: "Something went wrong" });
  }
});

// This register route will be used when adding a patient via patient or doctor or admin
// Register a new patient
router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const existingPatient = await PatientModel.findOne({ email });
    if (existingPatient) {
      return res.status(400).send({ message: "Patient already exists", id: existingPatient.patientID });
    }
    const newPatient = new PatientModel(req.body);
    await newPatient.save();
    res.status(201).send({ id: newPatient.patientID });
  } catch (error) {
    res.status(500).send({ error: "Failed to register patient" });
  }
});

// Update patient details
router.patch("/:patientId", async (req, res) => {
  const id = req.params.patientId;
  const updates = req.body;
  try {
    const patient = await PatientModel.findByIdAndUpdate(id, updates, { new: true });
    if (!patient) {
      return res.status(404).send({ message: "Patient not found" });
    }
    res.status(200).send(patient);
  } catch (error) {
    res.status(500).send({ error: "Failed to update patient" });
  }
});

router.post("/login", async (req, res) => {
  const { patientID, password } = req.body;
  try {
    const patient = await PatientModel.findOne({ patientID, password });

    if (patient) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      let email = patient.email;
      let report = await ReportModel.find({ email });
      res.send({
        message: "Login Successful.",
        user: patient,
        token: token,
        report,
      });
    } else {
      res.send({ message: "Wrong credentials, Please try again." });
    }
  } catch (error) {
    console.error(error);
    await slackLogger("Error Logging in Patient", "Failed to login patient", error, req);
    res.send({ message: "Error occurred, unable to Login." });
  }
});

// Only Admin should be able to update or delete patient
router.patch("/:patientId", async (req, res) => {
  const id = req.params.patientId;
  const payload = req.body;
  try {
    const patient = await PatientModel.findByIdAndUpdate({ _id: id }, payload);
    if (!patient) {
      res.status(404).send({ msg: `Patient with id ${id} not found` });
    }
    res.status(200).send(`Patient with id ${id} updated`);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Updating Patient", "Failed to update patient", error, req);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:patientId", async (req, res) => {
  const id = req.params.patientId;
  try {
    const patient = await PatientModel.findByIdAndDelete({ _id: id });
    if (!patient) {
      res.status(404).send({ msg: `Patient with id ${id} not found` });
    }
    res.status(200).send(`Patient with id ${id} deleted`);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Deleting Patient", "Failed to delete patient", error, req);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
