const { commonService } = require("../services/index");
const { renderPage } = require("./commonController");
const { market: MarketModel } = require("../models");

// Controller Methods
const index = async (req, res) => {
  try {
    const getData = await commonService.getAll(MarketModel, {
      attributes: [
        "id",
        "symbol",
        "image",
        "image_url",
        "country",
        "industry",
        "response",
        "type",
        "subtype",
        "overview",
        "name",
        "market_type",
        "regular_market_price",
        "previous_close",
        "status",
      ],
      order: [["created_at", "DESC"]],
      where: {
        type: "cryptocurrency",
      },
    });
    renderPage(req, res, "cryptocurrency/index", {
      title: "cryptocurrency Markets",
      activePage: "cryptocurrency",
      getData,
    });
  } catch (error) {
    console.error("Error fetching cryptocurrency market data:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { index };
