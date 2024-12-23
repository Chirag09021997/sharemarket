const { Sequelize } = require("sequelize");
const { renderPage } = require("../controller/commonController");
const {
  market: MarketModel,
  tracking: TrackingModal,
} = require("../models/index");
const dashboard = async (req, res) => {
  try {
    const getData = await MarketModel.findAll({
      attributes: [
        "type",
        [Sequelize.fn("COUNT", Sequelize.col("type")), "count"],
      ],
      group: ["type"],
      raw: true,
    });

    const tracking = await TrackingModal.findAll({
      attributes: [
        "promotion_type",
        [Sequelize.fn("COUNT", Sequelize.col("promotion_type")), "count"],
      ],
      group: ["promotion_type"],
      raw: true,
    });
    const track_keys = tracking.map((item) => item.promotion_type);
    const track_values = tracking.map((item) => item.count);

    await renderPage(req, res, "dashboard", {
      title: "Dashboard",
      activePage: "dashboard",
      getData,
      track_keys: JSON.stringify(track_keys),
      track_values: JSON.stringify(track_values),
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { dashboard };
