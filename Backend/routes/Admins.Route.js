const express = require("express");
const { AdminModel } = require("../models/Admin.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { NurseModel } = require("../models/Nurse.model");
const { DoctorModel } = require("../models/Doctor.model");
const { PatientModel } = require("../models/Patient.model");
const {slackLogger} = require("../middlewares/webhook");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const admins = await AdminModel.find();
    res.status(200).send(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    slackLogger('Error fetching admins', 'Failed to fetch admins', error, req);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  const { email } = req.body;
  try {
    const admin = await AdminModel.findOne({ email });
    if (admin) {
      return res.status(400).send({
        message: "Admin already exists",
      });
    }
    let value = new AdminModel(req.body);
    await value.save();
    const data = await AdminModel.findOne({ email });
    return res.status(201).send({ data, message: "Registered" });
  } catch (error) {
    console.error("Registration error:", error);
    slackLogger('Error registering admin', 'Failed to register admin', error, req);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { adminID, password } = req.body;
  try {
    const admin = await AdminModel.findOne({ adminID, password });

    if (admin) {
      const token = jwt.sign({ foo: "bar" }, process.env.key, {
        expiresIn: "24h",
      });
      res.send({ message: "Successful", user: admin, token: token });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.error('Login error:', error);
    slackLogger('Error logging in admin', 'Failed to log in admin', error, req);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

router.patch("/:adminId", async (req, res) => {
  const id = req.params.adminId;
  const payload = req.body;
  try {
    const admin = await AdminModel.findByIdAndUpdate({ _id: id }, payload);
    if (!admin) {
      res.status(404).send({ msg: `Admin with id ${id} not found` });
    }
    res.status(200).send(`Admin with id ${id} updated`);
  } catch (error) {
    console.error('Error updating admin:', error);
    slackLogger('Error updating admin', `Failed to update admin with ID ${id}`, error, req);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:adminId", async (req, res) => {
  const id = req.params.adminId;
  try {
    const admin = await AdminModel.findByIdAndDelete({ _id: id });
    if (!admin) {
      res.status(404).send({ msg: `Admin with id ${id} not found` });
    }
    res.status(200).send(`Admin with id ${id} deleted`);
  } catch (error) {
    console.error('Error deleting admin:', error);
    slackLogger('Error deleting admin', `Failed to delete admin with ID ${id}`, error, req);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

router.post("/password", (req, res) => {
  const { email, userId, password } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account ID and Password",
    text: `This is your User Id : ${userId} and  Password : ${password} .`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending password email:', error);
      slackLogger('Error sending password email', 'Failed to send password email', error, req);
      return res.status(500).send({ error: "Internal Server Error", details: error.message });
    }
    res.send("Password reset email sent");
  });
});

router.post("/forgot", async (req, res) => {
  const { email, type } = req.body;
  let user;
  let userId;
  let password;

  try {
    if (type == "nurse") {
      user = await NurseModel.findOne({ email });
      userId = user?.nurseID;
      password = user?.password;
    }
    if (type == "patient") {
      user = await PatientModel.findOne({ email });
      userId = user?.patientID;
      password = user?.password;
    }
    if (type == "admin") {
      user = await AdminModel.findOne({ email });
      userId = user?.adminID;
      password = user?.password;
    }
    if (type == "doctor") {
      user = await DoctorModel.findOne({ email });
      userId = user?.docID;
      password = user?.password;
    }

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Account ID and Password",
      text: `This is your User Id : ${userId} and  Password : ${password} .`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending password email:', error);
        slackLogger('Error sending password email', 'Failed to send password email', error, req);
        return res.status(500).send({ error: "Internal Server Error", details: error.message });
      }
      res.send("Password reset email sent");
    });
  } catch (error) {
    console.error('Error processing forgot password:', error);
    slackLogger('Error processing forgot password', 'Failed to process forgot password', error, req);
    res.status(500).send({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;
