const express = require("express");
const { AppointmentModel } = require("../models/Appointment.model");
const { slackLogger } = require("../middlewares/webhook"); // Adjust path as needed

const router = express.Router();

router.get("/", async (req, res) => {
  let query = req.query;
  try {
    const appointments = await AppointmentModel.find(query);
    res.status(200).send(appointments);
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Fetching Appointments",
      "Failed to fetch appointments",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/create", async (req, res) => {
  const payload = req.body;
  try {
    const appointment = new AppointmentModel(payload);
    await appointment.save();
    res.send("Appointment successfully booked.");
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Creating Appointment",
      "Failed to create appointment",
      error,
      req
    );
    res.status(400).send({ error: "Failed to create appointment" });
  }
});

router.patch("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  const payload = req.body;
  try {
    const appointment = await AppointmentModel.findByIdAndUpdate(
      { _id: id },
      payload,
      { new: true } // Option to return the updated document
    );
    if (!appointment) {
      res.status(404).send({ msg: `Appointment with id ${id} not found` });
    } else {
      res.status(200).send(`Appointment with id ${id} updated`);
    }
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Updating Appointment",
      "Failed to update appointment",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong, unable to update." });
  }
});

router.delete("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  try {
    const appointment = await AppointmentModel.findByIdAndDelete({ _id: id });
    if (!appointment) {
      res.status(404).send({ msg: `Appointment with id ${id} not found` });
    } else {
      res.status(200).send(`Appointment with id ${id} deleted`);
    }
  } catch (error) {
    console.error(error);
    await slackLogger(
      "Error Deleting Appointment",
      "Failed to delete appointment",
      error,
      req
    );
    res.status(400).send({ error: "Something went wrong, unable to delete." });
  }
});

module.exports = router;
