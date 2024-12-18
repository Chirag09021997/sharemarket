const { commonService } = require("../services/index");
const { renderPage } = require("./commonController");
const { tracking: TrackingModel } = require("../models");

// Controller Methods
const index = async (req, res) => {
  try {
    const getData = await commonService.getAll(TrackingModel, {
      attributes: [
        "id",
        "device_id",
        "promotion_type",
        "country_name",
        "state_name",
        "city_name",
        "total_open",
        "status",
      ],
      order: [["created_at", "DESC"]],
    });
    renderPage(req, res, "tracking/index", {
      title: "Tracking Markets",
      activePage: "tracking",
      getData,
    });
  } catch (error) {
    console.error("Error fetching tracking market data:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { index };
