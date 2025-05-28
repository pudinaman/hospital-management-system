// models/MedicationAdministration.model.js

const mongoose = require("mongoose");

const medicationAdministrationSchema = mongoose.Schema({
  admissionID: { type: mongoose.Schema.Types.ObjectId, ref: "admission", required: true },
  nurseID: { type: mongoose.Schema.Types.ObjectId, ref: "nurse", required: true },
  medication: { type: String, required: true },
  dosage: { type: String, required: true },
  administrationTime: { type: Date, default: Date.now },
});

const MedicationAdministrationModel = mongoose.model("medicationAdministration", medicationAdministrationSchema);

module.exports = { MedicationAdministrationModel };
