const { Sequelize } = require("sequelize");
const { renderPage } = require("../controller/commonController");
const { market: MarketModel } = require("../models/index");
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
    console.log(`marketCounts => ${JSON.stringify(getData)}`);

    renderPage(req, res, "dashboard", {
      title: "Dashboard",
      activePage: "dashboard",
      getData,
    });
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { dashboard };
