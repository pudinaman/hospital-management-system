const express = require("express");
const { AmbulanceModel } = require("../models/Ambulance.model");
const { slackLogger } = require("../middlewares/webhook"); // Adjust path as needed

const router = express.Router();

router.get("/", async (req, res) => {
  let query = req.query;
  try {
    const ambulances = await AmbulanceModel.find(query);
    res.status(200).send(ambulances);
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Fetching Ambulances",
      "Failed to fetch ambulances",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/add", async (req, res) => {
  const payload = req.body;
  try {
    const ambulance = new AmbulanceModel(payload);
    await ambulance.save();
    res.send("Ambulance Added Successfully");
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Adding Ambulance",
      "Failed to add new ambulance",
      error,
      req
    );
    res.status(500).send({ error: "Failed to add ambulance" });
  }
});

router.patch("/:ambulanceId", async (req, res) => {
  const id = req.params.ambulanceId;
  const payload = req.body;
  try {
    const ambulance = await AmbulanceModel.findByIdAndUpdate(
      { _id: id },
      payload,
      { new: true } // Option to return the updated document
    );
    if (!ambulance) {
      res.status(404).send({ msg: `Ambulance with id ${id} not found` });
    } else {
      res.status(200).send(`Ambulance with id ${id} updated`);
    }
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Updating Ambulance",
      "Failed to update ambulance",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:ambulanceId", async (req, res) => {
  const id = req.params.ambulanceId;
  try {
    const ambulance = await AmbulanceModel.findByIdAndDelete({ _id: id });
    if (!ambulance) {
      res.status(404).send({ msg: `Ambulance with id ${id} not found` });
    } else {
      res.status(200).send(`Ambulance with id ${id} deleted`);
    }
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Deleting Ambulance",
      "Failed to delete ambulance",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
