const { commonService } = require("../services/index");
const { renderPage } = require("./commonController");
const { feedback: FeedBackModal } = require("../models");

// Controller Methods
const index = async (req, res) => {
  try {
    const getData = await commonService.getAll(FeedBackModal, {
      attributes: [
        "id",
        "device_id",
        "title",
        "image",
        "description",
        "status",
      ],
      order: [["created_at", "DESC"]],
    });
    renderPage(req, res, "feedback/index", {
      title: "Feed Back",
      activePage: "feedback",
      getData,
    });
  } catch (error) {
    console.error("Error fetching feedback data:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { index };
