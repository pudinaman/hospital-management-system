// routes/medicationAdministration.routes.js

const express = require("express");
const { MedicationAdministrationModel } = require("../models/MedicationAdministration.model");
const router = express.Router();

// Administer medication
router.post("/administer", async (req, res) => {
  const { admissionID, nurseID, medication, dosage } = req.body;
  try {
    const medicationAdministration = new MedicationAdministrationModel({ admissionID, nurseID, medication, dosage });
    await medicationAdministration.save();
    res.status(201).send({ id: medicationAdministration._id, message: "Medication administered successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to administer medication" });
  }
});

module.exports = router;
