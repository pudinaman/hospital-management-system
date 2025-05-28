// routes/ward.routes.js

const express = require("express");
const { WardModel } = require("../models/Ward.model");
const router = express.Router();

// Add a new ward
router.post("/add", async (req, res) => {
  const { wardName, totalBeds, bedNumbers } = req.body;
  try {
    const ward = new WardModel({ wardName, totalBeds, availableBeds: totalBeds, bedNumbers });
    await ward.save();
    res.status(201).send({ id: ward._id, message: "Ward added successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to add ward" });
  }
});

// Manage bed allocation
router.patch("/:wardId/allocate-bed", async (req, res) => {
  const id = req.params.wardId;
  const { bedNumber } = req.body;
  try {
    const ward = await WardModel.findById(id);
    if (!ward) {
      return res.status(404).send({ message: "Ward not found" });
    }
    if (ward.availableBeds <= 0 || !ward.bedNumbers.includes(bedNumber)) {
      return res.status(400).send({ message: "Bed not available" });
    }
    ward.availableBeds -= 1;
    await ward.save();
    res.status(200).send({ message: "Bed allocated successfully", ward });
  } catch (error) {
    res.status(500).send({ error: "Failed to allocate bed" });
  }
});

module.exports = router;
