// models/Ward.model.js

const mongoose = require("mongoose");

const wardSchema = mongoose.Schema({
  wardName: { type: String, required: true },
  totalBeds: { type: Number, required: true },
  availableBeds: { type: Number, required: true },
  bedNumbers: [{ type: String }],
});

const WardModel = mongoose.model("ward", wardSchema);

module.exports = { WardModel };
