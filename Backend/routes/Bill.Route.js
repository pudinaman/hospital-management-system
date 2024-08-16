const express = require("express");
const { BillModel } = require("../models/Bill.model");
const router = express.Router();

// Generate a new bill
router.post("/generate", async (req, res) => {
  const { patientID, consultationID, amount, insuranceClaim } = req.body;
  try {
    const bill = new BillModel({ patientID, consultationID, amount, insuranceClaim });
    await bill.save();
    res.status(201).send({ id: bill._id });
  } catch (error) {
    res.status(500).send({ error: "Failed to generate bill" });
  }
});

// Process payment (simplified example)
router.post("/payment", async (req, res) => {
  const { billID } = req.body;
  try {
    const bill = await BillModel.findById(billID);
    if (!bill) {
      return res.status(404).send({ message: "Bill not found" });
    }
    bill.status = "Paid";
    await bill.save();
    res.status(200).send({ message: "Payment processed" });
  } catch (error) {
    res.status(500).send({ error: "Failed to process payment" });
  }
});
module.exports = router;