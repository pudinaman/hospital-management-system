const mongoose = require("mongoose");

const billSchema = mongoose.Schema({
  patientID: { type: mongoose.Schema.Types.ObjectId, ref: "patient", required: true },
  consultationID: { type: mongoose.Schema.Types.ObjectId, ref: "consultation", required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Unpaid" },
  insuranceClaim: { type: Boolean, default: false },
});

const BillModel = mongoose.model("bill", billSchema);

module.exports = { BillModel };