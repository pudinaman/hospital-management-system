// routes/admission.routes.js

const express = require("express");
const { AdmissionModel } = require("../models/Admission.model");
const router = express.Router();

// Admit a patient
router.post("/admit", async (req, res) => {
  const { patientID, ward, bedNumber, doctorID } = req.body;
  try {
    const admission = new AdmissionModel({ patientID, ward, bedNumber, doctorID });
    await admission.save();
    res.status(201).send({ id: admission._id, message: "Patient admitted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to admit patient" });
  }
});

// Update patient status
router.patch("/:admissionId/status", async (req, res) => {
  const id = req.params.admissionId;
  const { status } = req.body;
  try {
    const admission = await AdmissionModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!admission) {
      return res.status(404).send({ message: "Admission not found" });
    }
    res.status(200).send({ message: "Patient status updated", admission });
  } catch (error) {
    res.status(500).send({ error: "Failed to update status" });
  }
});

module.exports = router;
