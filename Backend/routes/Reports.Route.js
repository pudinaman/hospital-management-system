const express = require("express");
const { ReportModel } = require("../models/Report.model");
const { slackLogger } = require("../middlewares/webhook"); // Adjust path as needed

const router = express.Router();

router.get("/", async (req, res) => {
  let query = req.query;
  try {
    const reports = await ReportModel.find(query);
    res.status(200).send(reports);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Fetching Reports", "Failed to fetch reports data", error, req);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/create", async (req, res) => {
  const payload = req.body;
  try {
    const report = new ReportModel(payload);
    await report.save();
    res.send({ message: "Report successfully created", report });
  } catch (error) {
    console.error(error);
    await slackLogger("Error Creating Report", "Failed to create report", error, req);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.patch("/:reportId", async (req, res) => {
  const id = req.params.reportId;
  const payload = req.body;
  try {
    const report = await ReportModel.findByIdAndUpdate({ _id: id }, payload);
    if (!report) {
      return res.status(404).send({ msg: `Report with id ${id} not found` });
    }
    res.status(200).send(`Report with id ${id} updated`);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Updating Report", "Failed to update report", error, req);
    res.status(400).send({ error: "Something went wrong, unable to Update." });
  }
});

router.delete("/:reportId", async (req, res) => {
  const id = req.params.reportId;
  try {
    const report = await ReportModel.findByIdAndDelete({ _id: id });
    if (!report) {
      return res.status(404).send({ msg: `Report with id ${id} not found` });
    }
    res.status(200).send(`Report with id ${id} deleted`);
  } catch (error) {
    console.error(error);
    await slackLogger("Error Deleting Report", "Failed to delete report", error, req);
    res.status(400).send({ error: "Something went wrong, unable to Delete." });
  }
});

module.exports = router;
