const mongoose = require("mongoose");

const admissionSchema = mongoose.Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
  admissionDate: { type: Date, default: Date.now },
  ward: { type: String, required: true },
  bedNumber: { type: String, required: true },
  status: { type: String, default: "Admitted" },
  doctorID: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
});

const AdmissionModel = mongoose.model("admission", admissionSchema);

module.exports = { AdmissionModel };