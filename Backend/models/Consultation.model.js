const mongoose = require("mongoose");

const consultationSchema = mongoose.Schema({
  appointmentID: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
  doctorID: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  patientID: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
  history: { type: String },
  diagnosis: { type: String },
  treatmentPlan: { type: String },
});

const ConsultationModel = mongoose.model("consultation", consultationSchema);

module.exports = { ConsultationModel };