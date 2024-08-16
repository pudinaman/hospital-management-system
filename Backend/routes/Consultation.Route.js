const express = require("express");
const { ConsultationModel } = require("../models/Consultation.model");
const router = express.Router();

// Document patient consultation
router.post("/consult", async (req, res) => {
  const { appointmentID, doctorID, patientID, history, diagnosis, treatmentPlan } = req.body;
  try {
    const consultation = new ConsultationModel({ appointmentID, doctorID, patientID, history, diagnosis, treatmentPlan });
    await consultation.save();
    res.status(201).send({ id: consultation._id });
  } catch (error) {
    res.status(500).send({ error: "Failed to document consultation" });
  }
});
module.exports = router;