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
        "created_at",
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

const filter = async (req, res) => {
  const {
    device_id,
    promotion_type,
    country_name,
    state_name,
    city_name,
    total_open,
  } = req.query;

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
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });
    let filteredData = getData;
    if (device_id) {
      filteredData = filteredData.filter((data) =>
        data.device_id.toLowerCase().includes(device_id.toLowerCase())
      );
    }
    if (promotion_type) {
      filteredData = filteredData.filter((data) =>
        data.promotion_type.toLowerCase().includes(promotion_type.toLowerCase())
      );
    }
    if (country_name) {
      filteredData = filteredData.filter((data) =>
        data.country_name.toLowerCase().includes(country_name.toLowerCase())
      );
    }
    if (state_name) {
      filteredData = filteredData.filter((data) =>
        data.state_name.toLowerCase().includes(state_name.toLowerCase())
      );
    }
    if (city_name) {
      filteredData = filteredData.filter((data) =>
        data.city_name.toLowerCase().includes(city_name.toLowerCase())
      );
    }
    if (total_open) {
      filteredData = filteredData.filter(
        (data) => data.total_open == total_open
      );
    }

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

module.exports = { index, filter };
