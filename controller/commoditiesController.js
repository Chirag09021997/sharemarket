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
        type: "commodities",
      },
    });
    renderPage(req, res, "commodities/index", {
      title: "commodities Markets",
      activePage: "commodities",
      getData,
    });
  } catch (error) {
    console.error("Error fetching commodities market data:", error);
    res.status(500).send("Internal Server Error");
  }
};
module.exports = { index };
